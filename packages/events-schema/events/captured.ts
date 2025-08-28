import type { EventBridgeEvent } from 'aws-lambda'
import type { Metadata, Options } from '../shared'
import type { CaptureEventBody } from '@internal/api-schema/events'

export type EventCapturedEventDetail = {
  data: CaptureEventBody
  metadata: Metadata
}

export class EventCapturedEvent {
  static toEventBridgeEventDetail = (
    data: CaptureEventBody,
    options: Options
  ): EventBridgeEvent<'event.captured', EventCapturedEventDetail>['detail'] => {
    return {
      data,
      metadata: {
        tenantId: options.tenantId,
      },
    }
  }

  static fromEventBridgeEvent = (
    event: EventBridgeEvent<'event.captured', EventCapturedEventDetail>
  ): EventCapturedEventDetail => {
    return event.detail
  }
}
