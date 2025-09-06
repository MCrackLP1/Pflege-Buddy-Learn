DO $$ BEGIN
 CREATE TYPE "public"."consent_type" AS ENUM('terms', 'privacy', 'cookie', 'withdrawal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legal_consent_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "consent_type" NOT NULL,
	"version" text NOT NULL,
	"locale" text NOT NULL,
	"categories" jsonb,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "withdrawal_waiver_version" text;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "withdrawal_waiver_at" timestamp;