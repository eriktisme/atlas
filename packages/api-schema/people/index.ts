import { z } from '@hono/zod-openapi'

export const PeopleQuery = z.object({
  distinctId: z
    .string()
    .optional()
    .openapi({
      description: 'Filter list of people by their distinct identifier',
      examples: ['user_123'],
    }),
  email: z
    .string()
    .optional()
    .openapi({
      description: 'Filter list of people by email address',
      examples: ['john.doe@example.org'],
    }),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .openapi({
      description: 'Limit the number of results returned',
      examples: [10, 20],
    }),
  offset: z
    .number()
    .int()
    .min(0)
    .optional()
    .openapi({
      description: 'Offset for pagination, starting from 0',
      examples: [0, 10],
    }),
})

export type PeopleQuery = z.infer<typeof PeopleQuery>

export const PersonParam = z.object({
  id: z.string().openapi({
    description: 'The unique identifier for the person',
    examples: ['user_123'],
  }),
})

export type PersonParam = z.infer<typeof PersonParam>

export const Person = z.object({
  id: z.string().openapi({
    description: 'Unique identifier for the person',
    examples: ['person_123'],
  }),
  properties: z.record(z.string(), z.any()).openapi({
    description: 'Key-value pairs representing the person’s properties',
    examples: [
      {
        name: 'John Doe',
        email: 'john.doe@example.org',
      },
    ],
  }),
})

export type Person = z.infer<typeof Person>

export const PeopleResponse = z.object({
  total: z
    .number()
    .int()
    .openapi({
      description: 'Total number of people matching the query',
      examples: [100],
    }),
  data: z.array(Person).openapi({
    description: 'List of people matching the query',
  }),
})

export type PeopleResponse = z.infer<typeof PeopleResponse>
