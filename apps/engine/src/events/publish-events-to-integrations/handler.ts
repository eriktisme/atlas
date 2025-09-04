import { z } from 'zod'
import type { SQSEvent } from 'aws-lambda'
import { createConnection } from '@internal/database/connection'
import { integrations, webhookIntegration } from '@internal/database/schema'
import { EventCapturedEvent } from '@internal/events-schema/events'
import { eq, inArray } from 'drizzle-orm'
import { Logger } from '@aws-lambda-powertools/logger'

const ConfigSchema = z.object({
  databaseUrl: z.string(),
})

const config = ConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
})

const logger = new Logger()

const connection = createConnection(config.databaseUrl)

export const buildHandler = async (event: SQSEvent) => {
  const tenants = event.Records.map((record) => {
    const { metadata } = EventCapturedEvent.fromEventBridgeEvent(
      JSON.parse(record.body)
    )

    return metadata.tenantId
  })

  /**
   * Future improvements:
   *
   * - Allow other integrations beyond just webhooks
   * - Add retry logic for failed requests
   */
  const result = await connection
    .select({
      tenantId: integrations.tenantId,
      provider: integrations.provider,
      url: webhookIntegration.url,
      secret: webhookIntegration.secret,
    })
    .from(integrations)
    .innerJoin(
      webhookIntegration,
      eq(integrations.id, webhookIntegration.integrationId)
    )
    .where(inArray(integrations.tenantId, tenants))

  for (const record of event.Records) {
    const { data, metadata } = EventCapturedEvent.fromEventBridgeEvent(
      JSON.parse(record.body)
    )

    const integration = result.find((r) => r.tenantId === metadata.tenantId)

    if (!integration) {
      logger.warn(
        `No webhook integration found for tenant ${metadata.tenantId}`
      )

      continue
    }

    const request = await fetch(integration.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${integration.secret}`,
      },
      body: JSON.stringify(data),
    })

    if (!request.ok) {
      logger.error(
        `Failed to send event to webhook for tenant ${metadata.tenantId}: ${request.statusText}`
      )

      continue
    }

    logger.info(
      `Successfully sent event to webhook for tenant ${metadata.tenantId}`
    )
  }
}
