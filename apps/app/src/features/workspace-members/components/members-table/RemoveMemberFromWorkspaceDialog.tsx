'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@internal/design-system/components/ui/alert-dialog'
import { Button } from '@internal/design-system/components/ui/button'
import { DropdownMenuItem } from '@internal/design-system/components/ui/dropdown-menu'
import type { OrganizationMembershipResource } from '@clerk/types'
import { useUser } from '@clerk/nextjs'

interface Props {
  member: OrganizationMembershipResource
  onWorkspaceMemberRemoved?: () => Promise<void>
}

export const RemoveMemberFromWorkspace = (props: Props) => {
  const { user } = useUser()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          disabled={props.member.publicUserData?.userId === user?.id}
          onSelect={(e) => {
            e.preventDefault()
          }}
        >
          Remove from workspace
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member from workspace?</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <p>Are you sure you want to remove this user from the workspace?</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={async () => {
              await props.member.destroy()

              await props.onWorkspaceMemberRemoved?.()
            }}
            variant="destructive"
          >
            Remove member
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
