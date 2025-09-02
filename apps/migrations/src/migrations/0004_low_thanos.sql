ALTER TABLE "api_webhook" RENAME TO "webhook_integration";--> statement-breakpoint
ALTER TABLE "webhook_integration" DROP CONSTRAINT "api_webhook_integration_id_integrations_id_fk";
--> statement-breakpoint
ALTER TABLE "webhook_integration" ADD CONSTRAINT "webhook_integration_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;