CREATE TABLE "job_application" (
	"id" text PRIMARY KEY NOT NULL,
	"job_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'applied' NOT NULL,
	"cover_note" text,
	"attached_portfolio_id" text,
	"attached_post_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_posting" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"type" text NOT NULL,
	"salary_range" text,
	"tags" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_company" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "company_name" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "company_description" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "company_website" text;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_job_id_job_posting_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_posting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_attached_portfolio_id_portfolio_id_fk" FOREIGN KEY ("attached_portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_attached_post_id_post_id_fk" FOREIGN KEY ("attached_post_id") REFERENCES "public"."post"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_posting" ADD CONSTRAINT "job_posting_company_id_user_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;