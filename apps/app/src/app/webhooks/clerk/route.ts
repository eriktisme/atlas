import { env } from '@/env'
import type {
  OrganizationJSON,
  OrganizationMembershipJSON,
  WebhookEvent,
} from '@clerk/backend'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createConnection } from '@internal/database/connection'
import { tenants, users } from '@internal/database/schema'

const connection = createConnection(env.DATABASE_URL)

/**
 * Future improvements:
 *
 * - Create API Keys for each organization
 */
const handleOrganizationCreated = async (data: OrganizationJSON) => {
  await connection
    .insert(tenants)
    .values({
      id: data.id,
    })
    .onConflictDoNothing()

  if (data.created_by) {
    await connection
      .insert(users)
      .values({
        id: data.created_by,
        tenantId: data.id,
      })
      .onConflictDoNothing()
  }

  return new Response('Organization created', { status: 201 })
}

const handleOrganizationMembershipCreated = (
  data: OrganizationMembershipJSON
) => {
  connection
    .insert(users)
    .values({
      id: data.public_user_data.user_id,
      tenantId: data.organization.id,
    })
    .onConflictDoNothing()

  return new Response('Organization membership created', { status: 201 })
}

export const POST = async (request: Request): Promise<Response> => {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Not configured', ok: false })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  const payload = (await request.json()) as object
  const body = JSON.stringify(payload)

  const webhook = new Webhook(env.CLERK_WEBHOOK_SECRET)

  let event: WebhookEvent | undefined

  try {
    event = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (error) {
    return new Response('Error occurred', {
      status: 400,
    })
  }

  const eventType = event.type

  let response: Response = new Response('', { status: 201 })

  switch (eventType) {
    case 'organization.created': {
      response = await handleOrganizationCreated(event.data)

      break
    }
    case 'organizationMembership.created': {
      response = handleOrganizationMembershipCreated(event.data)

      break
    }
    default: {
      break
    }
  }

  return response
}
