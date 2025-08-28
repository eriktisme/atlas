import { pgTable, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { personToGroup } from './groups'
import { tenants } from './tenants'

export const people = pgTable('people', {
  id: varchar('id').primaryKey(),
  tenantId: varchar('tenant_id')
    .references(() => tenants.id, { onDelete: 'cascade' })
    .notNull(),
  properties: jsonb('properties'),
  createdAt: timestamp({
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

export type Person = typeof people.$inferSelect

export const peopleRelations = relations(people, (relationShips) => ({
  groups: relationShips.many(personToGroup),
}))
