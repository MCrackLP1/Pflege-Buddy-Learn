import { z } from 'zod';

// Input validation schemas for API endpoints

export const TopicSlugSchema = z
  .string()
  .min(1, 'Topic slug is required')
  .max(50, 'Topic slug too long')
  .regex(/^[a-z]+$/, 'Topic slug must contain only lowercase letters');

export const QuestionIdSchema = z
  .string()
  .uuid('Invalid question ID format');

export const UserIdSchema = z
  .string()
  .uuid('Invalid user ID format');

export const AttemptRequestSchema = z.object({
  questionId: QuestionIdSchema,
  isCorrect: z.boolean(),
  timeMs: z.number().int().min(0).max(3600000), // Max 1 hour
  usedHints: z.number().int().min(0).max(10), // Max 10 hints per question
});

export const PaginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10), // Max 100 per request
  offset: z.number().int().min(0).default(0),
});

export const StripeCheckoutSchema = z.object({
  pack_key: z.enum(['10_hints', '50_hints', '200_hints'], {
    errorMap: () => ({ message: 'Invalid hint pack selected' })
  }),
});

// Validate topic slug against known topics
export const VALID_TOPICS = ['grundlagen', 'hygiene', 'medikamente', 'dokumentation', 'random'] as const;

export function validateTopicSlug(slug: string): boolean {
  return VALID_TOPICS.includes(slug as typeof VALID_TOPICS[number]);
}

// Sanitize and validate user input
export function sanitizeString(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

// Validate medical content for accuracy (basic checks)
export const MedicalContentSchema = z.object({
  stem: z.string().min(10, 'Question too short').max(500, 'Question too long'),
  explanation: z.string().min(20, 'Explanation too short').max(2000, 'Explanation too long'),
  difficulty: z.number().int().min(1).max(5),
  hints: z.array(z.string().max(200)).max(5),
  citations: z.array(z.object({
    url: z.string().url('Invalid citation URL'),
    title: z.string().min(1).max(200),
  })).min(1, 'At least one citation required'),
});

// Error response generator
export function createErrorResponse(message: string, code: number = 400) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message 
    }), 
    { 
      status: code,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
