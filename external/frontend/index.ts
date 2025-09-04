export type { ApiClient } from './api'
import type { CreateFrontendApiClientOptions } from './api'
import { createFrontendApiClient } from './api'

export type AtlasOptions = Omit<CreateFrontendApiClientOptions, 'apiUrl'> & {
  region: 'eu-west-1'
}

export function createAtlasClient(options: AtlasOptions) {
  return createFrontendApiClient({
    apiUrl: `https://frontend-api.${options.region}.atlas.erikvandam.dev`,
    ...options,
  })
}
