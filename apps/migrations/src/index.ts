import { z } from 'zod'
import { buildHandler } from './handler'
import type { MigrationEvent } from './types'
import { Tracer } from '@aws-lambda-powertools/tracer'
import type { Context } from 'aws-lambda'
import { createConnection } from '@internal/database/connection'

const ConfigSchema = z.object({
  databaseUrl: z.string(),
})

const config = ConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
})

new Tracer()

const connection = createConnection(config.databaseUrl)

export const handler = (event: MigrationEvent, context: Context) =>
  buildHandler(event, context, {
    connection,
  })
