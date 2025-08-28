import type { PgTable, PgUpdateSetSource } from 'drizzle-orm/pg-core'
import type { Column } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export function onConflictDoUpdate<TTable extends PgTable>(
  table: TTable,
  columns: Array<keyof TTable['_']['columns'] & keyof TTable>
): PgUpdateSetSource<TTable> {
  return Object.assign(
    {},
    ...columns.map((k) => ({
      [k]: sql.raw(`excluded.${(table[k] as Column).name}`),
    }))
  ) as PgUpdateSetSource<TTable>
}
