// API Response Types for consistent typing across the application

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserProgressData {
  xp: number;
  streak_days: number;
  last_seen: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  today_attempts: number;
}

export interface TopicProgressData {
  id: string;
  slug: string;
  title: string;
  description: string;
  totalQuestions: number;
  completedQuestions: number;
  progress: number;
}

export interface ReviewItemData {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  topic: string;
  completedAt: string;
  citations: {
    id: string;
    url: string;
    title: string;
  }[];
}

export interface QuestionChoice {
  id: string;
  questionId: string;
  label: string;
  isCorrect: boolean;
}

export interface QuestionCitation {
  id: string;
  questionId: string;
  url: string;
  title: string;
  publishedDate: string;
  accessedAt: Date;
}

export interface AttemptRequest {
  questionId: string;
  isCorrect: boolean;
  timeMs: number;
  usedHints: number;
}

export interface StripeCheckoutRequest {
  pack_key: string;
}

// Supabase Row Types
export type SupabaseAttempt = Database['public']['Tables']['attempts']['Row'];
export type SupabaseQuestion = Database['public']['Tables']['questions']['Row'];  
export type SupabaseChoice = Database['public']['Tables']['choices']['Row'];
export type SupabaseCitation = Database['public']['Tables']['citations']['Row'];
export type SupabaseTopic = Database['public']['Tables']['topics']['Row'];
export type SupabaseUserProgress = Database['public']['Tables']['user_progress']['Row'];
