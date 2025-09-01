import { NextResponse } from 'next/server'
import { createConnection } from '@internal/database/connection'
import { env } from '@/env'
import { integrations } from '@internal/database/schema'
import { eq } from 'drizzle-orm'

const connection = createConnection(env.DATABASE_URL)

interface Props {
  params: Promise<{ id: string }>
}

export async function DELETE(_: Request, props: Props) {
  const { id } = await props.params

  const [integration] = await connection
    .select()
    .from(integrations)
    .where(eq(integrations.id, id))
    .limit(1)

  if (!integration) {
    return NextResponse.json(
      { message: 'Integration not found' },
      { status: 404 }
    )
  }

  await connection
    .delete(integrations)
    .where(eq(integrations.id, integration.id))

  return NextResponse.json({
    data: {
      integrationId: integration.id,
    },
  })
}
