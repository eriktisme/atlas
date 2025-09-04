import type {
  PeopleQuery,
  PeopleResponse,
  Person,
} from '@internal/api-schema/people'
import { BaseAPI } from './base'

const basePath = '/people'

export class PeopleApi extends BaseAPI {
  /**
   * Retrieves a list of people.
   */
  async list(query?: PeopleQuery) {
    return this.request<PeopleResponse>({
      method: 'GET',
      path: basePath,
      query,
    })
  }

  /**
   * Retrieve a single person by their unique identifier.
   */
  async get(id: string) {
    return this.request<Person | null>({
      method: 'GET',
      path: `${basePath}/${id}`,
    })
  }

  /**
   * Delete a person by their unique identifier.
   */
  async delete(id: string) {
    return this.request<Person | null>({
      method: 'DELETE',
      path: `${basePath}/${id}`,
    })
  }
}
