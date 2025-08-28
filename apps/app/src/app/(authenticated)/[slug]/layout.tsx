import type { ReactNode } from 'react'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'

const client = await clerkClient()

export default async function Layout(
  props: Readonly<{
    children: ReactNode
    params: Promise<{
      slug: string
    }>
  }>
) {
  const params = await props.params

  const { redirectToSignIn, userId } = await auth()

  if (!userId) {
    redirectToSignIn()

    return
  }

  try {
    const organization = await client.organizations.getOrganization({
      slug: params.slug,
    })

    const memberships = await client.users.getOrganizationMembershipList({
      limit: 500,
      userId,
    })

    if (
      !memberships.data.some(
        (membership) => membership.organization.id === organization.id
      )
    ) {
      return notFound()
    }
  } catch {
    return notFound()
  }

  return <>{props.children}</>
}
