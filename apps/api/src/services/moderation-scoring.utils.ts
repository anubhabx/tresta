export function calculateQualityScore(
  content: string,
  rating?: number,
  isOAuthVerified?: boolean,
): number {
  let score = 0.5;

  const length = content.length;
  if (length >= 50 && length <= 500) {
    score += 0.2;
  } else if (length > 500 && length <= 1000) {
    score += 0.1;
  } else if (length < 20) {
    score -= 0.3;
  }

  if (rating) {
    if (rating >= 4) {
      score += 0.2;
    } else if (rating <= 2) {
      score -= 0.1;
    }
  }

  if (isOAuthVerified) {
    score += 0.2;
  }

  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 10 && wordCount <= 200) {
    score += 0.1;
  } else if (wordCount < 5) {
    score -= 0.2;
  }

  return Math.max(0, Math.min(1, score));
}

export function checkDuplicateContent(
  newContent: string,
  existingContents: string[],
  similarityThreshold = 0.9,
): { isDuplicate: boolean; matchedIndex?: number; similarity?: number } {
  const normalizedNew = newContent.toLowerCase().trim();

  const exactMatch = existingContents.findIndex(
    (content) => content.toLowerCase().trim() === normalizedNew,
  );
  if (exactMatch !== -1) {
    return { isDuplicate: true, matchedIndex: exactMatch, similarity: 1 };
  }

  for (let i = 0; i < existingContents.length; i++) {
    const existingContent = existingContents[i];
    if (!existingContent) continue;

    const similarity = calculateSimilarity(
      normalizedNew,
      existingContent.toLowerCase().trim(),
    );
    if (similarity >= similarityThreshold) {
      return { isDuplicate: true, matchedIndex: i, similarity };
    }
  }

  return { isDuplicate: false };
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

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

        if (
          prevDiag !== undefined &&
          currentPrev !== undefined &&
          prevSame !== undefined
        ) {
          currentRow[j] = Math.min(prevDiag + 1, currentPrev + 1, prevSame + 1);
        }
      }
    }
  }

  const lastRow = matrix[str2.length];
  const result = lastRow?.[str1.length];
  return result ?? 0;
}