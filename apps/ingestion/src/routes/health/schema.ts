import { z } from 'zod'

export const HealthSchema = z
  .object({
    data: z.object({
      message: z.string().openapi({
        example: 'Hello World',
      }),
    }),
  })
  .openapi('HealthSchema')
