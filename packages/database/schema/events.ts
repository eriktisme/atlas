import { pgTable, uuid, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core'
import { tenants } from './tenants'
import { people } from './people'

export const events = pgTable('events', {
  distinctId: varchar('distinct_id').references(() => people.id, {
    onDelete: 'set null',
  }),
  id: uuid().primaryKey(),
  event: varchar('event').notNull(),
  properties: jsonb('properties'),
  tenantId: varchar('tenant_id')
    .references(() => tenants.id, { onDelete: 'cascade' })
    .notNull(),
  timestamp: timestamp({
    withTimezone: true,
  }).notNull(),
})

export type Event = typeof events.$inferSelect
