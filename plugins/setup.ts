import { H3Error } from 'h3'

import { initializeDatabase, useDB } from '~/lib/db'
import { ENV } from '~/lib/env'
import { logger } from '~/lib/logger'
import { initializeStorage, useStorageAdapter } from '~/lib/storage'

export default defineNitroPlugin(async (nitro) => {
  logger.info(`🚀 Starting GitHub Actions Cache Server (${useRuntimeConfig().version})`)

  await initializeDatabase()
  await initializeStorage()

  nitro.hooks.hook('error', (error, { event }) => {
    if (!event) {
      logger.error(error)
      return
    }

    logger.error(
      `Response: ${event.method} ${obfuscateTokenFromPath(event.path)} > ${error instanceof H3Error ? error.statusCode : '[no status code]'}\n`,
      error,
    )
  })

  if (ENV.DEBUG) {
    nitro.hooks.hook('request', (event) => {
      logger.debug(`Request: ${event.method} ${obfuscateTokenFromPath(event.path)}`)
    })
    nitro.hooks.hook('afterResponse', (event) => {
      logger.debug(
        `Response: ${event.method} ${obfuscateTokenFromPath(event.path)} > ${getResponseStatus(event)}`,
      )
    })
  }

  const version = useRuntimeConfig().version
  if (version) {
    const db = useDB()
    const existing = await db
      .selectFrom('meta')
      .where('key', '=', 'version')
      .select('value')
      .executeTakeFirst()

    if (!existing || existing.value !== version) {
      logger.info(
        `Version changed from ${existing?.value ?? '[no version, first install]'} to ${version}. Pruning cache...`,
      )
      await useStorageAdapter().pruneCaches()
    }

    if (existing) {
      await db.updateTable('meta').set('value', version).where('key', '=', 'version').execute()
    } else {
      await db.insertInto('meta').values({ key: 'version', value: version }).execute()
    }
  } else {
    logger.warn('No version found in runtime config')
  }

  if (process.send) process.send('nitro:ready')
})

function obfuscateTokenFromPath(path: string) {
  const split = path.split('/_apis')
  if (split.length <= 1) return path
  return `/<secret_token>/_apis${split[1]}`
}
