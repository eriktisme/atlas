import {
  pgTable,
  timestamp,
  jsonb,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { people } from './people'
import { tenants } from './tenants'

export const groups = pgTable('groups', {
  id: varchar('id').primaryKey(),
  tenantId: varchar('tenant_id')
    .references(() => tenants.id, { onDelete: 'cascade' })
    .notNull(),
  type: varchar({
    length: 50,
  }).notNull(),
  properties: jsonb('properties'),
  createdAt: timestamp({
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

export type Group = typeof groups.$inferSelect

export const groupsRelations = relations(groups, (relationShips) => ({
  people: relationShips.many(personToGroup),
}))

export const personToGroup = pgTable(
  'person_to_group',
  {
    personId: varchar('person_id')
      .notNull()
      .references(() => people.id),
    groupId: varchar('group_id')
      .notNull()
      .references(() => groups.id),
  },
  (t) => [primaryKey({ columns: [t.personId, t.groupId] })]
)

export const personToGroupRelations = relations(
  personToGroup,
  (relationShips) => ({
    person: relationShips.one(people, {
      fields: [personToGroup.personId],
      references: [people.id],
    }),
    group: relationShips.one(groups, {
      fields: [personToGroup.groupId],
      references: [groups.id],
    }),
  })
)
