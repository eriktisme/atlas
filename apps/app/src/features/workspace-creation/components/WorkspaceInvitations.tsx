import type { UserOrganizationInvitationResource } from '@clerk/types'
import {
  Card,
  CardContent,
  CardFooter,
} from '@internal/design-system/components/ui/card'
import { WorkspaceInvitation } from './WorkspaceInvitation'
import { Button } from '@internal/design-system/components/ui/button'
import { PlusIcon } from 'lucide-react'

interface Props {
  invitations: UserOrganizationInvitationResource[]
  setIsCreatingWorkspace: (value: boolean) => void
}

export const WorkspaceInvitations = (props: Props) => {
  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-medium">
        You have access to these workspaces
      </h1>
      <div className="w-full max-w-[480px] text-center">
        <Card className="mb-8 text-left">
          <CardContent className="p-6">
            {props.invitations.map((invitation) => (
              <WorkspaceInvitation
                key={`invitation-${invitation.id}`}
                invitation={invitation}
              />
            ))}
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => props.setIsCreatingWorkspace(true)}
              variant="secondary"
            >
              <PlusIcon className="size-4" />
              <span>Create a new workspace</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
