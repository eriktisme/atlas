import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import type { Bindings } from '@internal/lambda-utils/hono'
import { HealthSchema } from './schema'

export const app = new OpenAPIHono<{ Bindings: Bindings }>()

const index = createRoute({
  method: 'get',
  path: '/',
  summary: 'Health',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HealthSchema,
        },
      },
      description: 'Retrieve health',
    },
  },
})

app.openapi(index, async (c) => {
  return c.json(
    {
      data: {
        message: 'Hello World',
      },
    },
    200
  )
})
