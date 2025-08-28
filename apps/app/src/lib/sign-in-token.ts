'use server'

import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'

export const generateSignInToken = async (sessionId: string) => {
  const client = await clerkClient()

  const session = await client.sessions.getSession(sessionId)

  const { token } = await client.signInTokens.createSignInToken({
    userId: session.userId,
    expiresInSeconds: 60,
  })

  return token
}
