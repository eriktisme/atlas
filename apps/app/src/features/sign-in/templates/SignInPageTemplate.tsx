'use client'

import dynamic from 'next/dynamic'
import { GalleryVerticalEnd } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

const SignInForm = dynamic(() =>
  import('@clerk/nextjs').then((mod) => mod.SignIn)
)

export const SignInPageTemplate = () => {
  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      <Link
        href="#"
        className="flex items-center gap-2 self-center font-medium"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md">
          <GalleryVerticalEnd className="size-4" />
        </div>
        Atlas
      </Link>
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  )
}
