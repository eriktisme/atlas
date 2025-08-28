'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@internal/design-system/components/ui/sidebar'
import type { ComponentProps } from 'react'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import type { Organization, User } from '@clerk/backend'
import Link from 'next/link'
import { useOrganization } from '@clerk/nextjs'
import { LayoutDashboardIcon } from 'lucide-react'

interface Props extends ComponentProps<typeof Sidebar> {
  user: User | null
  workspaces: Organization[]
}

export const AppSidebar = ({ user, workspaces, ...props }: Props) => {
  const { organization } = useOrganization()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher user={user} workspaces={workspaces} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/${organization?.slug}/`}>
                  <SidebarMenuButton>
                    <LayoutDashboardIcon />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{/*  */}</SidebarFooter>
    </Sidebar>
  )
}
