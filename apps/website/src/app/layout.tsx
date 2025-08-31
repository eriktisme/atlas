import './globals.css'
import type { PropsWithChildren } from 'react'
import { createMetadata } from '@internal/seo'
import { DesignSystemProvider } from '@internal/design-system'
import { Providers } from './providers'

export const metadata = createMetadata({
  // Add metadata here
})

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-svh flex-col bg-white font-sans text-neutral-900 antialiased">
        <Providers>
          <DesignSystemProvider>{children}</DesignSystemProvider>
        </Providers>
      </body>
    </html>
  )
}
