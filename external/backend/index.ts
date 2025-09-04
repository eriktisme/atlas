import type { CreateBackendApiClientOptions } from './api'
import { createBackendApiClient } from './api'

export type AtlasOptions = Omit<CreateBackendApiClientOptions, 'apiUrl'> & {
  region: 'eu-west-1'
}

export function createAtlasClient(options: AtlasOptions) {
  return createBackendApiClient({
    apiUrl: `https://backend-api.${options.region}.atlas.erikvandam.dev`,
    ...options,
  })
}
