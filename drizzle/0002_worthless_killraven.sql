CREATE TABLE "portfolio" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'manual' NOT NULL,
	"plaid_item_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_holding" (
	"id" text PRIMARY KEY NOT NULL,
	"portfolio_id" text NOT NULL,
	"symbol" text NOT NULL,
	"shares" real NOT NULL,
	"avg_cost_basis" real NOT NULL,
	"current_price" real,
	"current_value" real,
	"gain_loss" real,
	"gain_loss_percent" real,
	"last_updated" timestamp
);
--> statement-breakpoint
CREATE TABLE "portfolio_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"portfolio_id" text NOT NULL,
	"symbol" text NOT NULL,
	"type" text NOT NULL,
	"shares" real NOT NULL,
	"price_per_share" real NOT NULL,
	"total_value" real NOT NULL,
	"date" timestamp NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_holding" ADD CONSTRAINT "portfolio_holding_portfolio_id_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_transaction" ADD CONSTRAINT "portfolio_transaction_portfolio_id_portfolio_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;