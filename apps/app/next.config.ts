import './src/env'
import type { NextConfig } from 'next'
import { config, withAnalyzer } from '@internal/next-config'
import { withSentryConfig } from '@sentry/nextjs'
import { env } from '@/env'

let nextConfig: NextConfig = { ...config }

if (process.env.VERCEL) {
  nextConfig = withSentryConfig(
    {
      ...nextConfig,
      transpilePackages: ['@sentry/nextjs'],
    },
    {
      org: env.SENTRY_ORG,
      project: env.SENTRY_PROJECT,
      silent: !process.env.CI,
      /*
       * For all available options, see:
       * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
       */

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      /*
       * Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
       */
      tunnelRoute: '/monitoring',

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    }
  )
}

if (process.env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig)
}

export default nextConfig
