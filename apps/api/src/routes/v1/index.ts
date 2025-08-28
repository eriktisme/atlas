import { OpenAPIHono, z } from '@hono/zod-openapi'
import type { Bindings } from '@internal/lambda-utils/hono'
import { cors } from 'hono/cors'
import { app as peopleRoutes } from './people'
import type { MiddlewareHandler } from 'hono'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { createConnection } from '@internal/database/connection'
import { apiKeys } from '@internal/database/schema'
import { eq, and, isNull } from 'drizzle-orm'

const ConfigSchema = z.object({
  databaseUrl: z.string(),
})

const config = ConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
})

new Tracer()

const connection = createConnection(config.databaseUrl)

const auth: MiddlewareHandler = async (c, next) => {
  const auth = c.req.header('authorization')

  if (!auth || !auth.startsWith('Bearer ')) {
    return c.text('Unauthorized', 401)
  }

  const token = auth.split(' ')[1]

  const result = await connection
    .select()
    .from(apiKeys)
    .where(and(...[eq(apiKeys.key, token), isNull(apiKeys.revokedAt)]))
    .limit(1)

  if (!result || result.length === 0) {
    return c.text('Unauthorized', 401)
  }

  c.set('tenantId', result[0].tenantId)

  return next()
}

export const app = new OpenAPIHono<{ Bindings: Bindings }>()

app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: [
      'Authorization',
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
    ],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE'],
    exposeHeaders: [],
    maxAge: 600,
    credentials: true,
  })
)

app.use('*', auth)

app.route('/people', peopleRoutes)
