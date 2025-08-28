'use client'

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@internal/design-system/components/ui/dropdown-menu'
import { useUser } from '@clerk/nextjs'
import { Button } from '@internal/design-system/components/ui/button'

export const LoggedInAs = () => {
  const { user } = useUser()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          {user?.primaryEmailAddress?.emailAddress}
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  )
}
