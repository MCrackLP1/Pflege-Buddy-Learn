DROP TABLE "purchases";--> statement-breakpoint
ALTER TABLE "streak_milestones" ALTER COLUMN "xp_boost_multiplier" SET DATA TYPE numeric(3, 2);--> statement-breakpoint
ALTER TABLE "streak_milestones" ALTER COLUMN "xp_boost_multiplier" SET DEFAULT '1.00';--> statement-breakpoint
ALTER TABLE "user_milestone_achievements" ALTER COLUMN "xp_boost_multiplier" SET DATA TYPE numeric(3, 2);--> statement-breakpoint
ALTER TABLE "user_progress" ALTER COLUMN "xp_boost_multiplier" SET DATA TYPE numeric(3, 2);--> statement-breakpoint
ALTER TABLE "user_progress" ALTER COLUMN "xp_boost_multiplier" SET DEFAULT '1.00';