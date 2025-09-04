import { pgTable, uuid, text, integer, boolean, timestamp, date, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const questionTypeEnum = pgEnum('question_type', ['mc', 'tf']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const purchaseStatusEnum = pgEnum('purchase_status', ['pending', 'succeeded', 'failed']);

// Topics table
export const topics = pgTable('topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Questions table
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: uuid('topic_id').references(() => topics.id).notNull(),
  type: questionTypeEnum('type').notNull(),
  stem: text('stem').notNull(),
  explanationMd: text('explanation_md').notNull(),
  sourceUrl: text('source_url'),
  sourceTitle: text('source_title'),
  sourceDate: date('source_date'),
  difficulty: integer('difficulty').notNull().default(1), // 1-5
  hints: jsonb('hints').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Choices table (for multiple choice questions)
export const choices = pgTable('choices', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  label: text('label').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
});

// User attempts table
export const attempts = pgTable('attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  questionId: uuid('question_id').references(() => questions.id).notNull(),
  isCorrect: boolean('is_correct').notNull(),
  timeMs: integer('time_ms').notNull(),
  usedHints: integer('used_hints').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User progress tracking
export const userProgress = pgTable('user_progress', {
  userId: uuid('user_id').primaryKey(),
  xp: integer('xp').notNull().default(0),
  streakDays: integer('streak_days').notNull().default(0),
  lastSeen: date('last_seen'),
});

// User profiles
export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey(),
  displayName: text('display_name'),
  role: userRoleEnum('role').notNull().default('user'),
  locale: text('locale').notNull().default('de'),
});

// User wallet for hints
export const userWallet = pgTable('user_wallet', {
  userId: uuid('user_id').primaryKey(),
  hintsBalance: integer('hints_balance').notNull().default(0),
  dailyFreeHintsUsed: integer('daily_free_hints_used').notNull().default(0),
  dailyResetDate: date('daily_reset_date'),
});

// Purchases table for Stripe transactions
export const purchases = pgTable('purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  stripeSessionId: text('stripe_session_id').notNull().unique(),
  packKey: text('pack_key').notNull(), // e.g., "10_hints", "50_hints", "200_hints"
  hintsDelta: integer('hints_delta').notNull(),
  status: purchaseStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Citations table for question sources
export const citations = pgTable('citations', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  title: text('title').notNull(),
  publishedDate: date('published_date'),
  accessedAt: timestamp('accessed_at').defaultNow().notNull(),
});

// Relations
export const topicsRelations = relations(topics, ({ many }) => ({
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  topic: one(topics, { fields: [questions.topicId], references: [topics.id] }),
  choices: many(choices),
  attempts: many(attempts),
  citations: many(citations),
}));

export const choicesRelations = relations(choices, ({ one }) => ({
  question: one(questions, { fields: [choices.questionId], references: [questions.id] }),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  question: one(questions, { fields: [attempts.questionId], references: [questions.id] }),
}));

export const citationsRelations = relations(citations, ({ one }) => ({
  question: one(questions, { fields: [citations.questionId], references: [questions.id] }),
}));

// Types
export type Topic = typeof topics.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Choice = typeof choices.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type UserWallet = typeof userWallet.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Citation = typeof citations.$inferSelect;

export type QuestionWithChoices = Question & {
  choices: Choice[];
  citations: Citation[];
};

export type TopicWithProgress = Topic & {
  totalQuestions: number;
  correctAttempts: number;
};
