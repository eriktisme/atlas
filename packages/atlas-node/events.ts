import type { Atlas } from './core'
import type { CaptureEventBody } from '@internal/api-schema/events'

export class Events {
  constructor(protected readonly instance: Atlas) {
    //
  }

  /**
   * Captures an event with the given parameters.
   */
  async capture(event: Omit<CaptureEventBody, 'timestamp'>) {
    const enrichedEvent: CaptureEventBody = {
      ...event,
      distinctId: this.instance.persistence.read('userId') ?? undefined,
      timestamp: new Date().toISOString(),
    }

    await fetch(`${this.instance.endpoints.ingestion}/v1/events/capture`, {
      method: 'POST',
      headers: this.instance.headers(),
      body: JSON.stringify(enrichedEvent),
    })
  }
}
