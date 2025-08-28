'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import {
  Card,
  CardContent,
  CardFooter,
} from '@internal/design-system/components/ui/card'
import { Input } from '@internal/design-system/components/ui/input'
import { Button } from '@internal/design-system/components/ui/button'
import {
  FormControl,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@internal/design-system/components/ui/form'
import { useMemo, useTransition } from 'react'
import { useOrganization } from '@clerk/nextjs'

const FormSchema = z.object({
  name: z.string(),
})

type FormValues = z.infer<typeof FormSchema>

interface Props {
  name: string
}

export const GeneralWorkspaceSettingsForm = (props: Props) => {
  const [isPending, startTransition] = useTransition()

  const { isLoaded, organization } = useOrganization()

  const form = useForm<FormValues>({
    defaultValues: useMemo(
      () => ({
        name: props.name,
      }),
      [props.name]
    ),
  })

  const onSaveSettings = async (values: FormValues) => {
    if (!isLoaded) {
      return
    }

    startTransition(async () => {
      await organization?.update({
        name: values.name,
      })

      organization?.reload()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSaveSettings)}>
        <Card>
          <CardContent className="p-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="e.g. Acme" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end p-3 pt-0">
            <Button
              disabled={!form.formState.isValid}
              loading={isPending}
              type="submit"
            >
              Save
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
