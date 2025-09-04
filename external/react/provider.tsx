import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { AtlasConfigContext } from './context'
import type { AtlasOptions } from '@atlas/frontend'
import { createAtlasClient } from '@atlas/frontend'

interface Props extends PropsWithChildren {
  config: AtlasOptions
}

export const AtlasProvider = (props: Props) => {
  const atlasClient = useMemo(() => {
    return createAtlasClient(props.config)
  }, [props.config])

  return (
    <AtlasConfigContext.Provider
      value={{
        atlasClient,
      }}
    >
      {props.children}
    </AtlasConfigContext.Provider>
  )
}
