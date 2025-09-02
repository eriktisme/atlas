import { defineApp, version as platformVersion } from 'zapier-platform-core'

import { version } from '../package.json'

import { authentication } from './authentication'
import { includeApiKey } from './middleware'
import { newEvent, newEventKey } from './triggers/new-event'

export default defineApp({
  version,
  platformVersion,
  authentication,
  beforeRequest: [includeApiKey],
  afterResponse: [],
  triggers: {
    [newEventKey]: newEvent,
  },
  creates: {},
  resources: {},
})
