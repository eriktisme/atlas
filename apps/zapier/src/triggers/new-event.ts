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
      return [bundle.cleanedRequest]
    },
    performSubscribe: async (z, bundle) => {
      const { apiKey, region } = bundle.authData

      const response = await z.request({
        url: `https://app.${region}.atlas.erikvandam.dev/webhooks/zapier`,
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: {
          targetUrl: bundle.targetUrl,
          event: newEventKey,
          apiKey,
        },
      })

      return response.data
    },
    performUnsubscribe: async (z, bundle) => {
      const { region } = bundle.authData

      if (!bundle.subscribeData || !bundle.subscribeData.id) {
        throw new Error('Missing integration id for unsubscribe operation.')
      }

      const response = await z.request({
        url: `https://app.${region}.atlas.erikvandam.dev/webhooks/zapier/${bundle.subscribeData.id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${bundle.authData.apiKey}` },
      })

      return response.data
    },
    outputFields: [
      {
        key: 'id',
        label: 'Event ID',
      },
      {
        key: 'distinctId',
        label: 'Distinct ID',
      },
      {
        key: 'event',
        label: 'Event Name',
      },
      {
        key: 'properties',
        label: 'Event Properties',
      },
      {
        key: 'timestamp',
        label: 'Event Timestamp',
      },
    ],
    sample: {
      id: 'evt_12345',
      distinctId: 'user_12345',
      event: '$identify',
      properties: {
        // Add relevant event properties here
      },
      timestamp: '2024-01-01T12:00:00Z',
    },
  },
}

export { newEvent, newEventKey }
