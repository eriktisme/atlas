import { TooltipProvider } from './components/ui/tooltip'
import type { ThemeProviderProps } from 'next-themes'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@internal/design-system/components/ui/sonner'

interface Props extends ThemeProviderProps {
  //
}

export const DesignSystemProvider = ({
  children,
  ...props
}: Readonly<Props>) => (
  <ThemeProvider {...props} forcedTheme="light">
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
  </ThemeProvider>
)
