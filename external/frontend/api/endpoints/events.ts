import { BaseAPI } from '@atlas/javascript'
import type { CaptureEventBody } from '@internal/api-schema/events'

const basePath = '/events'

export class EventsApi extends BaseAPI {
  /**
   * Captures an event with the given parameters.
   */
  async capture(event: Omit<CaptureEventBody, 'timestamp'>) {
    return this.request({
      method: 'POST',
      body: event,
      path: `${basePath}/capture`,
    })
  }
}
