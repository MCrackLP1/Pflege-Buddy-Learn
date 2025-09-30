// API Request/Response Types for internal API operations
// These interfaces are used for type-safe API communication between components and API routes

import type { Database } from './database.types';

// ============================================================================
// ATTEMPTS API TYPES
// ============================================================================

export interface AttemptData {
  question_id: string;
  answer: string | boolean;
  is_correct: boolean;
  time_taken_ms: number;
  topic: string;
  used_hints?: number;
}

export interface QuestionData {
  id: string;
  type: 'mc' | 'tf';
  question: string;
  choices?: string[];
  correct_answer?: string;
  tf_correct_answer?: boolean;
  explanation?: string;
  topic: string;
  difficulty: number;
  citations?: Database['public']['Tables']['citations']['Row'][];
}

export interface TopicData {
  id: string;
  name: string;
  slug: string;
  difficulty: number;
  description?: string;
}

export interface XPResult {
  baseXP: number;
  streakBonus: number;
  totalXP: number;
  multiplier: number;
}

export interface StreakResult {
  current: number;
  longest: number;
  xpBoostActive: boolean;
  xpBoostMultiplier: number;
  xpBoostExpiry?: Date;
}

// ============================================================================
// TOPICS PROGRESS API TYPES
// ============================================================================

export interface TopicProgressData {
  topic_id: string;
  topic_name: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  last_attempted: string;
  completion_rate: number;
}

// ============================================================================
// QUESTIONS API TYPES
// ============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HintData {
  id: string;
  text: string;
  cost: number;
  type: 'text' | 'elimination';
  is_used?: boolean;
}

export interface QuestionsResponse extends APIResponse<QuestionData[]> {
  total?: number;
  hasMore?: boolean;
}

export interface HintsResponse extends APIResponse<HintData[]> {
  balance?: number;
}

// ============================================================================
// PERFORMANCE API TYPES
// ============================================================================

export interface PerformanceMetrics {
  lcp: number;           // Largest Contentful Paint
  fid: number;           // First Input Delay
  cls: number;           // Cumulative Layout Shift
  ttfb: number;          // Time to First Byte
  fcp: number;           // First Contentful Paint
  timestamp: number;
  url: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType: string;
  userAgent?: string;
}

// ============================================================================
// RANKED SESSION API TYPES
// ============================================================================

export interface RankedSessionData {
  id: string;
  user_id: string;
  is_active: boolean;
  total_score: number;
  questions_answered: number;
  correct_answers: number;
  started_at: string;
  ended_at?: string;
}

export interface RankedStatsData {
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  totalScore: number;
  overallAccuracy: number;
  averageScore: number;
  averageTimeMs: number;
  bestScore: number;
  bestAccuracy: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}
