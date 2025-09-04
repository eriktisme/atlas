import { init } from '@sentry/nextjs'
import { env } from '@/env'

export const register = () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    init({
      dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    init({
      dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    })
  }
}
