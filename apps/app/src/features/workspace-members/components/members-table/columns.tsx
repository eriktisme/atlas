'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { formatDistance } from 'date-fns/formatDistance'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@internal/design-system/components/ui/avatar'
import { SelectRole } from '../SelectRole'
import type {
  OrganizationCustomRoleKey,
  OrganizationMembershipResource,
  RoleResource,
  UserResource,
} from '@clerk/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@internal/design-system/components/ui/dropdown-menu'
import { Button } from '@internal/design-system/components/ui/button'
import { MoreHorizontalIcon } from 'lucide-react'
import { RemoveMemberFromWorkspace } from './RemoveMemberFromWorkspaceDialog'

interface GetColumnsParams {
  currentUser: UserResource
  hasMoreThanOneAdmin: boolean
  onWorkspaceMemberRemoved?: () => Promise<void>
  roles: RoleResource[]
}

export const getColumns = (
  params: GetColumnsParams
): Array<ColumnDef<OrganizationMembershipResource>> => [
  {
    accessorKey: 'fullName',
    header: () => <div>Name</div>,
    cell: ({ row }) => {
      const member = row.original.publicUserData

      return (
        <div className="flex w-full items-center gap-4">
          <Avatar className="size-8 rounded-full">
            {member?.imageUrl ? (
              <AvatarImage src={member.imageUrl} alt={member?.identifier} />
            ) : null}
            <AvatarFallback>{member?.identifier}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span>{member?.identifier}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: () => <div>Role</div>,
    cell: ({ row }) => {
      const member = row.original

      return (
        <SelectRole
          disabled={!params.hasMoreThanOneAdmin}
          onChange={async (role) => {
            await member.update({
              role: role as OrganizationCustomRoleKey,
            })
          }}
          value={member.role as OrganizationCustomRoleKey}
          options={params.roles.map(
            (role) => role.key as OrganizationCustomRoleKey
          )}
        />
      )
    },
  },
  {
    accessorKey: 'joined',
    header: () => <div>Joined</div>,
    cell: ({ row }) => {
      const member = row.original

      return (
        <span>
          {formatDistance(member.createdAt, new Date(), {
            addSuffix: true,
          })}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const member = row.original

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(
                    String(member.publicUserData?.userId)
                  )
                }
              >
                Copy ID
              </DropdownMenuItem>
              <RemoveMemberFromWorkspace
                onWorkspaceMemberRemoved={params.onWorkspaceMemberRemoved}
                member={member}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
