import { z } from 'zod'
import type { SQSEvent } from 'aws-lambda'
import { EventCapturedEvent } from '@internal/events-schema/events'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { createConnection } from '@internal/database/connection'
import { events } from '@internal/database/schema'
import { v4 } from 'uuid'

const ConfigSchema = z.object({
  databaseUrl: z.string(),
})

const config = ConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
})

new Tracer()

const connection = createConnection(config.databaseUrl)

export const buildHandler = async (event: SQSEvent) => {
  await connection.insert(events).values(
    event.Records.map((record) => {
      const { data, metadata } = EventCapturedEvent.fromEventBridgeEvent(
        JSON.parse(record.body)
      )

      return {
        id: v4(),
        event: data.event,
        tenantId: metadata.tenantId,
        timestamp: new Date(), // TODO: Use the timestamp from the event data
        distinctId: data.distinctId ?? null,
        properties: data.properties,
      }
    })
  )
}
