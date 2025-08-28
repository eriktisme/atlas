'use client'

import { useHotkeys } from 'react-hotkeys-hook'

import { useOrganization } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export const WorkspaceSettingsHotKeys = () => {
  const router = useRouter()

  const { isLoaded, organization } = useOrganization()

  useHotkeys('cmd+esc', (evt) => {
    evt.preventDefault()

    if (!isLoaded) {
      return
    }

    router.push(`/${organization?.slug}`)
  })

  return null
}
