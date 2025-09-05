CREATE TABLE IF NOT EXISTS "xp_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"xp_required" integer NOT NULL,
	"free_hints_reward" integer DEFAULT 1 NOT NULL,
	"reward_description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "xp_milestones_xp_required_unique" UNIQUE("xp_required")
);
--> statement-breakpoint
ALTER TABLE "user_milestone_achievements" DROP CONSTRAINT "user_milestone_achievements_milestone_id_streak_milestones_id_fk";
--> statement-breakpoint
ALTER TABLE "user_milestone_achievements" ALTER COLUMN "xp_boost_multiplier" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_milestone_achievements" ALTER COLUMN "boost_expiry" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_milestone_achievements" ADD COLUMN "milestone_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_milestone_achievements" ADD COLUMN "free_hints_reward" integer;