import type { ReactNode } from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const { orgSlug } = await auth()

  if (orgSlug) {
    return redirect(`/${orgSlug}`)
  }

  return <>{children}</>
}
