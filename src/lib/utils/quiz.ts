import { APP_CONFIG } from '@/lib/constants';
import type { QuestionWithChoices } from '@/lib/db/schema';

/**
 * Calculate XP gained for a correct answer
 */
export function calculateXP(
  difficulty: number,
  hintsUsed: number,
  timeMs: number
): number {
  const baseXP = difficulty * APP_CONFIG.GAMIFICATION.XP_PER_DIFFICULTY;
  const hintPenalty = hintsUsed * APP_CONFIG.GAMIFICATION.XP_PENALTY_PER_HINT;
  
  // Time bonus: faster answers get slight bonus (max 20% bonus)
  const timeBonusMultiplier = Math.min(1.2, Math.max(1.0, 1.2 - (timeMs / 60000))); // Bonus for < 1min
  
  const finalXP = Math.round((baseXP - hintPenalty) * timeBonusMultiplier);
  return Math.max(APP_CONFIG.GAMIFICATION.MIN_XP_PER_QUESTION, finalXP);
}

/**
 * Check if user answer is correct
 */
export function isAnswerCorrect(
  question: QuestionWithChoices, 
  userAnswer: string | boolean
): boolean {
  if (question.type === 'tf') {
    return userAnswer === question.tfCorrectAnswer;
  } else {
    const correctChoice = question.choices.find(c => c.isCorrect);
    return userAnswer === correctChoice?.id;
  }
}

/**
 * Get correct answer display text
 */
export function getCorrectAnswerText(question: QuestionWithChoices): string {
  if (question.type === 'tf') {
    return question.tfCorrectAnswer ? 'Wahr' : 'Falsch';
  } else {
    const correctChoice = question.choices.find(c => c.isCorrect);
    return correctChoice?.label || 'Unbekannt';
  }
}

/**
 * Calculate streak continuation based on activity
 */
export function shouldContinueStreak(lastSeenDate: string): boolean {
  const lastSeen = new Date(lastSeenDate);
  const now = new Date();
  const hoursDiff = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff <= APP_CONFIG.GAMIFICATION.STREAK_RESET_HOURS;
}

/**
 * Determine if user meets daily goal
 */
export function meetsDaily_goal(todayAttempts: number): boolean {
  return todayAttempts >= APP_CONFIG.GAMIFICATION.DAILY_QUESTION_GOAL;
}

/**
 * Calculate progress percentage for topic
 */
export function calculateTopicProgress(
  correctQuestions: number, 
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctQuestions / totalQuestions) * 100);
}

/**
 * Shuffle array for randomized questions
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Filter questions user hasn't answered correctly yet
 */
export function filterUnansweredQuestions(
  questions: QuestionWithChoices[],
  correctlyAnsweredIds: Set<string>
): QuestionWithChoices[] {
  return questions.filter(q => !correctlyAnsweredIds.has(q.id));
}
