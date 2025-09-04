import { PeopleApi } from './endpoints'
import { buildRequest } from './request'

export type ApiClient = ReturnType<typeof createBackendApiClient>

export type CreateBackendApiClientOptions = Parameters<typeof buildRequest>[0]

export function createBackendApiClient(options: CreateBackendApiClientOptions) {
  const request = buildRequest(options)

  return {
    people: new PeopleApi(request),
  }
}
