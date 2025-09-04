'use client'

import { type PropsWithChildren, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useAtlas } from '@atlas/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { queryConfig } from '@/lib/react-query'

export const Providers = (props: PropsWithChildren) => {
  const { user } = useUser()

  const { atlasClient } = useAtlas()

  useEffect(() => {
    if (user) {
      void atlasClient.identify(user.id)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: queryConfig,
        })
      }
    >
      {props.children}
    </QueryClientProvider>
  )
}
