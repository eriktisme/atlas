'use client'

import { getColumns } from './columns'
import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@internal/design-system/components/ui/table'
import type {
  OrganizationMembershipResource,
  RoleResource,
  UserResource,
} from '@clerk/types'

interface Props {
  currentUser: UserResource
  memberships: OrganizationMembershipResource[]
  onWorkspaceMemberRemoved?: () => Promise<void>
  roles: RoleResource[]
}

export const MembersTable = (props: Props) => {
  const columns = useMemo(
    () =>
      getColumns({
        roles: props.roles,
        currentUser: props.currentUser,
        hasMoreThanOneAdmin:
          props.memberships.filter((member) => member.role === 'org:admin')
            .length > 1,
        onWorkspaceMemberRemoved: props.onWorkspaceMemberRemoved,
      }),
    [
      props.currentUser,
      props.memberships,
      props.onWorkspaceMemberRemoved,
      props.roles,
    ]
  )

  const table = useReactTable<OrganizationMembershipResource>({
    data: props.memberships,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
