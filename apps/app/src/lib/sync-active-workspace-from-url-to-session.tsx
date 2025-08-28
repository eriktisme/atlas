'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth, useOrganizationList } from '@clerk/nextjs'

export function SyncActiveOrganizationFromURLToSession() {
  const { isLoaded, setActive } = useOrganizationList()

  const { orgSlug } = useAuth()

  const { slug } = useParams<{ slug: string }>()

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (slug !== orgSlug) {
      void setActive({ organization: slug })
    }
  }, [orgSlug, isLoaded, setActive, slug])

  return null
}
