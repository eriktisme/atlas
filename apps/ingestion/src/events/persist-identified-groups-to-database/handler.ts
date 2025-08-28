import { z } from 'zod'
import type { SQSEvent } from 'aws-lambda'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { createConnection } from '@internal/database/connection'
import { groups, personToGroup } from '@internal/database/schema'
import { EventCapturedEvent } from '@internal/events-schema/events'
import { onConflictDoUpdate } from '@internal/database/on'
import { isValidGroupIdentifyEventFilter } from './utils'

const ConfigSchema = z.object({
  databaseUrl: z.string(),
})

const config = ConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
})

new Tracer()

const connection = createConnection(config.databaseUrl)

export const buildHandler = async (event: SQSEvent) => {
  await connection
    .insert(groups)
    .values(
      event.Records.filter(isValidGroupIdentifyEventFilter).map((record) => {
        const { data, metadata } = EventCapturedEvent.fromEventBridgeEvent(
          JSON.parse(record.body)
        )

        return {
          id: data.properties!.groupKey!,
          type: data.properties!.groupType!,
          tenantId: metadata.tenantId,
          properties: data.properties,
        }
      })
    )
    .onConflictDoUpdate({
      target: groups.id,
      set: onConflictDoUpdate(groups, ['properties']),
    })

  await connection
    .insert(personToGroup)
    .values(
      event.Records.filter(isValidGroupIdentifyEventFilter).map((record) => {
        const { data } = EventCapturedEvent.fromEventBridgeEvent(
          JSON.parse(record.body)
        )

        return {
          groupId: data.properties!.groupKey!,
          personId: data.distinctId!,
        }
      })
    )
    .onConflictDoNothing()
}
