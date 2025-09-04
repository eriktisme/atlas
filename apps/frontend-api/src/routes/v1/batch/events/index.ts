import { OpenAPIHono } from '@hono/zod-openapi'
import type { Bindings } from '@internal/lambda-utils/hono'
import { app as captureRoutes } from './capture'

export const app = new OpenAPIHono<{ Bindings: Bindings }>()

app.route('/capture', captureRoutes)
