CREATE TABLE IF NOT EXISTS "team_brains" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "website_url" text,
  "status" varchar(20) DEFAULT 'empty' NOT NULL,
  "summary" text,
  "snapshot" jsonb,
  "onboarding_completed_at" timestamp,
  "dismissed_at" timestamp,
  "last_scanned_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "team_brains_team_id_unique" UNIQUE("team_id"),
  CONSTRAINT "team_brains_team_id_teams_id_fk"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE cascade
);
