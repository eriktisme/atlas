import type { ReactNode } from 'react'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@internal/design-system/components/ui/sidebar'
import { AppSidebar } from '@/features/app-sidebar'
import { clerkClient, currentUser } from '@clerk/nextjs/server'
import type { Organization } from '@clerk/backend'
import { HotKeys } from '@/features/hot-keys'
import { SyncActiveOrganizationFromURLToSession } from '@/lib/sync-active-workspace-from-url-to-session'

const client = await clerkClient()

export default async function Layout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const user = await currentUser()

  if (!user) {
    return null
  }

  const response = await client.users.getOrganizationMembershipList({
    userId: user.id,
  })

  const workspaces: Organization[] = response.data.map((membership) =>
    JSON.parse(JSON.stringify(membership.organization))
  )

  return (
    <>
      <SidebarProvider>
        <AppSidebar
          workspaces={workspaces}
          user={user ? JSON.parse(JSON.stringify(user)) : null}
        />
        <SidebarInset>
          <div className="pointer-events-auto flex flex-1 flex-col place-items-stretch overflow-auto">
            <div className="block px-3 py-2 md:hidden">
              <SidebarTrigger />
            </div>
            <div className="relative flex flex-1 flex-col items-stretch gap-4 overflow-hidden px-4 lg:p-4">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <HotKeys />
      <SyncActiveOrganizationFromURLToSession />
    </>
  )
}
