import type { CdkCustomResourceResponse, Context } from 'aws-lambda'
import type { MigrationEvent } from './types'
import type { createConnection } from '@internal/database/connection'
import { migrate } from 'drizzle-orm/neon-http/migrator'

interface HandlerDeps {
  connection: ReturnType<typeof createConnection>
}

export const buildHandler = async (
  event: MigrationEvent,
  context: Context,
  deps: HandlerDeps
) => {
  if ('LogicalResourceId' in event) {
    const resp: CdkCustomResourceResponse = {
      LogicalResourceId: event.LogicalResourceId,
      PhysicalResourceId: context.logGroupName,
      RequestId: event.RequestId,
      StackId: event.StackId,
    }

    if (event.RequestType == 'Delete') {
      return {
        ...resp,
        Data: { Result: 'None' },
        Status: 'SUCCESS',
      }
    }

    return {
      ...resp,
      Status: 'SUCCESS',
    }
  }

  await migrate(deps.connection, {
    migrationsFolder: './migrations',
  })

  return {
    Status: 'SUCCESS',
  }
}
