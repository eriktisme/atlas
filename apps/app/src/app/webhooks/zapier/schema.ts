import { z } from 'zod'

export const WebhookRegistrationBodySchema = z.object({
  targetUrl: z.string(),
  event: z.string(),
  apiKey: z.string(),
})

export type WebhookRegistrationBody = z.infer<
  typeof WebhookRegistrationBodySchema
>
