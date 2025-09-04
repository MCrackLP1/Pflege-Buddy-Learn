CREATE TABLE IF NOT EXISTS "streak_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"days_required" integer NOT NULL,
	"xp_boost_multiplier" integer DEFAULT 1 NOT NULL,
	"boost_duration_hours" integer DEFAULT 24 NOT NULL,
	"reward_description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "streak_milestones_days_required_unique" UNIQUE("days_required")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_milestone_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"milestone_id" uuid NOT NULL,
	"achieved_at" timestamp DEFAULT now() NOT NULL,
	"xp_boost_multiplier" integer NOT NULL,
	"boost_expiry" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "longest_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "current_streak_start" date;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "last_milestone_achieved" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "xp_boost_multiplier" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "xp_boost_expiry" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_milestone_achievements" ADD CONSTRAINT "user_milestone_achievements_milestone_id_streak_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."streak_milestones"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
