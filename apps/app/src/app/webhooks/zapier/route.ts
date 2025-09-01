import { WebhookRegistrationBodySchema } from '@/app/webhooks/zapier/schema'
import { NextResponse } from 'next/server'
import { createConnection } from '@internal/database/connection'
import { env } from '@/env'
import { apiKeys, apiWebhook, integrations } from '@internal/database/schema'
import { v4 } from 'uuid'
import { eq } from 'drizzle-orm'

const connection = createConnection(env.DATABASE_URL)

export async function POST(request: Request) {
  const body = WebhookRegistrationBodySchema.safeParse(await request.json())

  if (!body.success) {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    )
  }

  const [apiKey] = await connection
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.key, body.data.apiKey))

  if (!apiKey) {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    )
  }

  const [integration] = await connection
    .insert(integrations)
    .values({
      id: v4(),
      type: 'api_webhook',
      label: 'Zapier',
      tenantId: apiKey.tenantId,
    })
    .returning()

  if (!integration) {
    return NextResponse.json(
      { message: 'Failed to register webhook' },
      { status: 500 }
    )
  }

  const [webhook] = await connection
    .insert(apiWebhook)
    .values({
      integrationId: integration.id,
      url: body.data.targetUrl,
      secret: body.data.apiKey,
    })
    .returning()

  if (!webhook) {
    await connection
      .delete(integrations)
      .where(eq(integrations.id, integration.id))

    return NextResponse.json(
      { message: 'Failed to register webhook' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    data: {
      integrationId: integration.id,
    },
  })
}
