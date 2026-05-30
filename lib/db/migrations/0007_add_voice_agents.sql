CREATE TABLE IF NOT EXISTS "voice_agents" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL,
  "name" varchar(120) NOT NULL,
  "description" text,
  "status" varchar(30) DEFAULT 'draft' NOT NULL,
  "provider" varchar(50) DEFAULT 'openai' NOT NULL,
  "model" varchar(100) DEFAULT 'gpt-realtime-2' NOT NULL,
  "voice" varchar(100) DEFAULT 'alloy' NOT NULL,
  "prompt" text,
  "config" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "voice_agents_team_id_teams_id_fk"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "voice_agents_team_id_idx" ON "voice_agents" ("team_id");
