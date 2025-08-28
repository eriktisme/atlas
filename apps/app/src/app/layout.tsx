import './globals.css'
import type { PropsWithChildren } from 'react'
import { ClerkLoaded, ClerkLoading, ClerkProvider } from '@clerk/nextjs'
import { Loader2Icon } from 'lucide-react'
import { createMetadata } from '@internal/seo'
import { DesignSystemProvider } from '@internal/design-system'
import { Providers } from './providers'

export const metadata = createMetadata({
  // Add metadata here
})

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-svh font-sans text-neutral-900 antialiased">
          <ClerkLoading>
            <div className="flex min-h-svh flex-1 items-center justify-center">
              <div className="flex flex-row items-center gap-1.5">
                <Loader2Icon className="size-5 animate-spin text-neutral-500" />
                <div className="font-medium text-neutral-700">Loading...</div>
              </div>
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <Providers>
              <DesignSystemProvider>{children}</DesignSystemProvider>
            </Providers>
          </ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  )
}
