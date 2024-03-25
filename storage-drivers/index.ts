import type { defineStorageDriver } from '@/lib/storage-driver'

import { filesystemDriver } from '@/storage-drivers/filesystem'
import { memoryDriver } from '@/storage-drivers/memory'
import { minioDriver } from '@/storage-drivers/minio'
import { s3Driver } from '@/storage-drivers/s3'

const storageDrivers: Record<string, ReturnType<typeof defineStorageDriver>> = {
  minio: minioDriver,
  s3: s3Driver,
  filesystem: filesystemDriver,
  memory: memoryDriver,
}

export function getStorageDriver(name: string) {
  return storageDrivers[name.toLowerCase()]
}
