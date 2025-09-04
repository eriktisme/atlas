'use client'

import { type PropsWithChildren } from 'react'
import { AtlasProvider } from '@atlas/react'
import { env } from '@/env'

export const Providers = (props: PropsWithChildren) => {
  return (
    <AtlasProvider
      config={{
        apiKey: env.NEXT_PUBLIC_ATLAS_PUBLISHABLE_KEY,
        apiVersion: 'v1',
        region: 'eu-west-1',
      }}
    >
      {props.children}
    </AtlasProvider>
  )
}
