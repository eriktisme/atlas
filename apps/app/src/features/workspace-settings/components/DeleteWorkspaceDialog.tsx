'use client'

import { useTransition } from 'react'
import { useOrganization } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
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

export const DeleteWorkspaceDialog = () => {
  const [isPending, startTransition] = useTransition()

  const router = useRouter()

  const { isLoaded, organization } = useOrganization()

  const onDeleteOrganization = async () => {
    if (!isLoaded) {
      return
    }

    startTransition(async () => {
      await organization?.destroy()

      router.push('/')
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive">
          Delete Workspace
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <p>
            This will permanently delete {organization?.name} and all its data.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            loading={isPending}
            onClick={onDeleteOrganization}
            variant="destructive"
          >
            I understand the consequences – delete this workspace!
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
