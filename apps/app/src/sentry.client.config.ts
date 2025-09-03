import { init } from '@sentry/nextjs'
import { env } from '@/env'

const initializeSentry = (): ReturnType<typeof init> =>
  init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,

    tracesSampleRate: 0.2,

    debug: false,
  })

initializeSentry()
