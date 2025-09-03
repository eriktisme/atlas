'use client'

import { type PropsWithChildren } from 'react'
import { AtlasProvider } from '@internal/atlas-react'
import { env } from '@/env'

export const Providers = (props: PropsWithChildren) => {
  return (
    <AtlasProvider
      config={{
        key: env.NEXT_PUBLIC_ATLAS_PUBLISHABLE_KEY,
        region: 'eu-west-1',
      }}
    >
      {props.children}
    </AtlasProvider>
  )
}
