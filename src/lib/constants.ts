// Application constants for consistency

export const APP_CONFIG = {
  // Quiz Configuration
  QUIZ: {
    DEFAULT_QUESTION_LIMIT: 10,
    MAX_QUESTIONS_PER_REQUEST: 100,
    MAX_HINTS_PER_QUESTION: 5,
    DAILY_FREE_HINTS: 2,
    MAX_QUIZ_TIME_MS: 3600000, // 1 hour max
  },
  
  // Gamification
  GAMIFICATION: {
    XP_PER_DIFFICULTY: 10,
    XP_PENALTY_PER_HINT: 5,
    MIN_XP_PER_QUESTION: 1,
    DAILY_QUESTION_GOAL: 5,
    STREAK_RESET_HOURS: 48, // Reset streak after 48h inactivity
  },
  
  // Performance
  CACHE: {
    QUESTIONS_TTL: 300000, // 5 minutes
    USER_PROGRESS_TTL: 120000, // 2 minutes  
    TOPIC_PROGRESS_TTL: 300000, // 5 minutes
    STATIC_CONTENT_TTL: 3600000, // 1 hour
  },
  
  // Rate Limiting
  RATE_LIMITS: {
    QUIZ_REQUESTS_PER_15MIN: 60,
    PROGRESS_REQUESTS_PER_15MIN: 30,
    PAYMENT_REQUESTS_PER_HOUR: 10,
    AUTH_REQUESTS_PER_15MIN: 20,
  },
  
  // Validation
  VALIDATION: {
    MAX_QUESTION_LENGTH: 500,
    MAX_EXPLANATION_LENGTH: 2000,
    MAX_HINT_LENGTH: 200,
    MIN_CITATIONS_PER_QUESTION: 1,
    MAX_TOPIC_SLUG_LENGTH: 50,
  },
  
  // UI Configuration
  UI: {
    MOBILE_BREAKPOINT: 768,
    PRIMARY_VIEWPORT_WIDTH: 390, // iPhone 12 Pro
    MIN_TOUCH_TARGET_SIZE: 44, // WCAG AA compliance
    ANIMATION_DURATION: 200,
    DEBOUNCE_DELAY: 300,
  },
  
  // Medical Content Standards
  MEDICAL: {
    REQUIRED_SOURCE_TYPES: ['RKI', 'WHO', 'AWMF', 'BfArM', 'CDC'] as const,
    MAX_CONTENT_AGE_YEARS: 5,
    REVIEW_REQUIRED_AFTER_DAYS: 365,
  }
} as const;

// Topic configuration with metadata
export const TOPICS = {
  grundlagen: {
    slug: 'grundlagen',
    title: 'Pflegegrundlagen',
    description: 'Grundlegende Prinzipien der professionellen Pflege',
    difficulty: 'beginner',
    estimatedQuestions: 50,
    color: '#3B82F6', // Blue
  },
  hygiene: {
    slug: 'hygiene',
    title: 'Hygiene & Infektionsschutz',
    description: 'Hygienemaßnahmen und Infektionsprävention',
    difficulty: 'intermediate',
    estimatedQuestions: 40,
    color: '#10B981', // Green
  },
  medikamente: {
    slug: 'medikamente', 
    title: 'Medikamentengabe',
    description: 'Sichere Arzneimittelverabreichung',
    difficulty: 'advanced',
    estimatedQuestions: 60,
    color: '#F59E0B', // Orange
  },
  dokumentation: {
    slug: 'dokumentation',
    title: 'Pflegedokumentation',
    description: 'Rechtssichere Dokumentation',
    difficulty: 'intermediate', 
    estimatedQuestions: 30,
    color: '#8B5CF6', // Purple
  }
} as const;

export type TopicSlug = keyof typeof TOPICS;

// Hint pack configuration
export const HINT_PACKS = {
  '10_hints': {
    hints: 10,
    price: 2.99,
    currency: 'EUR',
    popular: false,
  },
  '50_hints': {
    hints: 50,
    price: 9.99, 
    currency: 'EUR',
    popular: true,
  },
  '200_hints': {
    hints: 200,
    price: 24.99,
    currency: 'EUR',
    popular: false,
  }
} as const;

// Routes for consistent navigation
export const ROUTES = {
  HOME: '/',
  LEARN: '/learn',
  QUIZ: (topic: string) => `/quiz/${topic}`,
  REVIEW: '/review',
  PROFILE: '/profile',
  STORE: '/store',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  QUESTIONS: (topic: string) => `/api/questions/${topic}`,
  USER_PROGRESS: '/api/user/progress',
  USER_ATTEMPTS: '/api/user/attempts', 
  TOPIC_PROGRESS: '/api/topics/progress',
  SAVE_ATTEMPT: '/api/attempts',
  STRIPE_CHECKOUT: '/api/stripe/checkout',
} as const;
