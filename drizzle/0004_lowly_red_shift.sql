ALTER TABLE "portfolio" ADD COLUMN "is_public" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "premium_content_enabled" boolean DEFAULT false;