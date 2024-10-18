import { type Migration, sql } from 'kysely'

import type { DatabaseDriverName } from '~/lib/db/drivers'

export function migrations(dbType: DatabaseDriverName) {
  return {
    '2024-04-20T11:18:44': {
      async up(db) {
        let query = db.schema
          .createTable('cache_keys')
          .addColumn('id', 'varchar(255)', (col) => col.notNull().primaryKey())
          .addColumn('key', 'text', (col) => col.notNull())
          .addColumn('version', 'text', (col) => col.notNull())
          .addColumn('updated_at', 'text', (col) => col.notNull())
          .addColumn('accessed_at', 'text', (col) => col.notNull())

        if (dbType === 'mysql') query = query.modifyEnd(sql`engine=InnoDB CHARSET=latin1`)

        await query.ifNotExists().execute()
      },
      async down(db) {
        await db.schema.dropTable('cache_keys').ifExists().execute()
      },
    },
    '2024-10-15T16:39:29': {
      async up(db) {
        await db.schema
          .createTable('uploads')
          .addColumn('created_at', 'text', (col) => col.notNull())
          .addColumn('key', 'text', (col) => col.notNull())
          .addColumn('version', 'text', (col) => col.notNull())
          .addColumn('driver_upload_id', 'text', (col) => col.notNull())
          .addColumn('id', dbType === 'mysql' ? 'varchar(255)' : 'text', (col) =>
            col.notNull().primaryKey(),
          )
          .ifNotExists()
          .execute()
        await db.schema
          .createTable('upload_parts')
          .addColumn('upload_id', dbType === 'mysql' ? 'varchar(255)' : 'text')
          .addColumn('part_number', 'integer')
          .addColumn('e_tag', 'text')
          .addPrimaryKeyConstraint('pk_upload_parts', ['upload_id', 'part_number'])
          .addForeignKeyConstraint(
            'fk_upload_parts_uploads',
            ['upload_id'],
            'uploads',
            ['id'],
            (c) => c.onDelete('cascade'),
          )
          .ifNotExists()
          .execute()
      },
      async down(db) {
        await db.schema.dropTable('uploads').ifExists().execute()
        await db.schema.dropTable('upload_parts').ifExists().execute()
      },
    },
  } satisfies Record<string, Migration>
}
