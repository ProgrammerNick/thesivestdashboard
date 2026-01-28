ALTER TABLE "research_note" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "research_note" CASCADE;--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_display_name_unique";