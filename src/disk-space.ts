import * as core from '@actions/core'
import {OSType, getOs} from './platform'
import fs from 'fs'

interface StatFs {
  bsize: number
  blocks: number
  bavail: number
}

type StatFsFn = (path: string) => Promise<StatFs>

function gib(bytes: number): string {
  return (bytes / 1024 ** 3).toFixed(2)
}

export async function logDiskSpace(label: string): Promise<void> {
  try {
    const root =
      (await getOs()) === OSType.windows
        ? `${process.env.SystemDrive || 'C:'}\\`
        : '/'
    const statfs = (fs.promises as unknown as {statfs: StatFsFn}).statfs
    const stats = await statfs(root)
    const free = gib(stats.bavail * stats.bsize)
    const total = gib(stats.blocks * stats.bsize)
    core.info(
      `[disk] ${label}: ${free} GiB free / ${total} GiB total (${root})`
    )
  } catch (error) {
    core.warning(`[disk] failed to read free space (${label}): ${error}`)
  }
}
