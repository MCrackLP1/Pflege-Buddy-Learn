/**
 * Calculate ranked mode score for a question attempt
 * Formula: Correct = (difficulty * 100) + timeBonus - hintPenalty, Wrong = -(difficulty * 50)
 */
export function calculateRankedScore(
  difficulty: number,
  timeMs: number,
  usedHints: number,
  isCorrect: boolean
): number {
  if (isCorrect) {
    const baseScore = difficulty * 100;
    const timeBonus = Math.max(0, 20000 - timeMs) / 200; // Max 100 bonus for answering in < 20s
    const hintPenalty = usedHints * 25;
    return Math.round(baseScore + timeBonus - hintPenalty);
  } else {
    // Wrong answer: lose points based on difficulty
    return -(difficulty * 50); // Lose half the base score for wrong answers
  }
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correctAnswers: number, totalAnswers: number): number {
  if (totalAnswers === 0) return 0;
  return Math.round((correctAnswers / totalAnswers) * 10000) / 100; // 2 decimal places
}

/**
 * Calculate average time per question
 */
export function calculateAverageTime(totalTimeMs: number, questionCount: number): number {
  if (questionCount === 0) return 0;
  return Math.round(totalTimeMs / questionCount);
}
