import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { relations } from 'drizzle-orm'

export const apiKeyTypeEnum = pgEnum('type', ['public', 'private', 'signing'])

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey(),
  type: apiKeyTypeEnum('type').notNull(),
  key: text('key').notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  tenantId: varchar('tenant_id')
    .references(() => tenants.id, { onDelete: 'cascade' })
    .notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  createdAt: timestamp({
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

export type ApiKey = typeof apiKeys.$inferSelect

export const apiKeysRelations = relations(apiKeys, (relationShips) => ({
  tenant: relationShips.one(tenants),
}))
