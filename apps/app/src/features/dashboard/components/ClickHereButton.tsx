'use client'

import { Button } from '@internal/design-system/components/ui/button'
import { useAtlas } from '@atlas-labs/atlas-react'

export const ClickHereButton = () => {
  const { atlasClient } = useAtlas()

  return (
    <Button
      onClick={() => {
        void atlasClient.events.capture({
          event: 'Button Clicked',
        })
      }}
    >
      Click Here
    </Button>
  )
}
