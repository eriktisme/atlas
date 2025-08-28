import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
  pgEnum,
  unique,
} from 'drizzle-orm/pg-core'
import { tenants, users } from './tenants'
import { relations } from 'drizzle-orm'

export const integrationProviderTypeEnum = pgEnum('integration_provider', [
  'zapier',
  'make',
])

export const integrationTypeEnum = pgEnum('integration_type', [
  'webhook',
  'api',
])

export const integrations = pgTable(
  'integrations',
  {
    createdAt: timestamp({
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    id: uuid('id').primaryKey(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    provider: integrationProviderTypeEnum('provider').notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    tenantId: varchar('tenant_id')
      .references(() => tenants.id, { onDelete: 'cascade' })
      .notNull(),
    userId: varchar('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: integrationTypeEnum('type').notNull(),
  },
  (t) => [unique().on(t.userId, t.tenantId, t.provider)]
)

export type Integration = typeof integrations.$inferSelect

export const integrationsRelations = relations(
  integrations,
  (relationShips) => ({
    tenant: relationShips.one(tenants),
    user: relationShips.one(users),
  })
)

export const webhookIntegrations = pgTable('webhook_integrations', {
  integrationId: uuid('integration_id')
    .references(() => integrations.id, { onDelete: 'cascade' })
    .notNull(),
  destination: text('destination').notNull(),
  secret: text('secret'),
})

export type WebhookIntegration = typeof webhookIntegrations.$inferSelect
