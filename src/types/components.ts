// Component-specific TypeScript interfaces for React components
// These interfaces provide type safety for component props and internal state

import type { Session } from '@supabase/supabase-js';

// ============================================================================
// AUTH PROVIDER TYPES
// ============================================================================

export interface GoogleOAuthUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface GoogleOAuthError extends Error {
  error: string;
  error_description?: string;
  state?: string;
  error_uri?: string;
}

export interface AuthState {
  session: Session | null;
  user: GoogleOAuthUser | null;
  loading: boolean;
  error: GoogleOAuthError | null;
}

export interface AuthContextValue {
  session: Session | null;
  user: GoogleOAuthUser | null;
  loading: boolean;
  error: GoogleOAuthError | null;
  signIn: (provider?: 'google') => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// QUIZ FEEDBACK TYPES
// ============================================================================

export type UserAnswer = string | boolean | number | null;

export interface FeedbackData {
  questionId: string;
  userAnswer: UserAnswer;
  correctAnswer: UserAnswer;
  isCorrect: boolean;
  explanation?: string;
  hints?: string[];
  timeSpent: number;
}

export interface QuizFeedbackProps {
  feedback: FeedbackData;
  onNext: () => void;
  showExplanation: boolean;
}

// ============================================================================
// SEO SCHEMA MARKUP TYPES
// ============================================================================

export interface SchemaOrgBase {
  '@context': string;
  '@type': string;
}

export interface WebSiteSchema extends SchemaOrgBase {
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  inLanguage?: string;
  publisher?: {
    '@type': 'Organization';
    name: string;
    description?: string;
    url?: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface FAQPageSchema extends SchemaOrgBase {
  '@type': 'FAQPage';
  name?: string;
  description?: string;
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface QuizSchema extends SchemaOrgBase {
  '@type': 'Quiz';
  name: string;
  description: string;
  url?: string;
  inLanguage?: string;
  about: string[];
  educationalLevel: string;
  educationalUse?: string;
  assesses?: string[];
  teaches?: string[];
  questions: Array<{
    '@type': 'Question';
    text: string;
    answerExplanation?: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface ArticleSchema extends SchemaOrgBase {
  '@type': 'Article';
  headline: string;
  description: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
}

export interface BreadcrumbListSchema extends SchemaOrgBase {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

// Union type for all supported schema types
export type SchemaData =
  | WebSiteSchema
  | FAQPageSchema
  | QuizSchema
  | ArticleSchema
  | BreadcrumbListSchema;

// Flexible schema type for dynamic schema generation
export type FlexibleSchemaData = SchemaOrgBase & Record<string, unknown>;

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface SchemaMarkupProps {
  type: 'website' | 'faq' | 'quiz' | 'article' | 'breadcrumb';
  data: SchemaData;
  priority?: 'high' | 'normal' | 'low';
}

// ============================================================================
// UTILITY TYPES FOR COMPONENTS
// ============================================================================

export interface ComponentError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ComponentError | null;
}

// ============================================================================
// EVENT HANDLING TYPES
// ============================================================================

export interface FormEvent<T = unknown> {
  preventDefault: () => void;
  target: {
    value: T;
    name?: string;
  };
}

export interface ClickEvent {
  preventDefault: () => void;
  currentTarget: HTMLElement;
}
