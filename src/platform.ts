import {debug} from '@actions/core'
import os from 'os'
import {SemVer} from 'semver'

export enum OSType {
  windows = 'windows',
  linux = 'linux'
}

export enum DownloadType {
  cuda = 'cuda',
  cudnn = 'cudnn'
}

export interface CUDAToolkit {
  cuda_version: SemVer
  cuda_url: URL
  cudnn_version: SemVer | undefined
  cudnn_url: URL | undefined
}

export async function getOs(): Promise<OSType> {
  const osPlatform = os.platform()
  switch (osPlatform) {
    case 'win32':
      return OSType.windows
    case 'linux':
      return OSType.linux
    default:
      debug(`Unsupported OS: ${osPlatform}`)
      throw new Error(`Unsupported OS: ${osPlatform}`)
  }
}

export async function getRelease(): Promise<string> {
  return os.release()
}
