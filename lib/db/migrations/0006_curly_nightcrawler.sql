CREATE TABLE "voice_agent_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"nodes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"edges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"workflow_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voice_agent_definitions_agent_version_idx" UNIQUE("agent_id","version")
);
--> statement-breakpoint
CREATE TABLE "voice_agent_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"definition_id" integer,
	"campaign_id" integer,
	"campaign_lead_id" integer,
	"chat_id" integer,
	"contact_id" integer,
	"call_log_id" integer,
	"channel" varchar(30) NOT NULL,
	"direction" varchar(20) DEFAULT 'inbound' NOT NULL,
	"status" varchar(30) DEFAULT 'queued' NOT NULL,
	"from_number" varchar(50),
	"to_number" varchar(50),
	"transcript" text,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"usage" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"cost" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"reserved_credits" integer DEFAULT 0 NOT NULL,
	"credits_used" integer DEFAULT 0 NOT NULL,
	"error" text,
	"started_at" timestamp,
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"model_config_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"channel_mode" varchar(30) DEFAULT 'whatsapp_voice' NOT NULL,
	"system_prompt" text,
	"first_message" text,
	"default_language" varchar(20) DEFAULT 'en' NOT NULL,
	"is_default_for_whatsapp" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_campaign_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"campaign_id" integer NOT NULL,
	"phone_number" varchar(50) NOT NULL,
	"contact_id" integer,
	"variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(30) DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"scheduled_at" timestamp,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"agent_id" integer NOT NULL,
	"telephony_config_id" integer,
	"name" varchar(255) NOT NULL,
	"status" varchar(30) DEFAULT 'draft' NOT NULL,
	"source_type" varchar(30) DEFAULT 'manual' NOT NULL,
	"total_leads" integer DEFAULT 0 NOT NULL,
	"processed_leads" integer DEFAULT 0 NOT NULL,
	"failed_leads" integer DEFAULT 0 NOT NULL,
	"max_concurrency" integer DEFAULT 1 NOT NULL,
	"retry_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"schedule_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_file_chunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"file_id" integer NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voice_file_chunks_file_chunk_idx" UNIQUE("file_id","chunk_index")
);
--> statement-breakpoint
CREATE TABLE "voice_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(500) NOT NULL,
	"mime_type" varchar(100),
	"size_bytes" integer,
	"storage_url" text,
	"content_text" text,
	"processing_status" varchar(30) DEFAULT 'ready' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_model_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"llm_provider" varchar(50) DEFAULT 'openai' NOT NULL,
	"llm_model" varchar(100) DEFAULT 'gpt-4o-mini' NOT NULL,
	"llm_api_key" text,
	"stt_provider" varchar(50) DEFAULT 'openai' NOT NULL,
	"stt_model" varchar(100) DEFAULT 'gpt-4o-mini-transcribe' NOT NULL,
	"stt_api_key" text,
	"tts_provider" varchar(50) DEFAULT 'openai' NOT NULL,
	"tts_model" varchar(100) DEFAULT 'gpt-4o-mini-tts' NOT NULL,
	"tts_voice" varchar(100) DEFAULT 'alloy' NOT NULL,
	"tts_api_key" text,
	"temperature" numeric(2, 1) DEFAULT '0.7',
	"max_output_tokens" integer DEFAULT 1000,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voice_model_configs_team_name_idx" UNIQUE("team_id","name")
);
--> statement-breakpoint
CREATE TABLE "voice_phone_numbers" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"telephony_config_id" integer,
	"agent_id" integer,
	"phone_number" varchar(50) NOT NULL,
	"label" varchar(100),
	"provider_phone_sid" text,
	"is_default_caller_id" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voice_phone_numbers_team_number_idx" UNIQUE("team_id","phone_number")
);
--> statement-breakpoint
CREATE TABLE "voice_recordings" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"agent_id" integer,
	"run_id" integer,
	"recording_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"transcript" text,
	"storage_url" text,
	"mime_type" varchar(100),
	"duration_seconds" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voice_recordings_team_recording_idx" UNIQUE("team_id","recording_id")
);
--> statement-breakpoint
CREATE TABLE "voice_telephony_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"provider" varchar(50) DEFAULT 'twilio' NOT NULL,
	"credentials" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_default_outbound" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voice_telephony_configs_team_name_idx" UNIQUE("team_id","name")
);
--> statement-breakpoint
CREATE TABLE "voice_tools" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) DEFAULT 'http_api' NOT NULL,
	"definition" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voice_tools_team_name_idx" UNIQUE("team_id","name")
);
--> statement-breakpoint
ALTER TABLE "voice_agent_definitions" ADD CONSTRAINT "voice_agent_definitions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agent_definitions" ADD CONSTRAINT "voice_agent_definitions_agent_id_voice_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."voice_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agent_runs" ADD CONSTRAINT "voice_agent_runs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agent_runs" ADD CONSTRAINT "voice_agent_runs_agent_id_voice_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."voice_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agent_runs" ADD CONSTRAINT "voice_agent_runs_definition_id_voice_agent_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."voice_agent_definitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agent_runs" ADD CONSTRAINT "voice_agent_runs_campaign_id_voice_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."voice_campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agent_runs" ADD CONSTRAINT "voice_agent_runs_campaign_lead_id_voice_campaign_leads_id_fk" FOREIGN KEY ("campaign_lead_id") REFERENCES "public"."voice_campaign_leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agent_runs" ADD CONSTRAINT "voice_agent_runs_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agent_runs" ADD CONSTRAINT "voice_agent_runs_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agent_runs" ADD CONSTRAINT "voice_agent_runs_call_log_id_call_logs_id_fk" FOREIGN KEY ("call_log_id") REFERENCES "public"."call_logs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_model_config_id_voice_model_configs_id_fk" FOREIGN KEY ("model_config_id") REFERENCES "public"."voice_model_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_agents" ADD CONSTRAINT "voice_agents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_campaign_leads" ADD CONSTRAINT "voice_campaign_leads_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_campaign_leads" ADD CONSTRAINT "voice_campaign_leads_campaign_id_voice_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."voice_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_campaign_leads" ADD CONSTRAINT "voice_campaign_leads_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_campaigns" ADD CONSTRAINT "voice_campaigns_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_campaigns" ADD CONSTRAINT "voice_campaigns_agent_id_voice_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."voice_agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_campaigns" ADD CONSTRAINT "voice_campaigns_telephony_config_id_voice_telephony_configs_id_fk" FOREIGN KEY ("telephony_config_id") REFERENCES "public"."voice_telephony_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_campaigns" ADD CONSTRAINT "voice_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_file_chunks" ADD CONSTRAINT "voice_file_chunks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_file_chunks" ADD CONSTRAINT "voice_file_chunks_file_id_voice_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."voice_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_files" ADD CONSTRAINT "voice_files_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_files" ADD CONSTRAINT "voice_files_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_model_configs" ADD CONSTRAINT "voice_model_configs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_phone_numbers" ADD CONSTRAINT "voice_phone_numbers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_phone_numbers" ADD CONSTRAINT "voice_phone_numbers_telephony_config_id_voice_telephony_configs_id_fk" FOREIGN KEY ("telephony_config_id") REFERENCES "public"."voice_telephony_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_phone_numbers" ADD CONSTRAINT "voice_phone_numbers_agent_id_voice_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."voice_agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_recordings" ADD CONSTRAINT "voice_recordings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_recordings" ADD CONSTRAINT "voice_recordings_agent_id_voice_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."voice_agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_recordings" ADD CONSTRAINT "voice_recordings_run_id_voice_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."voice_agent_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_recordings" ADD CONSTRAINT "voice_recordings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_telephony_configs" ADD CONSTRAINT "voice_telephony_configs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_tools" ADD CONSTRAINT "voice_tools_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_tools" ADD CONSTRAINT "voice_tools_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "voice_agent_definitions_agent_idx" ON "voice_agent_definitions" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "voice_agent_runs_team_idx" ON "voice_agent_runs" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "voice_agent_runs_agent_idx" ON "voice_agent_runs" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "voice_agent_runs_chat_idx" ON "voice_agent_runs" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "voice_agents_team_idx" ON "voice_agents" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "voice_agents_active_idx" ON "voice_agents" USING btree ("team_id","is_active");--> statement-breakpoint
CREATE INDEX "voice_campaign_leads_campaign_status_idx" ON "voice_campaign_leads" USING btree ("campaign_id","status");--> statement-breakpoint
CREATE INDEX "voice_campaigns_team_idx" ON "voice_campaigns" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "voice_campaigns_status_idx" ON "voice_campaigns" USING btree ("team_id","status");--> statement-breakpoint
CREATE INDEX "voice_files_team_idx" ON "voice_files" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "voice_model_configs_team_idx" ON "voice_model_configs" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "voice_telephony_configs_team_idx" ON "voice_telephony_configs" USING btree ("team_id");