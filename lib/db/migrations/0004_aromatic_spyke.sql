CREATE TABLE "team_webhooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"url" text NOT NULL,
	"secret" varchar(255) NOT NULL,
	"events" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"webhook_id" integer NOT NULL,
	"event" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"response_status" integer,
	"response_body" text,
	"error" text,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branding" ALTER COLUMN "name" SET DEFAULT 'Kyrn';--> statement-breakpoint
ALTER TABLE "ai_configs" ADD COLUMN "composio_api_key" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "stripe_annual_price_id" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "amount_annual" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "team_webhooks" ADD CONSTRAINT "team_webhooks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_webhook_id_team_webhooks_id_fk" FOREIGN KEY ("webhook_id") REFERENCES "public"."team_webhooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "team_webhooks_team_id_idx" ON "team_webhooks" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "webhook_deliveries_webhook_id_idx" ON "webhook_deliveries" USING btree ("webhook_id");