'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent } from '@internal/design-system/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@internal/design-system/components/ui/form'
import { useTransition } from 'react'
import { Input } from '@internal/design-system/components/ui/input'
import { Button } from '@internal/design-system/components/ui/button'
import { useOrganizationList, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useAtlas } from '@atlas/react'

const FormSchema = z.object({
  name: z.string().min(1),
})

type FormValues = z.infer<typeof FormSchema>

export const CreateWorkspaceForm = () => {
  const router = useRouter()

  const { user } = useUser()
  const { createOrganization, isLoaded, setActive } = useOrganizationList()

  const { atlasClient } = useAtlas()

  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
    },
  })

  const onCreateWorkspace = async (values: FormValues) => {
    if (!isLoaded) {
      return
    }

    startTransition(async () => {
      const organization = await createOrganization({ name: values.name })

      atlasClient.identifyGroup({
        key: organization.id,
        type: 'workspace',
        distinctId: user?.id,
      })

      await atlasClient.events.capture({
        event: 'Workspace Created',
        distinctId: user?.id,
        properties: {
          name: values.name,
        },
      })

      await setActive({
        organization: organization.id,
      })

      router.push(`/${organization.slug}`)
    })
  }

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-medium">
        Create a new workspace
      </h1>
      <p className="mb-8 max-w-md text-center text-base">
        Workspaces are shared environments where teams can work together.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onCreateWorkspace)}
          className="w-full max-w-[480px] text-center"
        >
          <Card className="mb-8 text-left">
            <CardContent className="p-6">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <Button
            loading={isPending}
            disabled={!form.formState.isValid}
            className="w-80"
            type="submit"
          >
            Create workspace
          </Button>
        </form>
      </Form>
    </>
  )
}
