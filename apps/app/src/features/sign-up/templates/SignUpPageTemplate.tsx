'use client'

import Link from 'next/link'
import { GalleryVerticalEnd } from 'lucide-react'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const SignUpForm = dynamic(() =>
  import('@clerk/nextjs').then((mod) => mod.SignUp)
)

export const SignUpPageTemplate = () => {
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
        <SignUpForm />
      </Suspense>
    </div>
  )
}
