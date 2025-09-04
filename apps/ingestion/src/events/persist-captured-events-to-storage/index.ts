import { buildHandler } from './handler'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import middy from '@middy/core'
import { z } from 'zod'
import { init } from '@sentry/aws-serverless'
import { S3Client } from '@aws-sdk/client-s3'
import type { SQSEvent } from 'aws-lambda'

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

const s3Client = tracer.captureAWSv3Client(new S3Client())

export const handler = middy((event: SQSEvent) =>
  buildHandler(event, {
    s3Client,
  })
).use(captureLambdaHandler(tracer))
