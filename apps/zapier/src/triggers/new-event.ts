import type { Trigger } from 'zapier-platform-core'

const newEventKey = 'new_event'

const newEvent: Trigger = {
  key: newEventKey,
  noun: 'Event',
  display: {
    label: 'New Event',
    description: 'Triggers when an event is ingested in Atlas.',
  },
  operation: {
    type: 'hook',
    perform: (z, bundle) => {
      // This function will not be called, because it's a hook trigger.

      return Promise.resolve([])
    },
  },
}

export { newEvent, newEventKey }
