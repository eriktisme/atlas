import { buildHandler } from './handler'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import middy from '@middy/core'
import { z } from 'zod'
import { init } from '@sentry/aws-serverless'

const ConfigSchema = z.object({
  sentryDsn: z.string().optional(),
})

const config = ConfigSchema.parse({
  sentryDsn: process.env.SENTRY_DSN,
})

init({
  dsn: config.sentryDsn,
  tracesSampleRate: 1,
})

const tracer = new Tracer()

export const handler = middy(buildHandler).use(captureLambdaHandler(tracer))
