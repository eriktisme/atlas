import type { UserOrganizationInvitationResource } from '@clerk/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@internal/design-system/components/ui/avatar'
import { Button } from '@internal/design-system/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAtlas } from '@atlas/react'
import { useUser } from '@clerk/nextjs'

interface Props {
  invitation: UserOrganizationInvitationResource
}

export const WorkspaceInvitation = (props: Props) => {
  const router = useRouter()

  const { user } = useUser()

  const workspace = props.invitation.publicOrganizationData

  const { atlasClient } = useAtlas()

  return (
    <div className="flex items-center">
      <div className="flex flex-1 items-center gap-3">
        <Avatar className="size-8 rounded-lg">
          <AvatarImage src={workspace.imageUrl} alt={workspace.name} />
          <AvatarFallback className="rounded-lg">
            {workspace.name}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col">
          <span className="truncate">{workspace.name}</span>
        </div>
      </div>
      <div>
        <Button
          onClick={async () => {
            await props.invitation.accept()

            atlasClient.identifyGroup({
              key: workspace.id,
              type: 'workspace',
              distinctId: user?.id,
            })

            void atlasClient.events.capture({
              event: 'User Accepted Workspace Invitation',
              distinctId: user?.id,
            })

            router.push(`/${props.invitation.publicOrganizationData.slug}`)
          }}
          variant="secondary"
        >
          Join
        </Button>
      </div>
    </div>
  )
}
