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
      const { apiKey, region, targetUrl } = bundle.authData

      const response = await z.request({
        url: `https://app.${region}.atlas.erikvandam.dev/api/webhooks/zapier`,
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: {
          targetUrl,
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
        url: `https://app.${region}.atlas.erikvandam.dev/api/webhooks/zapier/${bundle.subscribeData.id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${bundle.authData.apiKey}` },
      })

      return response.data
    },
  },
}

export { newEvent, newEventKey }
