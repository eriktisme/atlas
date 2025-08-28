import 'server-only'

import type { ReactNode } from 'react'
import { auth, currentUser } from '@clerk/nextjs/server'
import { Providers } from './providers'

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const user = await currentUser()
  const { redirectToSignIn } = await auth()

  if (!user) {
    redirectToSignIn()
  }

  return <Providers>{children}</Providers>
}
