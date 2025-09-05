import { pgTable, uuid, text, integer, boolean, timestamp, date, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const questionTypeEnum = pgEnum('question_type', ['mc', 'tf']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const purchaseStatusEnum = pgEnum('purchase_status', ['pending', 'succeeded', 'failed']);
export const consentTypeEnum = pgEnum('consent_type', ['terms', 'privacy', 'cookie', 'withdrawal']);

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
  // For True/False questions: true or false is the correct answer
  tfCorrectAnswer: boolean('tf_correct_answer'), // null for MC questions, boolean for TF questions
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
  longestStreak: integer('longest_streak').notNull().default(0),
  currentStreakStart: date('current_streak_start'),
  lastMilestoneAchieved: integer('last_milestone_achieved').notNull().default(0),
  xpBoostMultiplier: integer('xp_boost_multiplier').notNull().default(1),
  xpBoostExpiry: timestamp('xp_boost_expiry'),
});

// Streak milestones
export const streakMilestones = pgTable('streak_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  daysRequired: integer('days_required').notNull().unique(),
  xpBoostMultiplier: integer('xp_boost_multiplier').notNull().default(1),
  boostDurationHours: integer('boost_duration_hours').notNull().default(24),
  rewardDescription: text('reward_description').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// XP Milestones for hint rewards
export const xpMilestones = pgTable('xp_milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  xpRequired: integer('xp_required').notNull().unique(),
  freeHintsReward: integer('free_hints_reward').notNull().default(1),
  rewardDescription: text('reward_description').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User milestone achievements
export const userMilestoneAchievements = pgTable('user_milestone_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  milestoneId: uuid('milestone_id').notNull(), // Can reference either streak or XP milestones
  milestoneType: text('milestone_type').notNull(), // 'streak' or 'xp'
  achievedAt: timestamp('achieved_at').defaultNow().notNull(),
  xpBoostMultiplier: integer('xp_boost_multiplier'),
  boostExpiry: timestamp('boost_expiry'),
  freeHintsReward: integer('free_hints_reward'),
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
  // Legal compliance fields for withdrawal waiver (DSGVO/BGB §356(5))
  withdrawalWaiverVersion: text('withdrawal_waiver_version'),
  withdrawalWaiverAt: timestamp('withdrawal_waiver_at'),
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

// Legal consent events table for GDPR compliance
export const legalConsentEvents = pgTable('legal_consent_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: consentTypeEnum('type').notNull(), // terms, privacy, cookie, withdrawal
  version: text('version').notNull(), // version of the legal document
  locale: text('locale').notNull(), // user's locale at time of consent
  categories: jsonb('categories'), // for cookie consent: which categories were accepted
  ipHash: text('ip_hash'), // hashed IP for audit trail (GDPR compliance)
  userAgent: text('user_agent'), // for audit trail
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Ranked mode tables
export const rankedSessions = pgTable('ranked_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  totalScore: integer('total_score').notNull().default(0),
  questionsAnswered: integer('questions_answered').notNull().default(0),
  correctAnswers: integer('correct_answers').notNull().default(0),
  totalTimeMs: integer('total_time_ms').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
});

export const rankedAttempts = pgTable('ranked_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => rankedSessions.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => questions.id).notNull(),
  isCorrect: boolean('is_correct').notNull(),
  timeMs: integer('time_ms').notNull(),
  usedHints: integer('used_hints').notNull().default(0),
  score: integer('score').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rankedLeaderboard = pgTable('ranked_leaderboard', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  sessionId: uuid('session_id').references(() => rankedSessions.id, { onDelete: 'cascade' }).notNull(),
  totalScore: integer('total_score').notNull(),
  questionsAnswered: integer('questions_answered').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  accuracy: integer('accuracy').notNull(), // percentage * 100 for precision
  averageTimeMs: integer('average_time_ms').notNull(),
  rank: integer('rank'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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

export const streakMilestonesRelations = relations(streakMilestones, ({ many }) => ({
  achievements: many(userMilestoneAchievements),
}));

export const xpMilestonesRelations = relations(xpMilestones, ({ many }) => ({
  achievements: many(userMilestoneAchievements),
}));

export const userMilestoneAchievementsRelations = relations(userMilestoneAchievements, ({ one }) => ({
  streakMilestone: one(streakMilestones, {
    fields: [userMilestoneAchievements.milestoneId],
    references: [streakMilestones.id],
    relationName: 'streakAchievements'
  }),
  xpMilestone: one(xpMilestones, {
    fields: [userMilestoneAchievements.milestoneId],
    references: [xpMilestones.id],
    relationName: 'xpAchievements'
  }),
}));

// Ranked mode relations
export const rankedSessionsRelations = relations(rankedSessions, ({ many }) => ({
  attempts: many(rankedAttempts),
  leaderboardEntries: many(rankedLeaderboard),
}));

export const rankedAttemptsRelations = relations(rankedAttempts, ({ one }) => ({
  session: one(rankedSessions, { fields: [rankedAttempts.sessionId], references: [rankedSessions.id] }),
  question: one(questions, { fields: [rankedAttempts.questionId], references: [questions.id] }),
}));

export const rankedLeaderboardRelations = relations(rankedLeaderboard, ({ one }) => ({
  session: one(rankedSessions, { fields: [rankedLeaderboard.sessionId], references: [rankedSessions.id] }),
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
export type StreakMilestone = typeof streakMilestones.$inferSelect;
export type XpMilestone = typeof xpMilestones.$inferSelect;
export type UserMilestoneAchievement = typeof userMilestoneAchievements.$inferSelect;
export type LegalConsentEvent = typeof legalConsentEvents.$inferSelect;
export type RankedSession = typeof rankedSessions.$inferSelect;
export type RankedAttempt = typeof rankedAttempts.$inferSelect;
export type RankedLeaderboardEntry = typeof rankedLeaderboard.$inferSelect;

export type QuestionWithChoices = Question & {
  choices: Choice[];
  citations: Citation[];
  tfCorrectAnswer?: boolean | null;
};

export type TopicWithProgress = Topic & {
  totalQuestions: number;
  correctAttempts: number;
};
