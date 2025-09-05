import { clerk, clerkSetup } from '@clerk/testing/playwright'
import { test as setup } from '@playwright/test'
import path from 'path'

setup.describe.configure({
  mode: 'serial',
})

setup('global setup', async () => {
  await clerkSetup()

  if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD) {
    throw new Error(
      'Please provide E2E_EMAIL and E2E_PASSWORD environment variables.'
    )
  }
})

const authFile = path.join(__dirname, '../playwright/.clerk/user.json')

setup('authenticate', async ({ page }) => {
  await page.goto('/')

  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: process.env.E2E_EMAIL!,
      password: process.env.E2E_PASSWORD!,
    },
  })

  await page.goto('/')

  await page.context().storageState({ path: authFile })
})
