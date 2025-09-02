import type { BeforeRequestMiddleware } from 'zapier-platform-core'

export const includeApiKey: BeforeRequestMiddleware = (request, _, bundle) => {
  if (bundle.authData && bundle.authData.apiKey) {
    request.headers = request.headers || {}
    request.headers['Authorization'] = `Bearer ${bundle.authData.apiKey}`
  }

  return request
}
