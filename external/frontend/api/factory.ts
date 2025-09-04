import { EventsApi } from './endpoints'
import { buildRequest } from '@atlas/javascript'

export interface IdentifyGroupParams {
  /**
   * The unique identifier of the user associated with the group.
   */
  distinctId?: string

  /**
   * The unique identifier for that type of group.
   */
  key: string

  /**
   * Additional properties to associate with the group.
   *
   * This can include metadata about the group, such as its name, size, etc.
   */
  properties?: Record<string, unknown>

  /**
   * The type of the group.
   *
   * This can be used to categorize groups, such as 'organization', 'workspace', etc.
   */
  type: string
}

export type ApiClient = ReturnType<typeof createFrontendApiClient>

export type CreateFrontendApiClientOptions = Parameters<typeof buildRequest>[0]

export function createFrontendApiClient(
  options: CreateFrontendApiClientOptions
) {
  const request = buildRequest(options)

  const events = new EventsApi(request)

  /**
   * Associate a user with a unique identifier.
   */
  async function identify(
    distinctId: string,
    properties?: Record<string, unknown>
  ) {
    return events.capture({
      distinctId,
      event: '$identify',
      properties,
    })
  }

  /**
   * Associates a user with a group for group-based analytics.
   */
  async function identifyGroup(params: IdentifyGroupParams) {
    return events.capture({
      distinctId: params.distinctId || `${params.type}_${params.key}`,
      event: '$groupIdentify',
      properties: {
        groupKey: params.key,
        groupType: params.type,
        ...params.properties,
      },
    })
  }

  return {
    events,
    identify,
    identifyGroup,
  }
}
