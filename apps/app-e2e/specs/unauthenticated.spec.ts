import { test, expect } from '@playwright/test'
import { setupClerkTestingToken } from '@clerk/testing/playwright'

test.describe.configure({
  mode: 'serial',
})

test.describe('rendering', () => {
  test('has sign in page', async ({ page }) => {
    await page.goto('sign-in')

    await expect(page).toHaveTitle(/Sign In/)
  })

  test('has sign up page', async ({ page }) => {
    await page.goto('sign-up')

    await expect(page).toHaveTitle(/Sign Up/)
  })
})

test.describe('interaction', () => {
  test('can sign in', async ({ page }) => {
    await setupClerkTestingToken({ page })

    await page.goto('sign-in')

    await expect(page).toHaveTitle(/Sign In/)

    await page.fill('input[name="identifier"]', process.env.E2E_EMAIL!)
    await page.fill('input[name="password"]', process.env.E2E_PASSWORD!)

    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await page.waitForURL('/')
  })
})
