import withBundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import { createSecureHeaders } from 'next-secure-headers'

export const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: createSecureHeaders({
          // HSTS Preload: https://hstspreload.org/
          forceHTTPSRedirect: [
            true,
            { maxAge: 63_072_000, includeSubDomains: true, preload: true },
          ],
        }),
      },
    ]
  },

  webpack(config) {
    return config
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  turbopack: {
    //
  },

  poweredByHeader: false,

  reactStrictMode: true,

  serverExternalPackages: [],

  typescript: {
    ignoreBuildErrors: true,
  },
}

export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig)
