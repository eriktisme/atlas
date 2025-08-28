'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@internal/design-system/components/ui/sidebar'
import type { ComponentProps } from 'react'
import { Protect, useOrganization } from '@clerk/nextjs'
import {
  BuildingIcon,
  ChevronLeftIcon,
  Settings2Icon,
  UsersIcon,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@internal/design-system/components/ui/tooltip'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminRoutes = [
  {
    key: 'workspace',
    label: 'Workspace',
    icon: <BuildingIcon />,
  },
  {
    key: 'members',
    label: 'Members',
    icon: <UsersIcon />,
  },
]

const accountRoutes = [
  {
    key: 'preferences',
    label: 'Preferences',
    icon: <Settings2Icon />,
  },
]

interface Props extends ComponentProps<typeof Sidebar> {
  //
}

export const SettingsSidebar = (props: Props) => {
  const pathname = usePathname()
  const { organization } = useOrganization()

  return (
    <Sidebar {...props} className="w-60">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={`/${organization?.slug}`}>
                  <SidebarMenuButton>
                    <ChevronLeftIcon />
                    <span>Back to app</span>
                  </SidebarMenuButton>
                </Link>
              </TooltipTrigger>
              <TooltipContent align="start">
                <div className="space-x-3">
                  <span>Back to app</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountRoutes.map((route) => {
                const currentPath = `/${organization?.slug}/settings/account/${route.key}`

                return (
                  <SidebarMenuItem key={`route-${route.key}`}>
                    <Link href={currentPath}>
                      <SidebarMenuButton isActive={currentPath === pathname}>
                        {route.icon}
                        <span>{route.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
          <Protect role="org:admin">
            <>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminRoutes.map((route) => {
                    const currentPath = `/${organization?.slug}/settings/${route.key}`

                    return (
                      <SidebarMenuItem key={`route-${route.key}`}>
                        <Link href={currentPath}>
                          <SidebarMenuButton
                            isActive={currentPath === pathname}
                          >
                            {route.icon}
                            <span>{route.label}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </>
          </Protect>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
