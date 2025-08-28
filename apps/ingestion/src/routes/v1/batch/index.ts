import { OpenAPIHono } from '@hono/zod-openapi'
import type { Bindings } from '@internal/lambda-utils/hono'
import { app as eventsRoutes } from './events'

export const app = new OpenAPIHono<{ Bindings: Bindings }>()

app.route('/events', eventsRoutes)
