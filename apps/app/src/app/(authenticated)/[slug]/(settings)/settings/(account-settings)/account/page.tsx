import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { orgSlug } = await auth()

  return redirect(`/${orgSlug}/settings/account/preferences`)
}
