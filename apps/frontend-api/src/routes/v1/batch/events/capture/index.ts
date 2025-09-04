import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import type { Bindings, Variables } from '@internal/lambda-utils/hono'
import {
  InternalErrorSchema,
  NotAuthorizedErrorSchema,
} from '@internal/lambda-utils/shared'
import { Tracer } from '@aws-lambda-powertools/tracer'
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge'
import { z } from 'zod'
import { EventCapturedEvent } from '@internal/events-schema/events'
import {
  CaptureEventsResponse,
  CaptureEventsBody,
} from '@internal/api-schema/events'

const ConfigSchema = z.object({
  eventBusName: z.string().min(1),
})

const config = ConfigSchema.parse({
  eventBusName: process.env.EVENT_BUS_NAME,
})

const tracer = new Tracer()

const eventBridgeClient = tracer.captureAWSv3Client(new EventBridgeClient())

export const app = new OpenAPIHono<{
  Bindings: Bindings
  Variables: Variables
}>()

const post = createRoute({
  method: 'post',
  path: '/',
  summary: 'Capture new events',
  description: 'Endpoint used to capture events into the system',
  request: {
    body: {
      content: {
        'application/json': { schema: CaptureEventsBody },
      },
    },
  },
  responses: {
    202: {
      content: {
        'application/json': {
          schema: CaptureEventsResponse,
        },
      },
      description: '',
    },
    401: {
      content: {
        'application/json': {
          schema: NotAuthorizedErrorSchema,
        },
      },
      description: 'Not Authorized',
    },
    500: {
      content: {
        'application/json': {
          schema: InternalErrorSchema,
        },
      },
      description: 'Internal Error',
    },
  },
})

app.openapi(post, async (c) => {
  const body = c.req.valid('json')
  const tenantId = c.get('tenantId')

  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: body.events.map((event) => ({
        Detail: JSON.stringify(
          EventCapturedEvent.toEventBridgeEventDetail(event, {
            tenantId,
          })
        ),
        DetailType: 'event.captured',
        EventBusName: config.eventBusName,
        Source: 'frontend-api',
        Time: new Date(),
      })),
    })
  )

  return c.json(
    {
      //
    },
    202
  )
})
