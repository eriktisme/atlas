'use client'

import { type PropsWithChildren } from 'react'
import { AtlasProvider } from '@internal/atlas-react'

export const Providers = (props: PropsWithChildren) => {
  return (
    <AtlasProvider
      config={{
        key: '',
        region: 'eu-west-1',
      }}
    >
      {props.children}
    </AtlasProvider>
  )
}
