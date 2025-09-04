import type { Atlas } from './core'
import type {
  PeopleQuery,
  PeopleResponse,
  Person,
} from '@internal/api-schema/people'
import { isSecretKey } from './utils'

export class People {
  constructor(protected readonly instance: Atlas) {
    //
  }

  /**
   * Retrieves a list of people.
   */
  async list(query?: PeopleQuery): Promise<PeopleResponse> {
    if (!isSecretKey(this.instance.config.key)) {
      throw new Error(
        'The people module is only allowed to be used from a secure environment.'
      )
    }

    const url = new URL(`${this.instance.endpoints.backendApi}/v1/people`)

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value.toString())
        }
      })
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.instance.headers(),
    })

    if (!response.ok) {
      /**
       * TODO: Think about how we want to handle errors.
       */
      return {
        data: [],
        total: 0,
      }
    }

    return response.json()
  }

  /**
   * Retrieve a single person by their unique identifier.
   */
  async get(id: string): Promise<Person | null> {
    if (!isSecretKey(this.instance.config.key)) {
      throw new Error(
        'The people module is only allowed to be used from a secure environment.'
      )
    }

    const url = new URL(`${this.instance.config.region}/v1/people/${id}`)

    const response = await fetch(url, {
      method: 'GET',
      headers: this.instance.headers(),
    })

    if (!response.ok) {
      /**
       * TODO: Think about how we want to handle errors.
       */
      return null
    }

    return response.json()
  }

  /**
   * Delete a person by their unique identifier.
   */
  async delete(id: string): Promise<Person | null> {
    if (!isSecretKey(this.instance.config.key)) {
      throw new Error(
        'The people module is only allowed to be used from a secure environment.'
      )
    }

    const url = new URL(`${this.instance.config.region}/v1/people/${id}`)

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.instance.headers(),
    })

    if (!response.ok) {
      /**
       * TODO: Think about how we want to handle errors.
       */
      return null
    }

    return response.json()
  }
}
