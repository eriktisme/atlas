import test, { expect } from '@playwright/test';

test('app is healthy', async ({ request }) => {
  const response = await request.get('/health');

  expect(response.status()).toBe(200);
})
