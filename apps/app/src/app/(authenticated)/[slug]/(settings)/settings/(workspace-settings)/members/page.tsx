import { WorkspaceMembersPageTemplate } from '@/features/workspace-members'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Members',
}

export default async function Page() {
  return <WorkspaceMembersPageTemplate />
}
