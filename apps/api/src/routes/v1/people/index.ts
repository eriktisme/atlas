import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import type { Bindings, Variables } from '@internal/lambda-utils/hono'
import {
  PeopleQuery,
  PeopleResponse,
  Person,
  PersonParam,
} from '@internal/api-schema/people'
import {
  InternalErrorSchema,
  NotAuthorizedErrorSchema,
  NotFoundErrorSchema,
} from '@internal/lambda-utils/shared'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { Logger } from '@aws-lambda-powertools/logger'
import { createConnection } from '@internal/database/connection'
import { people } from '@internal/database/schema'
import type { SQL } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import { and, eq } from 'drizzle-orm'
import { isSuccess } from '@internal/lambda-utils/utils'

const ConfigSchema = z.object({
  databaseUrl: z.string(),
})

const config = ConfigSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
})

new Tracer()

const logger = new Logger()

const connection = createConnection(config.databaseUrl)

export const app = new OpenAPIHono<{
  Bindings: Bindings
  Variables: Variables
}>()

const index = createRoute({
  method: 'get',
  path: '/',
  summary: 'Get list of people',
  description: 'Endpoint used to get a list of people with optional filters.',
  request: {
    query: PeopleQuery,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PeopleResponse,
        },
      },
      description: 'Returns a list of people',
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

const get = createRoute({
  method: 'get',
  path: '/{id}',
  summary: 'Get a single person',
  description: 'Endpoint used to get a single person by their ID.',
  request: {
    params: PersonParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: Person,
        },
      },
      description: 'Returns a single person',
    },
    401: {
      content: {
        'application/json': {
          schema: NotAuthorizedErrorSchema,
        },
      },
      description: 'Not Authorized',
    },
    404: {
      content: {
        'application/json': {
          schema: NotFoundErrorSchema,
        },
      },
      description: 'Not Found',
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

const deleteRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  summary: 'Delete a single person',
  description: 'Endpoint used to delete a single person by their ID.',
  request: {
    params: PersonParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: Person,
        },
      },
      description: 'Returns the deleted person',
    },
    401: {
      content: {
        'application/json': {
          schema: NotAuthorizedErrorSchema,
        },
      },
      description: 'Not Authorized',
    },
    404: {
      content: {
        'application/json': {
          schema: NotFoundErrorSchema,
        },
      },
      description: 'Not Found',
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

app.openapi(index, async (c) => {
  const lambdaContext = c.env.lambdaContext

  const query = c.req.valid('query')
  const tenantId = c.get('tenantId')

  const filters: SQL[] = []

  if (query.distinctId) {
    filters.push(eq(people.id, query.distinctId))
  }

  if (query.email) {
    filters.push(sql`properties->>'email' = ${query.email}`)
  }

  const result = await connection
    .select()
    .from(people)
    .where(and(eq(people.tenantId, tenantId), ...filters))
    .limit(query.limit ?? 100)
    .offset(query.offset ?? 0)

  const response = result.map((person) => {
    return Person.safeParse({
      id: person.id,
      properties: person.properties,
    })
  })

  if (!response.every(isSuccess)) {
    logger.error('Failed to parse people response', {
      errors: response.filter((r) => !r.success).map((r) => r.error),
      requestId: lambdaContext.awsRequestId,
    })

    return c.json(
      {
        code: 'internal_error',
        type: 'internal_error',
        statusCode: 500,
        requestId: lambdaContext.awsRequestId,
      },
      500
    )
  }

  /**
   * TODO: Add the total count of people in the database.
   */
  return c.json(
    {
      data: response.filter(isSuccess).map((r) => r.data),
      total: 0,
    },
    200
  )
})

app.openapi(get, async (c) => {
  const lambdaContext = c.env.lambdaContext

  const param = c.req.valid('param')
  const tenantId = c.get('tenantId')

  const [result] = await connection
    .select()
    .from(people)
    .where(and(eq(people.tenantId, tenantId), eq(people.id, param.id)))

  if (!result) {
    return c.json(
      {
        code: 'not_found',
        type: 'not_found',
        statusCode: 404,
        requestId: lambdaContext.awsRequestId,
      },
      404
    )
  }

  const response = Person.safeParse({
    id: result.id,
    properties: result.properties,
  })

  if (!response.success) {
    logger.error('Failed to parse people response', {
      errors: response.error,
      requestId: lambdaContext.awsRequestId,
    })

    return c.json(
      {
        code: 'internal_error',
        type: 'internal_error',
        statusCode: 500,
        requestId: lambdaContext.awsRequestId,
      },
      500
    )
  }

  return c.json(response.data, 200)
})

app.openapi(deleteRoute, async (c) => {
  const lambdaContext = c.env.lambdaContext

  const param = c.req.valid('param')
  const tenantId = c.get('tenantId')

  const [result] = await connection
    .delete(people)
    .where(and(eq(people.tenantId, tenantId), eq(people.id, param.id)))
    .returning()

  if (!result) {
    return c.json(
      {
        code: 'not_found',
        type: 'not_found',
        statusCode: 404,
        requestId: lambdaContext.awsRequestId,
      },
      404
    )
  }

  const response = Person.safeParse({
    id: result.id,
    properties: result.properties,
  })

  if (!response.success) {
    logger.error('Failed to parse people response', {
      errors: response.error,
      requestId: lambdaContext.awsRequestId,
    })

    return c.json(
      {
        code: 'internal_error',
        type: 'internal_error',
        statusCode: 500,
        requestId: lambdaContext.awsRequestId,
      },
      500
    )
  }

  return c.json(response.data, 200)
})
