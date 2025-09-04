import type { SQSRecord } from 'aws-lambda/trigger/sqs'
import { EventCapturedEvent } from '@internal/events-schema/events'

export const isValidGroupIdentifyEventFilter = (record: SQSRecord) => {
  const { data } = EventCapturedEvent.fromEventBridgeEvent(
    JSON.parse(record.body)
  )

  /**
   * Ensure that the event has properties.
   * This is important because we have the keys used to identify groups,
   * in the properties.
   */
  if (!data.properties) {
    return false
  }

  /**
   * Ensure that the event has a groupType property.
   * This is important because we use this to identify the type of group.
   */
  if (!('groupType' in data.properties)) {
    return false
  }

  /**
   * Ensure that the event has a groupKey property.
   * This is important because we use this to identify the group.
   */
  if (!('groupKey' in data.properties)) {
    return false
  }

  /**
   * Filter out events that do not have a distinctId.
   * This is important because we only want to persist identified people.
   */
  return data.distinctId
}
