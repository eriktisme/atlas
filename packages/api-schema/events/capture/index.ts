import { z } from '@hono/zod-openapi'

export const CaptureEventBody = z.object({
  distinctId: z
    .string()
    .optional()
    .openapi({
      description:
        'A unique identifier for the entity associated with the event',
      examples: ['user_123'],
    }),
  event: z
    .string()
    .min(1)
    .openapi({
      description: 'The name of the event being captured',
      examples: ['UserRegistered', 'OrderPlaced', 'PaymentProcessed'],
    }),
  properties: z.record(z.string(), z.any()).optional().openapi({
    description:
      'The properties associated with the event, can be any key-value pairs',
    examples: [],
  }),
  timestamp: z
    .string()
    .datetime()
    .openapi({
      description: 'The timestamp of the event in ISO 8601 format',
      examples: ['2023-10-01T12:00:00Z'],
    }),
  context: z
    .object({
      userAgent: z
        .string()
        .optional()
        .openapi({
          description: 'The user agent string of the client making the request',
          examples: [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ],
        }),
      referrer: z
        .string()
        .optional()
        .openapi({
          description: 'The referrer URL of the request',
          examples: ['https://example.com'],
        }),
      locale: z
        .string()
        .optional()
        .openapi({
          description: 'The locale of the request, e.g., "en-US"',
          examples: ['en-US', 'fr-FR'],
        }),
      page: z
        .string()
        .optional()
        .openapi({
          description: 'The page URL where the event occurred',
          examples: ['https://example.com/home'],
        }),
    })
    .optional()
    .openapi({
      description: 'Contextual information about the event',
      examples: [
        {
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          referrer: 'https://example.com',
          locale: 'en-US',
          page: 'https://example.com/home',
        },
      ],
    }),
})

export type CaptureEventBody = z.infer<typeof CaptureEventBody>

export const CaptureEventResponse = z.object({
  // Define the response structure for the capture endpoint
})

export const CaptureEventsBody = z.object({
  events: z.array(CaptureEventBody).openapi({
    description: 'An array of events to be captured',
    examples: [],
  }),
})

export type CaptureEventsBody = z.infer<typeof CaptureEventsBody>

export const CaptureEventsResponse = z.object({
  // Define the response structure for the capture endpoint
})
