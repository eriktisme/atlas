import './src/env'
import type { NextConfig } from 'next'
import { config, withAnalyzer } from '@internal/next-config'

let nextConfig: NextConfig = { ...config }

if (process.env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig)
}

export default nextConfig
