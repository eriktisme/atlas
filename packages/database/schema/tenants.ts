import { pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const tenants = pgTable('tenants', {
  id: varchar('id').primaryKey(),
  createdAt: timestamp({
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

export const tenantsRelations = relations(tenants, (relationShips) => ({
  users: relationShips.many(users),
}))

export const users = pgTable('users', {
  id: varchar('id').primaryKey(),
  tenantId: varchar('tenant_id')
    .references(() => tenants.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp({
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})
