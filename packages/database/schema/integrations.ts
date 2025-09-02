import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { tenants } from './tenants'

export const integrationTypeEnum = pgEnum('integration_webhook_type', [
  'api_webhook',
])

export const integrationProviderTypeEnum = pgEnum('integration_provider_type', [
  'zapier',
])

export const integrations = pgTable('integrations', {
  createdAt: timestamp({
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  id: uuid('id').primaryKey(),
  provider: integrationProviderTypeEnum('provider').notNull(),
  tenantId: varchar('tenant_id')
    .references(() => tenants.id, { onDelete: 'cascade' })
    .notNull(),
  type: integrationTypeEnum('type').notNull(),
})

export const apiWebhook = pgTable('api_webhook', {
  integrationId: uuid('integration_id')
    .references(() => integrations.id, { onDelete: 'cascade' })
    .primaryKey(),
  url: text('url').notNull(),
  secret: varchar('secret', { length: 255 }).notNull(),
})
