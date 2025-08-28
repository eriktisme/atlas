'use client'

import {
  DialogTitle,
  Dialog,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@internal/design-system/components/ui/dialog'
import { Button } from '@internal/design-system/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { useOrganization } from '@clerk/nextjs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@internal/design-system/components/ui/form'
import { Input } from '@internal/design-system/components/ui/input'
import { toast } from 'sonner'
import type { ClerkAPIError } from '@clerk/types'
import { useAtlas } from '@internal/atlas-react'

const FormSchema = z.object({
  email: z.string().email(),
})

type FormValues = z.infer<typeof FormSchema>

interface Props {
  onInvitationSent?: () => Promise<void>
}

export const InviteMemberDialog = (props: Props) => {
  const [inviting, setInviting] = useState(false)

  const [isPending, startTransition] = useTransition()

  const { isLoaded, organization } = useOrganization()

  const { atlasClient } = useAtlas()

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  })

  if (!organization) {
    return null
  }

  const onInviteMember = async (values: FormValues) => {
    if (!isLoaded) {
      return
    }

    startTransition(async () => {
      try {
        await organization.inviteMembers({
          emailAddresses: [values.email],
          role: 'org:admin',
        })

        void atlasClient.events.capture({
          event: 'User Has Invited Members',
        })

        await props.onInvitationSent?.()
      } catch (e) {
        const err = e as Error
        if ('errors' in err) {
          const apiError = (err.errors as ClerkAPIError[])[0]

          if (apiError.code === 'already_a_member_in_organization') {
            toast.error('Member already part of the workspace')
          }
        }

        return
      }

      form.reset()

      setInviting(false)

      toast.message('User invited', {
        description: 'Invited users have been notified by email.',
      })
    })
  }

  return (
    <Dialog onOpenChange={setInviting} open={inviting}>
      <Button
        onClick={() => {
          setInviting(true)

          void atlasClient.events.capture({
            event: 'Invite Member Dialog Opened',
          })
        }}
      >
        Invite Users
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Enter the email address of the user you’d like to invite.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onInviteMember)}
            className="space-y-4"
          >
            <div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={!form.formState.isValid}
                loading={isPending}
                type="submit"
              >
                Send invite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
