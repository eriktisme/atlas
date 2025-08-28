import type { PropsWithChildren } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Layout(props: Readonly<PropsWithChildren>) {
  const user = await currentUser()

  if (user) {
    return redirect('/')
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-neutral-50 p-6 md:p-10">
      {props.children}
    </div>
  )
}
