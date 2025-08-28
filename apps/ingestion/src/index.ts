import { OpenAPIHono } from '@hono/zod-openapi'
import { handle } from 'hono/aws-lambda'
import { secureHeaders } from 'hono/secure-headers'
import type { Bindings } from '@internal/lambda-utils/hono'
import { app as v1Routes } from './routes/v1'
import { app as healthRoutes } from './routes/health'
import { swaggerUI } from '@hono/swagger-ui'

const app = new OpenAPIHono<{ Bindings: Bindings }>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ success: false, errors: result.error.errors }, 422)
    }

    return c.json({ success: true }, 200)
  },
})

app.use(secureHeaders())

app.route('v1', v1Routes)

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
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
    title: 'Atlas Ingestion API',
  },
})

app.route('/health', healthRoutes)

export const handler = handle(app)
