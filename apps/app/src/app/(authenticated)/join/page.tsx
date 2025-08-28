import { CreateWorkspacePageTemplate } from '@/features/workspace-creation'
import { currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  const user = await currentUser()

  if (!user) {
    return null
  }

  return <CreateWorkspacePageTemplate />
}
