import { createContext, useContext } from 'react'
import type { Atlas } from '@atlas-labs/atlas-node'

interface AtlasContextState {
  atlasClient: Atlas
}

export const AtlasConfigContext = createContext<AtlasContextState | null>(null)

export const useAtlas = () => {
  const context = useContext(AtlasConfigContext)

  if (!context) {
    throw new Error('useAtlas must be used within an AtlasProvider')
  }

  return context
}
