CREATE TABLE "post_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"filename" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "published_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "published_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "subtitle" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "published" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "post_attachment" ADD CONSTRAINT "post_attachment_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_slug_unique" UNIQUE("slug");