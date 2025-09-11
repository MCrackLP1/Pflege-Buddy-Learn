ALTER TABLE "user_progress" ADD COLUMN "daily_quest_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "daily_quest_date" date;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "daily_quest_progress" integer DEFAULT 0 NOT NULL;