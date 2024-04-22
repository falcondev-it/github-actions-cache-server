import fs from 'node:fs/promises'
import path from 'node:path'

import SQLite from 'better-sqlite3'
import { SqliteDialect } from 'kysely'
import { z } from 'zod'

import { defineDatabaseDriver } from '~/lib/db/driver'

export const sqliteDriver = defineDatabaseDriver({
  envSchema: z.object({
    DB_SQLITE_PATH: z.string(),
  }),
  async setup({ DB_SQLITE_PATH }) {
    await fs.mkdir(path.dirname(DB_SQLITE_PATH), { recursive: true })
    return new SqliteDialect({
      database: new SQLite(DB_SQLITE_PATH),
    })
  },
})
