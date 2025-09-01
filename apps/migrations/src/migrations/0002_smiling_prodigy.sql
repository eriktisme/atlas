CREATE TYPE "public"."integration_provider_type" AS ENUM('zapier');--> statement-breakpoint
CREATE TYPE "public"."integration_webhook_type" AS ENUM('api_webhook');--> statement-breakpoint
CREATE TABLE "api_webhook" (
	"integration_id" uuid PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"secret" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"label" varchar(255) NOT NULL,
	"provider" "integration_provider_type" NOT NULL,
	"tenant_id" varchar NOT NULL,
	"type" "integration_webhook_type" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_webhook" ADD CONSTRAINT "api_webhook_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;