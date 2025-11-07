/**
 * Auto-Moderation Service
 * 
 * Heuristic-based content moderation for testimonials.
 * Future: Can be enhanced with AI moderation APIs (OpenAI, Perspective API)
 */

interface ModerationResult {
  status: 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'PENDING';
  score: number; // 0-1, higher = more likely spam/inappropriate
  flags: string[];
  autoPublish: boolean;
}

interface ModerationConfig {
  autoModeration: boolean;
  autoApproveVerified: boolean;
  profanityFilterLevel: 'STRICT' | 'MODERATE' | 'LENIENT';
  moderationSettings?: {
    minContentLength?: number;
    maxUrlCount?: number;
    allowedDomains?: string[];
    blockedDomains?: string[];
    customProfanityList?: string[];
    brandKeywords?: string[]; // For detecting excessive brand mentions (spam indicator)
    averageRating?: number; // Project average rating for deviation detection
    existingContents?: string[]; // Existing testimonial contents for duplicate detection
  };
}

// Enhanced profanity lists by severity (expanded from open-source datasets)
// Sources: Shutterstock GitHub, Kaggle profanity datasets
const PROFANITY_SEVERE = [
  // Original severe terms
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy', 'cock', 
  'whore', 'slut', 'fag', 'piss',
  // Hate speech additions
  'nigger', 'nigga', 'retard', 'kike', 'chink', 'spic', 'beaner', 'wetback',
  // International/variant profanity
  'wanker', 'bollocks', 'twat', 'prick', 'bugger', 'arse', 'tosser', 'bellend',
  'knobhead', 'minger', 'git', 'pillock', 'plonker', 'wazzock', 'numpty',
  // Sex-related severe
  'fucked', 'fucking', 'motherfucker', 'fuckhead', 'shithead', 'bullshit',
  'horseshit', 'dipshit', 'jackass', 'dumbass', 'badass', 'fatass',
  // Slurs and derogatory
  'faggot', 'dyke', 'tranny', 'shemale', 'raghead', 'towelhead', 'gook',
  // Anatomical vulgar
  'titties', 'boobs', 'penis', 'vagina', 'anal', 'anus', 'scrotum',
  // Action-based vulgar
  'pissed', 'pissing', 'shitting', 'screwed', 'humping', 'bonking'
];

const PROFANITY_MILD = [
  // Mild profanity
  'hell', 'ass', 'suck', 'stupid', 'idiot', 'dumb', 'jerk', 'crap', 'damn',
  'frig', 'darn', 'bloody', 'knob', 'git', 'sucks', 'sucked', 'sucking',
  // Mild insults
  'moron', 'imbecile', 'fool', 'loser', 'lame', 'pathetic', 'wimpy',
  'dork', 'nerd', 'geek', 'freak', 'weirdo', 'creep', 'creepy',
  // Mild anatomical
  'butt', 'booty', 'booger', 'fart', 'poop', 'pee', 'turd',
  // British mild
  'blimey', 'crikey', 'sod', 'naff', 'pants', 'rubbish', 'codswallop'
];

// Obfuscation patterns for leet speak and character substitutions
const OBFUSCATION_REPLACEMENTS: { [key: string]: string[] } = {
  'a': ['@', '4', 'α', 'а', 'á', 'à', 'â', 'ä', 'ã', 'å'],
  'e': ['3', '€', 'е', 'é', 'è', 'ê', 'ë'],
  'i': ['1', '!', 'і', 'í', 'ì', 'î', 'ï', '|'],
  'o': ['0', 'ο', 'о', 'ó', 'ò', 'ô', 'ö', 'õ'],
  's': ['$', '5', 'ѕ', 'ś', 'š', 'ş', 'ß'],
  't': ['7', '+', 'τ', '†'],
  'b': ['8', 'β', 'в'],
  'g': ['9', '6'],
  'l': ['1', '|', 'ι'],
  'z': ['2'],
  'c': ['(', '<', 'ç'],
  'u': ['υ', 'ù', 'ú', 'û', 'ü'],
  'n': ['ñ'],
};

// Spam patterns
const SPAM_PHRASES = [
  'buy now', 'click here', 'limited time offer', 'act now',
  'call now', 'order now', 'visit now', 'free money',
  'make money fast', 'work from home', 'earn extra cash',
  'no credit check', 'viagra', 'cialis', 'weight loss',
  'lose weight fast', 'get paid', 'cash bonus'
];

// Negative sentiment keywords (weighted by severity)
const NEGATIVE_KEYWORDS_SEVERE = [
  'scam', 'fraud', 'ripoff', 'rip-off', 'theft', 'steal', 'stolen',
  'illegal', 'lawsuit', 'sue', 'lawyer'
];

const NEGATIVE_KEYWORDS_STRONG = [
  'terrible', 'awful', 'horrible', 'worst', 'disgusting', 'pathetic',
  'garbage', 'trash', 'hate', 'never again', 'avoid', 'waste of money'
];

const NEGATIVE_KEYWORDS_MODERATE = [
  'bad', 'poor', 'disappointing', 'disappointed', 'unhappy', 'unsatisfied',
  'mediocre', 'subpar', 'inadequate', 'lacking'
];

// Positive sentiment keywords for balance
const POSITIVE_KEYWORDS = [
  'excellent', 'amazing', 'outstanding', 'fantastic', 'wonderful',
  'great', 'awesome', 'perfect', 'love', 'highly recommend',
  'best', 'brilliant', 'superb', 'exceptional', 'impressed'
];

// Disposable email domains
const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'temp-mail.org', 'guerrillamail.com',
  '10minutemail.com', 'throwaway.email', 'tempmail.com',
  'sharklasers.com', 'yopmail.com', 'maildrop.cc'
];

/**
 * Detect obfuscated profanity using normalization techniques
 * Handles leet speak (f@ck), repetitions (shiiiit), insertions (s.h.i.t), emojis
 */
function detectObfuscation(text: string, word: string): boolean {
  let normalized = text.toLowerCase();
  
  // Step 1: Collapse repeated characters (e.g., "biiiitch" -> "bitch")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
  
  // Step 2: Replace leet speak and special characters
  for (const [char, replacements] of Object.entries(OBFUSCATION_REPLACEMENTS)) {
    replacements.forEach(rep => {
      const escapedRep = rep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      normalized = normalized.replace(new RegExp(escapedRep, 'gi'), char);
    });
  }
  
  // Step 3: Remove spaces, dots, dashes, underscores between letters (e.g., "f.u.c.k" -> "fuck")
  normalized = normalized.replace(/([a-z])[.\s_-]+([a-z])/gi, '$1$2');
  
  // Step 4: Remove all remaining special characters and emojis
  normalized = normalized.replace(/[^a-z0-9\s]/g, '');
  
  // Step 5: Check if the word exists in normalized text
  return new RegExp(`\\b${word}\\b`, 'i').test(normalized);
}

/**
 * Check if text contains profanity with obfuscation detection
 */
function containsProfanity(
  text: string,
  level: 'STRICT' | 'MODERATE' | 'LENIENT',
  customList?: string[]
): { found: boolean; words: string[]; intensity: 'severe' | 'mild' | 'none' } {
  const lowerText = text.toLowerCase();
  let profanityList: string[] = [];
  let intensity: 'severe' | 'mild' | 'none' = 'none';

  switch (level) {
    case 'STRICT':
      profanityList = [...PROFANITY_SEVERE, ...PROFANITY_MILD];
      break;
    case 'MODERATE':
      profanityList = PROFANITY_SEVERE;
      break;
    case 'LENIENT':
      profanityList = []; // Only custom list
      break;
  }

  if (customList) {
    profanityList = [...profanityList, ...customList];
  }

  // Use obfuscation detection for each word
  const foundWords = profanityList.filter(word => detectObfuscation(lowerText, word));
  
  if (foundWords.length > 0) {
    const hasSevere = foundWords.some(w => PROFANITY_SEVERE.includes(w));
    intensity = hasSevere ? 'severe' : 'mild';
  }

  return { found: foundWords.length > 0, words: foundWords, intensity };
}

/**
 * Check for spam indicators with advanced heuristics
 * Based on research from IJCAI/ResearchGate spam detection papers
 */
function checkSpamIndicators(
  text: string, 
  email?: string, 
  rating?: number, 
  averageRating?: number,
  config?: ModerationConfig
): {
  isSpam: boolean;
  indicators: string[];
} {
  const indicators: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for spam phrases
  const foundSpamPhrases = SPAM_PHRASES.filter(phrase =>
    lowerText.includes(phrase.toLowerCase())
  );
  if (foundSpamPhrases.length > 0) {
    indicators.push(`Contains spam phrases: ${foundSpamPhrases.slice(0, 2).join(', ')}${foundSpamPhrases.length > 2 ? '...' : ''}`);
  }

  // Check for URLs with domain validation
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = text.match(urlRegex) || [];
  const maxUrls = config?.moderationSettings?.maxUrlCount ?? 2;
  
  if (urls.length > maxUrls) {
    indicators.push(`Excessive URLs (${urls.length} > ${maxUrls})`);
  }
  
  // Check for disallowed domains
  if (config?.moderationSettings?.allowedDomains && urls.length > 0) {
    const allowedDomains = config.moderationSettings.allowedDomains;
    const disallowedUrls = urls.filter(url => 
      !allowedDomains.some(domain => url.toLowerCase().includes(domain.toLowerCase()))
    );
    if (disallowedUrls.length > 0) {
      indicators.push(`Disallowed domains in URLs: ${disallowedUrls.slice(0, 2).join(', ')}${disallowedUrls.length > 2 ? '...' : ''}`);
    }
  }

  // Check for all caps (>80% uppercase letters)
  const letters = text.replace(/[^a-zA-Z]/g, '');
  const upperCaseCount = text.replace(/[^A-Z]/g, '').length;
  if (letters.length > 20 && upperCaseCount / letters.length > 0.8) {
    indicators.push('Excessive capitalization (>80% uppercase)');
  }

  // Check for excessive special characters
  const specialChars = text.replace(/[a-zA-Z0-9\s]/g, '');
  if (text.length > 20 && specialChars.length / text.length > 0.3) {
    indicators.push('Excessive special characters (>30%)');
  }

  // Check for repeated characters (e.g., "aaaaaa", "!!!!!!")
  const repeatedPattern = /(.)\1{5,}/g;
  if (repeatedPattern.test(text)) {
    indicators.push('Contains repeated characters');
  }

  // Check for disposable email
  if (email) {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
      indicators.push(`Disposable email domain: ${emailDomain}`);
    }
  }

  // NEW: Pronoun ratio analysis (spam often uses 'you' for promotional language)
  // Based on research: spam reviews have high second-person pronoun usage
  const firstPerson = (text.match(/\b(i|me|my|mine|myself)\b/gi) || []).length;
  const secondPerson = (text.match(/\b(you|your|yours|yourself)\b/gi) || []).length;
  const totalPronouns = firstPerson + secondPerson;
  
  if (totalPronouns > 0) {
    const pronounRatio = secondPerson / totalPronouns;
    if (pronounRatio > 0.6 && secondPerson >= 3) { // Threshold: >60% second-person with at least 3 instances
      indicators.push(`High second-person pronoun ratio (${(pronounRatio * 100).toFixed(0)}% - promotional language)`);
    }
  }

  // NEW: Rating deviation check (spam often has extreme ratings)
  // Based on research: fake reviews deviate significantly from average
  if (rating !== undefined && averageRating !== undefined && averageRating > 0) {
    const deviation = Math.abs(rating - averageRating);
    if (deviation > 2) { // Deviation > 2 stars is suspicious
      indicators.push(`High rating deviation (+${deviation.toFixed(1)} from average ${averageRating.toFixed(1)})`);
    }
  }

  // NEW: Brand/product mention frequency (over-mentioning suggests promotional content)
  // Based on research: fake reviews excessively repeat brand names
  if (config?.moderationSettings?.brandKeywords && config.moderationSettings.brandKeywords.length > 0) {
    const brandKeywords = config.moderationSettings.brandKeywords;
    const wordCount = text.split(/\s+/).length;
    
    const totalMentions = brandKeywords.reduce((count, keyword) => {
      const mentions = (lowerText.match(new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi')) || []).length;
      return count + mentions;
    }, 0);
    
    const mentionRatio = totalMentions / (wordCount + 1); // +1 to avoid divide by zero
    if (mentionRatio > 0.15 && totalMentions >= 3) { // >15% of words are brand mentions, minimum 3
      indicators.push(`Excessive brand mentions (${totalMentions} times, ${(mentionRatio * 100).toFixed(0)}% of content)`);
    }
  }

  // NEW: Sentiment imbalance (extremely positive without nuance)
  // Genuine reviews usually have some balanced commentary
  const extremePositive = ['perfect', 'flawless', 'best ever', 'amazing', 'incredible', 'outstanding'];
  const positiveCount = extremePositive.filter(word => lowerText.includes(word)).length;
  const wordCount = text.split(/\s+/).length;
  
  if (positiveCount >= 3 && wordCount < 50) {
    indicators.push(`Unnatural sentiment (${positiveCount} extreme positive words in short text)`);
  }

  return {
    isSpam: indicators.length >= 2, // Flag as spam if 2+ indicators
    indicators
  };
}

/**
 * Find keywords with negation detection
 * Checks a 3-word window before each keyword for negators
 * Based on VADER-like sentiment analysis rules
 * 
 * @param tokens - Text split into word tokens
 * @param keywords - Keywords to search for
 * @param negators - Negation words (not, no, never, etc.)
 * @param isPositive - Whether keywords are positive (affects negation handling)
 * @returns Found keywords and whether any were negated
 */
function findKeywordsWithNegation(
  tokens: string[], 
  keywords: string[], 
  negators: string[], 
  isPositive = false
): { found: string[]; negated: boolean } {
  const found: string[] = [];
  let negated = false;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token && keywords.includes(token)) {
      found.push(token);
      
      // Check 3-word window before current word for negators
      const windowStart = Math.max(0, i - 3);
      for (let j = windowStart; j < i; j++) {
        const windowToken = tokens[j];
        if (windowToken && negators.includes(windowToken)) {
          negated = true;
          break;
        }
      }
    }
  }
  
  return { found, negated };
}

/**
 * Advanced sentiment analysis with negation detection
 * Inspired by VADER (Valence Aware Dictionary and sEntiment Reasoner) rules
 * Handles negation context like "not great" → negative sentiment
 * 
 * Improves accuracy by 10-15% for informal text (research: DataCamp/Thematic)
 */
function analyzeSentiment(text: string): {
  score: number; // -1 to 1 (negative to positive)
  sentiment: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  negativeKeywords: string[];
  positiveKeywords: string[];
} {
  const lowerText = text.toLowerCase();
  const tokens = lowerText.split(/\s+/); // Tokenize by whitespace
  let score = 0;
  
  // Negation words (inspired by VADER)
  const negators = ['not', 'no', 'never', 'none', 'hardly', 'scarcely', 'barely', 'neither', 'nor'];
  
  // Find keywords with negation context
  const severeNegative = findKeywordsWithNegation(tokens, NEGATIVE_KEYWORDS_SEVERE, negators, false);
  const strongNegative = findKeywordsWithNegation(tokens, NEGATIVE_KEYWORDS_STRONG, negators, false);
  const moderateNegative = findKeywordsWithNegation(tokens, NEGATIVE_KEYWORDS_MODERATE, negators, false);
  const positiveFound = findKeywordsWithNegation(tokens, POSITIVE_KEYWORDS, negators, true);
  
  // Calculate weighted score with negation handling
  // Negation flips polarity: "not terrible" becomes less negative, "not great" becomes negative
  
  // For negative keywords: negation reduces their negative impact (flips polarity)
  score -= severeNegative.found.length * 0.4 * (severeNegative.negated ? -1 : 1);
  score -= strongNegative.found.length * 0.25 * (strongNegative.negated ? -1 : 1);
  score -= moderateNegative.found.length * 0.15 * (moderateNegative.negated ? -1 : 1);
  
  // For positive keywords: negation flips them to negative
  // e.g., "not great", "not amazing" becomes negative sentiment
  score += positiveFound.found.length * 0.2 * (positiveFound.negated ? -1 : 1);
  
  // Normalize to -1 to 1 range
  score = Math.max(-1, Math.min(1, score));
  
  // Determine sentiment category with balanced thresholds
  let sentiment: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  if (score <= -0.6) sentiment = 'very_negative';
  else if (score <= -0.2) sentiment = 'negative';
  else if (score >= 0.4) sentiment = 'very_positive';
  else if (score >= 0.1) sentiment = 'positive';
  else sentiment = 'neutral';
  
  // Collect all found keywords
  const allNegative = [...severeNegative.found, ...strongNegative.found, ...moderateNegative.found];
  
  return {
    score,
    sentiment,
    negativeKeywords: allNegative,
    positiveKeywords: positiveFound.found
  };
}

/**
 * Check for negative sentiment (deprecated - use analyzeSentiment instead)
 */
function checkNegativeSentiment(text: string): {
  isNegative: boolean;
  keywords: string[];
} {
  const analysis = analyzeSentiment(text);
  return {
    isNegative: analysis.sentiment === 'very_negative' || analysis.sentiment === 'negative',
    keywords: analysis.negativeKeywords
  };
}

/**
 * Calculate quality score (0-1, higher = better quality)
 */
function calculateQualityScore(
  content: string,
  rating?: number,
  isOAuthVerified?: boolean
): number {
  let score = 0.5; // Start neutral

  // Length score (ideal: 50-500 characters)
  const length = content.length;
  if (length >= 50 && length <= 500) {
    score += 0.2;
  } else if (length > 500 && length <= 1000) {
    score += 0.1;
  } else if (length < 20) {
    score -= 0.3;
  }

  // Rating score
  if (rating) {
    if (rating >= 4) {
      score += 0.2;
    } else if (rating <= 2) {
      score -= 0.1;
    }
  }

  // OAuth verification bonus
  if (isOAuthVerified) {
    score += 0.2;
  }

  // Word count (ideal: 10-200 words)
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 10 && wordCount <= 200) {
    score += 0.1;
  } else if (wordCount < 5) {
    score -= 0.2;
  }

  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, score));
}

/**
 * Main moderation function
 */
export async function moderateTestimonial(
  content: string,
  email: string | undefined,
  rating: number | undefined,
  isOAuthVerified: boolean,
  config: ModerationConfig
): Promise<ModerationResult> {
  const flags: string[] = [];
  let status: ModerationResult['status'] = 'PENDING';
  let autoPublish = false;

  // Skip moderation if disabled
  if (!config.autoModeration) {
    return {
      status: 'PENDING',
      score: 0,
      flags: [],
      autoPublish: false
    };
  }

  // Check minimum length
  const minLength = config.moderationSettings?.minContentLength || 10;
  if (content.length < minLength) {
    flags.push(`Content too short (< ${minLength} characters)`);
    status = 'REJECTED';
  }

  // Check profanity
  const profanityCheck = containsProfanity(
    content,
    config.profanityFilterLevel,
    config.moderationSettings?.customProfanityList
  );
  if (profanityCheck.found) {
    flags.push(`Contains profanity: ${profanityCheck.words.join(', ')}`);
    status = 'REJECTED';
  }

  // Check spam indicators
  const spamCheck = checkSpamIndicators(content, email);
  if (spamCheck.isSpam) {
    flags.push(...spamCheck.indicators);
    status = 'REJECTED';
  } else if (spamCheck.indicators.length > 0) {
    flags.push(...spamCheck.indicators);
    status = status === 'PENDING' ? 'FLAGGED' : status;
  }

  // Advanced sentiment analysis
  const sentimentAnalysis = analyzeSentiment(content);
  if (sentimentAnalysis.sentiment === 'very_negative') {
    flags.push(`Very negative sentiment detected: ${sentimentAnalysis.negativeKeywords.slice(0, 3).join(', ')}`);
    status = 'REJECTED';
  } else if (sentimentAnalysis.sentiment === 'negative') {
    flags.push(`Negative sentiment: ${sentimentAnalysis.negativeKeywords.slice(0, 3).join(', ')}`);
    status = status === 'PENDING' ? 'FLAGGED' : status;
  }
  
  // Bonus for positive sentiment
  if (sentimentAnalysis.sentiment === 'very_positive' || sentimentAnalysis.sentiment === 'positive') {
    flags.push(`Positive sentiment detected (${sentimentAnalysis.positiveKeywords.length} positive indicators)`);
  }

  // Check blocked domains
  if (email && config.moderationSettings?.blockedDomains) {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (emailDomain && config.moderationSettings.blockedDomains.includes(emailDomain)) {
      flags.push(`Blocked email domain: ${emailDomain}`);
      status = 'REJECTED';
    }
  }

  // Calculate quality score
  const qualityScore = calculateQualityScore(content, rating, isOAuthVerified);

  // Auto-approve logic
  if (status === 'PENDING' && flags.length === 0) {
    if (isOAuthVerified && config.autoApproveVerified) {
      // Auto-approve verified users
      status = 'APPROVED';
      autoPublish = true;
      flags.push('Auto-approved: OAuth verified');
    } else if (qualityScore >= 0.8 && rating && rating >= 4) {
      // Auto-approve high-quality testimonials
      status = 'APPROVED';
      autoPublish = true;
      flags.push('Auto-approved: High quality score');
    }
  }

  return {
    status,
    score: 1 - qualityScore, // Invert score (higher = more likely spam)
    flags,
    autoPublish
  };
}

/**
 * Check for duplicate content
 * Simple implementation using exact match and similarity threshold
 */
export function checkDuplicateContent(
  newContent: string,
  existingContents: string[],
  similarityThreshold = 0.9
): { isDuplicate: boolean; matchedIndex?: number; similarity?: number } {
  const normalizedNew = newContent.toLowerCase().trim();

  // Check exact match
  const exactMatch = existingContents.findIndex(
    content => content.toLowerCase().trim() === normalizedNew
  );
  if (exactMatch !== -1) {
    return { isDuplicate: true, matchedIndex: exactMatch, similarity: 1 };
  }

  // Check similarity (simple character-based approach)
  for (let i = 0; i < existingContents.length; i++) {
    const existingContent = existingContents[i];
    if (!existingContent) continue;
    
    const similarity = calculateSimilarity(normalizedNew, existingContent.toLowerCase().trim());
    if (similarity >= similarityThreshold) {
      return { isDuplicate: true, matchedIndex: i, similarity };
    }
  }

  return { isDuplicate: false };
}

/**
 * Calculate similarity between two strings (Levenshtein distance-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    const row = matrix[0];
    if (row) {
      row[j] = j;
    }
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      const currentRow = matrix[i];
      const prevRow = matrix[i - 1];
      
      if (!currentRow || !prevRow) continue;

      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        const prevDiag = prevRow[j - 1];
        if (prevDiag !== undefined) {
          currentRow[j] = prevDiag;
        }
      } else {
        const prevDiag = prevRow[j - 1];
        const currentPrev = currentRow[j - 1];
        const prevSame = prevRow[j];
        
        if (prevDiag !== undefined && currentPrev !== undefined && prevSame !== undefined) {
          currentRow[j] = Math.min(
            prevDiag + 1,
            currentPrev + 1,
            prevSame + 1
          );
        }
      }
    }
  }

  const lastRow = matrix[str2.length];
  const result = lastRow?.[str1.length];
  return result ?? 0;
}
