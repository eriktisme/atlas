import { Toaster } from '@internal/design-system/components/ui/sonner';
import { TooltipProvider } from '@internal/design-system/components/ui/tooltip';
import { DesignSystemProvider } from '@internal/design-system';
import { withThemeByClassName } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react';

import '@internal/design-system/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    chromatic: {
      modes: {
        light: {
          theme: 'light',
          className: 'light',
        },
        dark: {
          theme: 'dark',
          className: 'dark',
        },
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => {
      return (
        <div>
          <DesignSystemProvider>
            <TooltipProvider>
              <Story />
            </TooltipProvider>
            <Toaster />
          </DesignSystemProvider>
        </div>
      );
    },
  ],
};

export default preview;
