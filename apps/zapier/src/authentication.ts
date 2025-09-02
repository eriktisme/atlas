import type { App } from 'zapier-platform-core'

const authentication: App['authentication'] = {
  type: 'custom',
  test: async (z, bundle) => {
    const { apiKey, region } = bundle.authData

    const response = await z.request({
      url: `https://api.${region}.atlas.erikvandam.dev/v1/people`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (response.status !== 200) {
      throw new Error(
        `The API Key you supplied is not valid. Status code: ${response.status}`
      )
    }

    return response.data
  },
  fields: [
    {
      computed: false,
      key: 'apiKey',
      required: true,
      label: 'API Key',
      type: 'string',
    },
    {
      computed: false,
      key: 'region',
      required: true,
      label: 'Region',
      type: 'string',
      choices: {
        'eu-west-1': 'EU (Ireland)',
      },
      default: 'eu-west-1',
    },
  ],
  connectionLabel: 'Atlas',
  customConfig: {},
}

export { authentication }
