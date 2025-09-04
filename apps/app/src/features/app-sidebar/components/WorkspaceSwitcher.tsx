'use client'

import { CheckIcon, ChevronsUpDownIcon, LogOutIcon } from 'lucide-react'
import type { Organization, User } from '@clerk/backend'
import { useAuth, useClerk } from '@clerk/nextjs'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@internal/design-system/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@internal/design-system/components/ui/dropdown-menu'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@internal/design-system/components/ui/avatar'
import { env } from '@/env'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAtlas } from '@atlas/react'

interface Props {
  user: User | null
  workspaces: Organization[]
}

export const WorkspaceSwitcher = (props: Props) => {
  const { orgId } = useAuth()
  const { setActive, signOut } = useClerk()

  const { atlasClient } = useAtlas()

  const router = useRouter()

  const activeWorkspace = props.workspaces.find(
    (workspace) => workspace.id === orgId
  )

  const fullName = props.user?.fullName

  const emailAddress = props.user?.emailAddresses.at(0)?.emailAddress

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-auto data-[state=open]:bg-neutral-200/75 data-[state=open]:text-neutral-900"
            >
              <Avatar className="size-6 rounded-lg">
                <AvatarImage
                  src={activeWorkspace?.imageUrl}
                  alt={activeWorkspace?.name}
                />
                <AvatarFallback className="rounded-lg">
                  {activeWorkspace?.name}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeWorkspace?.name}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuSub>
              <Link href={`/${activeWorkspace?.slug}/settings/account`}>
                <DropdownMenuItem
                  onClick={() => {
                    void atlasClient.events.capture({
                      event: 'Opened Settings',
                    })
                  }}
                >
                  <span className="flex-1">Settings</span>
                  <DropdownMenuShortcut>G then S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuSubTrigger>
                <span className="flex-1">Switch workspace</span>
                <DropdownMenuShortcut>O then W</DropdownMenuShortcut>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuLabel>
                    {fullName ?? emailAddress}
                  </DropdownMenuLabel>
                  {props.workspaces.map((workspace) => (
                    <DropdownMenuItem
                      onClick={async () => {
                        await setActive({
                          organization: workspace.id,
                        })

                        void atlasClient.events.capture({
                          event: 'Switched Workspace',
                        })

                        router.push(`/${workspace.slug}`)
                      }}
                      key={`workspace-${workspace.id}`}
                    >
                      <Avatar className="size-4 rounded-md">
                        <AvatarImage
                          src={workspace?.imageUrl}
                          alt={workspace?.name}
                        />
                        <AvatarFallback className="rounded-md">
                          {workspace?.name}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1">{workspace.name}</span>
                      {workspace.id === activeWorkspace?.id ? (
                        <CheckIcon />
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <Link href="/join">
                    <DropdownMenuItem>
                      Create or join workspace
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem
              onClick={() =>
                signOut({
                  redirectUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
                })
              }
            >
              <LogOutIcon />
              <span>Log out</span>
              <DropdownMenuShortcut>⌃Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
