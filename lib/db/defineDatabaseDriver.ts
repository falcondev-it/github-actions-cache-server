/* eslint-disable unicorn/filename-case */
import { formatZodError } from '~/lib/env'
import { logger } from '~/lib/logger'

import type { Dialect } from 'kysely'
import type { z } from 'zod'

interface DefineDatabaseDriverOptions<EnvSchema extends z.ZodTypeAny> {
  envSchema: EnvSchema
  setup: (options: z.output<EnvSchema>) => Promise<Dialect> | Dialect
}
export function defineDatabaseDriver<EnvSchema extends z.ZodTypeAny>(
  options: DefineDatabaseDriverOptions<EnvSchema>,
) {
  return () => {
    const env = options.envSchema.safeParse(process.env)
    if (!env.success) {
      logger.error(`Invalid environment variables:\n${formatZodError(env.error)}`)
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1)
    }

    const driver = options.setup(env.data)
    return driver instanceof Promise ? driver : Promise.resolve(driver)
  }
}
