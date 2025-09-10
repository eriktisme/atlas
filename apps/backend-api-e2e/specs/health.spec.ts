import test, { expect } from '@playwright/test'

test('api is healthy', async ({ request }) => {
  const response = await request.get('/health')

  expect(response.status()).toBe(200)
})
