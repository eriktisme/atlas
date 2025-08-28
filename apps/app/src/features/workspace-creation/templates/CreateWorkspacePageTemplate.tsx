'use client'

import { CreateWorkspaceForm, LoggedInAs, LogOutButton } from '../components'
import { Suspense, useState } from 'react'
import { WorkspaceInvitations } from '../components'
import { useOrganizationList } from '@clerk/nextjs'

export const CreateWorkspacePageTemplate = () => {
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)

  const { isLoaded, userInvitations } = useOrganizationList({
    userInvitations: {
      infinite: true,
    },
  })

  if (!isLoaded) {
    return null
  }

  const shouldDisplayWorkspaceInvitations =
    userInvitations.data.length > 0 && !isCreatingWorkspace

  return (
    <div
      className="relative flex min-h-svh flex-col overflow-hidden bg-neutral-50 p-6 md:p-10"
      style={{
        overscrollBehavior: 'contain',
        scrollbarGutter: 'stable',
      }}
    >
      <div className="flex flex-auto flex-col items-center justify-center overflow-x-hidden py-12">
        <Suspense>
          {shouldDisplayWorkspaceInvitations ? (
            <WorkspaceInvitations
              setIsCreatingWorkspace={setIsCreatingWorkspace}
              invitations={userInvitations.data}
            />
          ) : (
            <CreateWorkspaceForm />
          )}
        </Suspense>
      </div>
      <div className="fixed right-6 top-6">
        <LoggedInAs />
      </div>
      <div className="fixed left-6 top-6">
        <LogOutButton />
      </div>
    </div>
  )
}
