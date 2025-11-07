/**
 * Test examples for enhanced profanity and spam detection
 * Run this file to test obfuscation detection and spam heuristics
 */

import { moderateTestimonial } from './moderation.service.js';

// Test cases for obfuscation detection
const profanityTests = [
  // Standard profanity
  { text: 'This product is fucking amazing!', expected: 'severe' },
  { text: 'This is such bullshit', expected: 'severe' },
  
  // Leet speak obfuscation
  { text: 'This is f@cking great!', expected: 'severe' },
  { text: 'Wh@t the h3ll is this?', expected: 'mild' },
  { text: 'This 5ucks so bad', expected: 'mild' },
  { text: '$hit product', expected: 'severe' },
  
  // Repetition obfuscation
  { text: 'This is shiiiiiit', expected: 'severe' },
  { text: 'Fuuuuuck this', expected: 'severe' },
  { text: 'So stuuuupid', expected: 'mild' },
  
  // Insertion obfuscation
  { text: 'f.u.c.k this product', expected: 'severe' },
  { text: 's-h-i-t quality', expected: 'severe' },
  { text: 'b_i_t_c_h please', expected: 'severe' },
  
  // Mixed obfuscation
  { text: 'F@@@cking sh!!!!t', expected: 'severe' },
  { text: '$h1t product', expected: 'severe' },
  { text: '@$$h0le company', expected: 'severe' },
  
  // Clean text (should not be flagged)
  { text: 'This is an amazing product!', expected: 'none' },
  { text: 'Great service, highly recommend!', expected: 'none' },
  { text: 'I love this company!', expected: 'none' },
];

// Test cases for spam heuristics
const spamTests = [
  // Pronoun ratio (promotional language)
  { 
    text: 'You should buy this now! You will love it! Your life will change!',
    description: 'High second-person pronoun ratio',
    shouldFlag: true
  },
  
  // Brand mentions
  {
    text: 'Acme Acme Acme! Best Acme product ever! Acme is amazing!',
    description: 'Excessive brand mentions',
    config: { brandKeywords: ['acme'] },
    shouldFlag: true
  },
  
  // Sentiment imbalance
  {
    text: 'Perfect amazing incredible outstanding!',
    description: 'Unnatural sentiment (too many extreme positives)',
    shouldFlag: true
  },
  
  // Rating deviation
  {
    text: 'This is okay I guess',
    rating: 5,
    averageRating: 2.5,
    description: 'High rating deviation',
    shouldFlag: true
  },
  
  // URL spam
  {
    text: 'Check out https://spam.com and https://more-spam.com and https://even-more.com',
    description: 'Excessive URLs',
    shouldFlag: true
  },
  
  // Legitimate review (should not flag)
  {
    text: 'I really enjoyed using this product. The quality exceeded my expectations and customer service was helpful when I had questions.',
    rating: 4,
    averageRating: 4.2,
    description: 'Legitimate balanced review',
    shouldFlag: false
  },
  
  // Duplicate content
  {
    text: 'This product is amazing and I love it!',
    description: 'Duplicate content detection',
    config: { 
      existingContents: [
        'This product is amazing and I love it!', // Exact duplicate
        'Great service!',
        'Not bad at all'
      ] 
    },
    shouldFlag: true
  },
];

// Test cases for negation detection in sentiment analysis
const negationTests = [
  // Negated positive → should be negative
  { text: 'This is not great at all', expectedSentiment: 'negative', description: 'Negated positive (not great)' },
  { text: 'Not amazing, not wonderful, not good', expectedSentiment: 'negative', description: 'Multiple negated positives' },
  { text: 'The product is hardly excellent', expectedSentiment: 'negative', description: 'Negation with "hardly"' },
  
  // Negated negative → should be positive/neutral
  { text: 'Not terrible, not bad at all', expectedSentiment: 'neutral', description: 'Negated negatives (not terrible)' },
  { text: 'Never awful, never horrible', expectedSentiment: 'neutral', description: 'Negated severe negatives' },
  
  // No negation - standard positive
  { text: 'This is great and amazing!', expectedSentiment: 'positive', description: 'Standard positive sentiment' },
  { text: 'Excellent product, highly recommend', expectedSentiment: 'very_positive', description: 'Strong positive sentiment' },
  
  // No negation - standard negative  
  { text: 'This is terrible and awful', expectedSentiment: 'very_negative', description: 'Strong negative sentiment' },
  { text: 'Bad quality, disappointing', expectedSentiment: 'negative', description: 'Standard negative sentiment' },
  
  // Mixed with negation context
  { text: 'Not bad, but not great either', expectedSentiment: 'neutral', description: 'Mixed negation (balanced)' },
  { text: 'The service was barely acceptable', expectedSentiment: 'negative', description: 'Negation weakening positive' },
];

async function runProfanityTests() {
  console.log('🧪 Testing Enhanced Profanity Detection\n');
  console.log('═'.repeat(80));
  
  const config = {
    autoModeration: true,
    autoApproveVerified: false,
    profanityFilterLevel: 'MODERATE' as const,
  };
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of profanityTests) {
    const result = await moderateTestimonial(
      testCase.text,
      undefined,
      undefined,
      false,
      config
    );
    
    const hasFlags = result.flags.length > 0;
    const flagText = result.flags.join(', ');
    
    // Determine actual intensity from flags
    let actualIntensity = 'none';
    if (flagText.toLowerCase().includes('severe profanity')) {
      actualIntensity = 'severe';
    } else if (flagText.toLowerCase().includes('mild profanity')) {
      actualIntensity = 'mild';
    }
    
    const testPassed = actualIntensity === testCase.expected;
    
    if (testPassed) {
      passed++;
      console.log(`✅ PASS: "${testCase.text}"`);
    } else {
      failed++;
      console.log(`❌ FAIL: "${testCase.text}"`);
      console.log(`   Expected: ${testCase.expected}, Got: ${actualIntensity}`);
    }
    
    if (hasFlags) {
      console.log(`   Flags: ${flagText}`);
    }
    console.log('');
  }
  
  console.log('═'.repeat(80));
  console.log(`\n📊 Profanity Detection: ${passed} passed, ${failed} failed (${profanityTests.length} total)`);
  console.log(`Success rate: ${((passed / profanityTests.length) * 100).toFixed(1)}%\n`);
  
  return { passed, failed, total: profanityTests.length };
}

async function runSpamTests() {
  console.log('\n🕵️  Testing Advanced Spam Detection Heuristics\n');
  console.log('═'.repeat(80));
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of spamTests) {
    const config = {
      autoModeration: true,
      autoApproveVerified: false,
      profanityFilterLevel: 'MODERATE' as const,
      moderationSettings: {
        ...(testCase.config || {}),
        averageRating: testCase.averageRating
      },
    };
    
    const result = await moderateTestimonial(
      testCase.text,
      undefined,
      testCase.rating,
      false,
      config
    );
    
    const hasSpamFlags = result.flags.some(f => 
      f.toLowerCase().includes('pronoun') ||
      f.toLowerCase().includes('brand') ||
      f.toLowerCase().includes('sentiment') ||
      f.toLowerCase().includes('deviation') ||
      f.toLowerCase().includes('url')
    );
    
    const testPassed = hasSpamFlags === testCase.shouldFlag;
    
    if (testPassed) {
      passed++;
      console.log(`✅ PASS: ${testCase.description}`);
    } else {
      failed++;
      console.log(`❌ FAIL: ${testCase.description}`);
      console.log(`   Expected spam detection: ${testCase.shouldFlag}, Got: ${hasSpamFlags}`);
    }
    
    if (result.flags.length > 0) {
      console.log(`   Flags: ${result.flags.join(', ')}`);
    }
    console.log(`   Status: ${result.status}`);
    console.log('');
  }
  
  console.log('═'.repeat(80));
  console.log(`\n📊 Spam Detection: ${passed} passed, ${failed} failed (${spamTests.length} total)`);
  console.log(`Success rate: ${((passed / spamTests.length) * 100).toFixed(1)}%\n`);
  
  return { passed, failed, total: spamTests.length };
}

async function runNegationTests() {
  console.log('\n🔄 Testing Negation Detection in Sentiment Analysis\n');
  console.log('═'.repeat(80));
  
  const config = {
    autoModeration: true,
    autoApproveVerified: false,
    profanityFilterLevel: 'MODERATE' as const,
  };
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of negationTests) {
    const result = await moderateTestimonial(
      testCase.text,
      undefined,
      undefined,
      false,
      config
    );
    
    // Extract sentiment from flags
    let detectedSentiment: string | undefined;
    result.flags.forEach(flag => {
      if (flag.toLowerCase().includes('very negative')) detectedSentiment = 'very_negative';
      else if (flag.toLowerCase().includes('negative sentiment')) detectedSentiment = 'negative';
      else if (flag.toLowerCase().includes('very_positive') || flag.toLowerCase().includes('very positive')) detectedSentiment = 'very_positive';
      else if (flag.toLowerCase().includes('positive sentiment')) detectedSentiment = 'positive';
    });
    
    // If no sentiment flags, it's neutral or positive (no flags for neutral/positive usually)
    if (!detectedSentiment) {
      detectedSentiment = 'neutral';
    }
    
    const testPassed = detectedSentiment === testCase.expectedSentiment;
    
    if (testPassed) {
      passed++;
      console.log(`✅ PASS: ${testCase.description}`);
    } else {
      failed++;
      console.log(`❌ FAIL: ${testCase.description}`);
      console.log(`   Expected: ${testCase.expectedSentiment}, Got: ${detectedSentiment}`);
    }
    
    if (result.flags.length > 0) {
      console.log(`   Flags: ${result.flags.join(', ')}`);
    }
    console.log('');
  }
  
  console.log('═'.repeat(80));
  console.log(`\n📊 Negation Detection: ${passed} passed, ${failed} failed (${negationTests.length} total)`);
  console.log(`Success rate: ${((passed / negationTests.length) * 100).toFixed(1)}%\n`);
  
  return { passed, failed, total: negationTests.length };
}

async function runAllTests() {
  const profanityResults = await runProfanityTests();
  const spamResults = await runSpamTests();
  const negationResults = await runNegationTests();
  
  const totalPassed = profanityResults.passed + spamResults.passed + negationResults.passed;
  const totalFailed = profanityResults.failed + spamResults.failed + negationResults.failed;
  const totalTests = profanityResults.total + spamResults.total + negationResults.total;
  
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 OVERALL RESULTS');
  console.log('═'.repeat(80));
  console.log(`Total: ${totalPassed} passed, ${totalFailed} failed (${totalTests} total)`);
  console.log(`Overall success rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  console.log('');
}

// Uncomment to run tests
// runAllTests().catch(console.error);

export { runAllTests, runProfanityTests, runSpamTests, runNegationTests, profanityTests, spamTests, negationTests };
