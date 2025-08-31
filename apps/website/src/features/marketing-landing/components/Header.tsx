'use client'

import { GalleryVerticalEnd } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@internal/design-system/components/ui/button'
import { env } from '@/env'

export const Header = () => {
  return (
    <header className="sticky top-4 z-50 mt-4 flex items-center justify-between px-2 md:px-4">
      <div>
        <Link
          aria-label="Home"
          href="/"
          className="flex shrink-0 items-center gap-2.5"
        >
          <GalleryVerticalEnd className="size-4" />
          <span>Atlas</span>
        </Link>
      </div>
      <nav className="flex items-center gap-2.5">
        <Link
          href={`app.eu-west-1.${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/auth/sign-in`}
        >
          <Button variant="ghost">Sign in</Button>
        </Link>
        <Link
          href={`app.eu-west-1.${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}/auth/sign-up`}
        >
          <Button>Get Started</Button>
        </Link>
      </nav>
    </header>
  )
}
