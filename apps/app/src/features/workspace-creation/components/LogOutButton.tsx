'use client'

import { useClerk } from '@clerk/nextjs'
import { Button } from '@internal/design-system/components/ui/button'
import { env } from '@/env'

export const LogOutButton = () => {
  const { signOut } = useClerk()

  return (
    <Button
      onClick={() =>
        signOut({ redirectUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL })
      }
      variant="ghost"
    >
      Log out
    </Button>
  )
}
