import type { AtlasConfig } from './config'
import { Events } from './events'
import { Persistence } from './persistence'
import type { IdentifyGroupParams } from './types'
import { People } from './people'

export class Atlas {
  /**
   * Configuration for the Atlas instance.
   */
  config: AtlasConfig

  /**
   * The base endpoints for the Atlas APIs.
   */
  endpoints: {
    /**
     * The base URL for the public API.
     */
    backendApi: string

    /**
     * The base URL for the ingestion API.
     */
    ingestion: string
  }

  /**
   * Persistence layer for the Atlas instance.
   * This is used to store and retrieve data.
   */
  persistence: Persistence

  /**
   * Capture instance to handle event capturing.
   */
  events: Events

  /**
   * People instance to handle people related operations.
   */
  people: People

  constructor(key: string, config: Omit<AtlasConfig, 'key'>) {
    this.config = {
      ...config,
      key,
    }

    this.endpoints = {
      ingestion: `https://ingestion.${this.config.region}.atlas.erikvandam.dev`,
      backendApi: `https://backend-api.${this.config.region}.atlas.erikvandam.dev`,
    }
    this.events = new Events(this)
    this.persistence = new Persistence(this)
    this.people = new People(this)
  }

  /**
   * Associates a user with a unique identifier
   */
  identify(distinctId: string, properties?: Record<string, unknown>): void {
    this.persistence.register('userId', distinctId)

    void this.events.capture({
      distinctId,
      event: '$identify',
      properties,
    })
  }

  /**
   * Associates a user with a group for group-based analytics.
   */
  identifyGroup(params: IdentifyGroupParams): void {
    const existingGroups =
      this.persistence.read<Record<string, unknown>>('groups') ?? {}

    this.persistence.register('groups', {
      ...existingGroups,
      [params.type]: params.key,
    })

    void this.events.capture({
      distinctId: params.distinctId || `${params.type}_${params.key}`,
      event: '$groupIdentify',
      properties: {
        groupKey: params.key,
        groupType: params.type,
        ...params.properties,
      },
    })
  }

  headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.key}`,
    }
  }
}
