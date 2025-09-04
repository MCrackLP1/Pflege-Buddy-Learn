// Optimistic updates for better UX during API calls

export interface OptimisticUpdate<T> {
  data: T;
  pending: boolean;
  error: string | null;
}

export function createOptimisticUpdate<T>(initialData: T): OptimisticUpdate<T> {
  return {
    data: initialData,
    pending: false,
    error: null,
  };
}

/**
 * Optimistic XP update - show XP gain immediately before API confirms
 */
export function calculateOptimisticXP(
  currentXP: number,
  questionDifficulty: number,
  hintsUsed: number,
  isCorrect: boolean
): number {
  if (!isCorrect) return currentXP;
  
  const xpGained = Math.max(1, questionDifficulty * 10 - hintsUsed * 5);
  return currentXP + xpGained;
}

/**
 * Optimistic topic progress update
 */
export function calculateOptimisticTopicProgress(
  currentProgress: number,
  totalQuestions: number,
  isCorrect: boolean
): number {
  if (!isCorrect || totalQuestions === 0) return currentProgress;
  
  const newCompleted = Math.min(
    Math.ceil((currentProgress / 100) * totalQuestions) + 1,
    totalQuestions
  );
  
  return Math.round((newCompleted / totalQuestions) * 100);
}

/**
 * Optimistic attempt tracking  
 */
export interface OptimisticAttempt {
  questionId: string;
  isCorrect: boolean;
  timestamp: Date;
  synced: boolean;
}

export class OptimisticAttemptsManager {
  private attempts: OptimisticAttempt[] = [];
  
  add(questionId: string, isCorrect: boolean): void {
    this.attempts.push({
      questionId,
      isCorrect,
      timestamp: new Date(),
      synced: false,
    });
  }
  
  markSynced(questionId: string): void {
    const attempt = this.attempts.find(a => a.questionId === questionId && !a.synced);
    if (attempt) {
      attempt.synced = true;
    }
  }
  
  getUnsynced(): OptimisticAttempt[] {
    return this.attempts.filter(a => !a.synced);
  }
  
  getCorrectAnswers(): string[] {
    return this.attempts
      .filter(a => a.isCorrect)
      .map(a => a.questionId);
  }
  
  clear(): void {
    this.attempts = [];
  }
}
