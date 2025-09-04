import { OpenAPIHono } from '@hono/zod-openapi'
import { handle } from 'hono/aws-lambda'
import { secureHeaders } from 'hono/secure-headers'
import type { Bindings } from '@internal/lambda-utils/hono'
import { app as v1Routes } from './routes/v1'
import { app as healthRoutes } from './routes/health'
import { swaggerUI } from '@hono/swagger-ui'
import { cors } from 'hono/cors'
import { captureException, flush, init } from '@sentry/aws-serverless'
import { z } from 'zod'

const ConfigSchema = z.object({
  domainName: z.string(),
  sentryDsn: z.string().optional(),
})

const config = ConfigSchema.parse({
  domainName: process.env.DOMAIN_NAME,
  sentryDsn: process.env.SENTRY_DSN,
})

init({
  dsn: config.sentryDsn,
  tracesSampleRate: 1,
})

const app = new OpenAPIHono<{ Bindings: Bindings }>()

app.use(secureHeaders())

app.use('*', (c, next) => {
  const origin = c.req.header('origin') || c.req.header('Origin') || '*'

  const corsMiddleware = cors({
    allowHeaders: [
      'Authorization',
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
    ],
    credentials: true,
    maxAge: 600,
    origin,
  })

  return corsMiddleware(c, next)
})

app.onError((error, c) => {
  const lambdaContext = c.env.lambdaContext

  captureException(error)

  void flush(0)

  return c.json(
    {
      statusCode: 500,
      type: 'internal_error',
      code: 'internal_error',
      requestId: lambdaContext.awsRequestId,
    },
    500
  )
})

app.route('v1', v1Routes)

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
  description:
    'Public key, obtained under the "API Keys" section in the Atlas Developer Settings.',
})

app.get(
  '/',
  swaggerUI({
    url: '/openapi',
  })
)

app.doc('/openapi', {
  openapi: '3.1.0',
  info: {
    version: '0.1.0',
    title: 'Atlas Frontend API',
  },
})

app.route('/health', healthRoutes)

export const handler = handle(app)
