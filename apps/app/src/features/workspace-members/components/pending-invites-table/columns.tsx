'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { formatDistance } from 'date-fns/formatDistance'
import type { OrganizationInvitationResource } from '@clerk/types'
import { MoreHorizontalIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@internal/design-system/components/ui/dropdown-menu'
import { Button } from '@internal/design-system/components/ui/button'

interface GetColumnsParams {
  onInvitationRevoked: () => Promise<void>
}

export const getColumns = (
  params: GetColumnsParams
): Array<ColumnDef<OrganizationInvitationResource>> => [
  {
    accessorKey: 'identifier',
    header: () => <div>Pending invites</div>,
    cell: ({ row }) => {
      return <span>{row.original.emailAddress}</span>
    },
  },
  {
    accessorKey: 'role',
    header: () => <div>Role</div>,
    cell: ({ row }) => {
      return (
        <span className="capitalize">
          {row.original.role.replace('org:', '')}
        </span>
      )
    },
  },
  {
    accessorKey: 'sent',
    header: () => <div>Sent</div>,
    cell: ({ row }) => {
      return (
        <span>
          {formatDistance(row.original.createdAt, new Date(), {
            addSuffix: true,
          })}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const invitation = row.original

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
              <DropdownMenuItem
                onClick={async () => {
                  await invitation.revoke()

                  await params.onInvitationRevoked()
                }}
              >
                Revoke invitation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
