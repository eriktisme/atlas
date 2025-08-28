import { z } from 'zod'
import type { SQSEvent } from 'aws-lambda'
import type { EventCapturedEventDetail } from '@internal/events-schema/events'
import { EventCapturedEvent } from '@internal/events-schema/events'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { createConnection } from '@internal/database/connection'
import type { WebhookIntegration } from '@internal/database/schema'
import { integrations, webhookIntegrations } from '@internal/database/schema'
import { and, eq, inArray, isNull } from 'drizzle-orm'

const ConfigSchema = z.object({
  databaseUrl: z.string(),
})

const config = ConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
})

new Tracer()

const connection = createConnection(config.databaseUrl)

export const buildHandler = async (event: SQSEvent) => {
  const events = event.Records.map((record) => {
    const { data, metadata } = EventCapturedEvent.fromEventBridgeEvent(
      JSON.parse(record.body)
    )

    return {
      ...data,
      tenantId: metadata.tenantId,
    }
  })

  const integrationsForTenants = await connection
    .select()
    .from(integrations)
    .leftJoin(
      webhookIntegrations,
      eq(webhookIntegrations.integrationId, integrations.id)
    )
    .where(
      and(
        ...[
          inArray(
            integrations.tenantId,
            events.map((e) => e.tenantId)
          ),
          isNull(integrations.revokedAt),
        ]
      )
    )

  const integrationsGroupedByTenantId = integrationsForTenants.reduce(
    (acc, integration) => {
      if (!acc[integration.integrations.tenantId]) {
        acc[integration.integrations.tenantId] = []
      }

      acc[integration.integrations.tenantId].push(integration)

      return acc
    },
    {} as Record<string, Array<(typeof integrationsForTenants)[number]>>
  )

  const dispatchPromises: Array<Promise<void>> = []

  for (const event of events) {
    const { tenantId, ...eventWithoutTenantId } = event

    const tenantIntegrations = integrationsGroupedByTenantId[tenantId] || []

    for (const integration of tenantIntegrations) {
      if (integration.webhook_integrations) {
        dispatchPromises.push(
          dispatchWebhookIntegration(
            eventWithoutTenantId,
            integration.webhook_integrations
          )
        )
      }
    }
  }

  await Promise.allSettled(dispatchPromises)
}

async function dispatchWebhookIntegration(
  event: EventCapturedEventDetail['data'],
  integration: WebhookIntegration
): Promise<void> {
  const response = await fetch(integration.destination, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  })

  if (!response.ok) {
    // TODO: Do something with the error, like logging or retrying
  }
}
