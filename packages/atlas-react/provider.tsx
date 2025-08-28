import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import type { AtlasConfig } from '@atlas-labs/atlas-node'
import { Atlas } from '@atlas-labs/atlas-node'
import { AtlasConfigContext } from './context'

interface Props extends PropsWithChildren {
  config: AtlasConfig
}

export const AtlasProvider = (props: Props) => {
  const atlasClient = useMemo(() => {
    return new Atlas(props.config.key, {
      region: props.config.region,
    })
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
