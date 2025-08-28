import type { PropsWithChildren } from 'react'
import { Protect } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Layout({
  children,
}: Readonly<PropsWithChildren>) {
  const { has, orgSlug } = await auth()

  if (
    !has({
      role: 'org:admin',
    })
  ) {
    redirect(`/${orgSlug}/settings/account`)
  }

  return <Protect role="org:admin">{children}</Protect>
}
