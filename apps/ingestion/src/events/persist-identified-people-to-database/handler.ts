import { z } from 'zod'
import type { SQSEvent } from 'aws-lambda'
import { createConnection } from '@internal/database/connection'
import { onConflictDoUpdate } from '@internal/database/on'
import { people } from '@internal/database/schema'
import { EventCapturedEvent } from '@internal/events-schema/events'

const ConfigSchema = z.object({
  databaseUrl: z.string(),
})

const config = ConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
})

const connection = createConnection(config.databaseUrl)

export const buildHandler = async (event: SQSEvent) => {
  await connection
    .insert(people)
    .values(
      event.Records.filter((record) => {
        const { data } = EventCapturedEvent.fromEventBridgeEvent(
          JSON.parse(record.body)
        )

        /**
         * Filter out events that do not have a distinctId.
         * This is important because we only want to persist identified people.
         */
        return data.distinctId
      }).map((record) => {
        const { data, metadata } = EventCapturedEvent.fromEventBridgeEvent(
          JSON.parse(record.body)
        )

        return {
          id: data.distinctId!,
          tenantId: metadata.tenantId,
          properties: data.properties,
        }
      })
    )
    .onConflictDoUpdate({
      target: people.id,
      set: onConflictDoUpdate(people, ['properties']),
    })
}
