'use client'

import { useOrganization } from '@clerk/nextjs'
import {
  GeneralWorkspaceSettingsForm,
  DeleteWorkspaceCard,
} from '../components'

export const WorkspaceSettingsPageTemplate = () => {
  const { isLoaded, organization } = useOrganization()

  if (!isLoaded) {
    return null
  }

  return (
    <div
      className="relative mx-auto flex w-full max-w-2xl flex-col gap-4 overflow-hidden p-6 md:p-10"
      style={{
        overscrollBehavior: 'contain',
        scrollbarGutter: 'stable',
      }}
    >
      <h1 className="text-2xl font-medium">Workspace</h1>
      <p className="mb-2 truncate text-base text-neutral-900">
        Change the settings for your current workspace.
      </p>
      <GeneralWorkspaceSettingsForm name={organization?.name || ''} />
      <DeleteWorkspaceCard />
    </div>
  )
}
