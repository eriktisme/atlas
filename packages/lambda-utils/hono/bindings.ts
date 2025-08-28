import type { LambdaContext, LambdaEvent } from 'hono/aws-lambda'

export type Bindings = {
  event: LambdaEvent
  lambdaContext: LambdaContext
}

export type Variables = {
  tenantId: string
}
