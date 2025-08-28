import type { z } from '@hono/zod-openapi'

export function isSuccess<T>(
  result: z.SafeParseReturnType<T, unknown>
): result is z.SafeParseSuccess<T> {
  return result.success
}
