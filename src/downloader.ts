import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as tc from '@actions/tool-cache'
import * as io from '@actions/io'
import {OSType, getOs, getRelease, CUDAToolkit, DownloadType} from './platform'
import {AbstractLinks} from './links/links'
import {Method} from './method'
import {WindowsLinks} from './links/windows-links'
import fs from 'fs'
import {getLinks} from './links/get-links'

// Download helper which returns the installer executable and caches it for next runs
export async function download(
  toolkit: CUDAToolkit,
  method: Method,
  useGitHubCache: boolean
): Promise<[string, string | undefined]> {
  // First try to find tool with desired version in tool cache (local to machine)
  const toolName = 'cuda_installer'
  const cudnnToolName = 'cudnn_archive'
  const osType = await getOs()
  const osRelease = await getRelease()
  const toolId = `${toolName}-${osType}-${osRelease}`
  const cudnnToolId = `${cudnnToolName}-${osType}-${osRelease}`

  // Path that contains the executable file
  let executablePath: string
  let cudnnArchivePath: string | undefined
  const toolPath = tc.find(toolId, `${toolkit.cuda_version}`)
  if (toolPath) {
    // Tool is already in cache
    core.debug(`Found CUDA in local machine cache ${toolPath}`)
    executablePath = toolPath
  } else {
    // Second option, get tool from GitHub cache if enabled
    const cacheKey = `${toolId}-${toolkit.cuda_version}`
    executablePath = await fromCacheOrDownload(
      toolkit,
      method,
      cacheKey,
      useGitHubCache,
      osType,
      toolId,
      DownloadType.cuda
    )
  }

  if (toolkit.cudnn_version !== undefined) {
    const cudnnPath = tc.find(cudnnToolId, `${toolkit.cudnn_version}`)
    if (cudnnPath) {
      // Tool is already in cache
      core.debug(`Found cudnn in local machine cache ${cudnnPath}`)
      cudnnArchivePath = cudnnPath
    } else {
      const cudnnCacheKey = `${cudnnToolId}-${toolkit.cudnn_version}`
      cudnnArchivePath = await fromCacheOrDownload(
        toolkit,
        method,
        cudnnCacheKey,
        useGitHubCache,
        osType,
        toolId,
        DownloadType.cudnn
      )
    }
  }

  // String with full executable path
  const fullExecutablePath = await verifyCachePath(executablePath, '0755')
  let fullArchivedPath: string | undefined

  if (cudnnArchivePath !== undefined) {
    fullArchivedPath = await verifyCachePath(cudnnArchivePath, undefined)
  }
  return [fullExecutablePath, fullArchivedPath]
}

export function getFileExtension(
  osType: OSType,
  downloadType: DownloadType
): string {
  switch (downloadType) {
    case DownloadType.cuda:
      switch (osType) {
        case OSType.windows:
          return 'exe'
        case OSType.linux:
          return 'run'
      }
      break

    case DownloadType.cudnn:
      switch (osType) {
        case OSType.windows:
          return 'zip'
        case OSType.linux:
          return 'tar.xz'
      }
  }
}

async function verifyCachePath(
  verifyPath: string,
  chmod: string | undefined
): Promise<string> {
  // String with full executable path
  let fullExecutablePath: string
  // Get list of files in tool cache
  const filesInCache = await (await glob.create(`${verifyPath}/**.*`)).glob()
  core.debug(`Files in tool cache:`)
  for (const f of filesInCache) {
    core.debug(f)
  }
  if (filesInCache.length > 1) {
    throw new Error(`Got multiple file in tool cache: ${filesInCache.length}`)
  } else if (filesInCache.length === 0) {
    throw new Error(`Got no files in tool cahce`)
  } else {
    fullExecutablePath = filesInCache[0]
  }
  // Make file executable on linux
  if ((await getOs()) === OSType.linux && chmod !== undefined) {
    // 0755 octal notation permission is: owner(r,w,x), group(r,w,x), other(r,x) where r=read, w=write, x=execute
    await fs.promises.chmod(fullExecutablePath, chmod)
  }
  return fullExecutablePath
}

async function fromCacheOrDownload(
  toolkit: CUDAToolkit,
  method: Method,
  cacheKey: string,
  useGitHubCache: boolean,
  osType: OSType,
  toolId: string,
  downloadType: DownloadType
): Promise<string> {
  const toolName = 'cuda_installer'
  const cachePath = cacheKey
  let cacheResult: string | undefined
  if (useGitHubCache) {
    cacheResult = await cache.restoreCache([cachePath], cacheKey)
  }
  if (cacheResult !== undefined) {
    core.debug(`Found in GitHub cache ${cachePath}`)
    return cachePath
  } else {
    // Final option, download tool from NVIDIA servers
    core.debug(`Not found in local/GitHub cache, downloading...`)
    // Get download URL
    toolkit = await getDownloadURL(method, toolkit)
    if (toolkit.cuda_url === undefined) {
      throw new Error('Cannot find CUDA URL')
    }

    // Get CUDA/cudnn installer filename extension depending on OS
    const fileExtension: string = getFileExtension(osType, downloadType)
    const version_string =
      downloadType === DownloadType.cuda
        ? toolkit.cuda_version
        : toolkit.cudnn_version
    const destFileName = `${toolId}_${version_string}.${fileExtension}`
    // Download executable
    const downloadPath: string = await tc.downloadTool(
      toolkit.cuda_url.toString(),
      destFileName
    )
    // Copy file to GitHub cachePath
    core.debug(`Copying ${destFileName} to ${cachePath}`)
    await io.mkdirP(cachePath)
    await io.cp(destFileName, cachePath)
    // Cache download to local machine cache
    const localCachePath = await tc.cacheFile(
      downloadPath,
      destFileName,
      `${toolName}-${osType}`,
      `${version_string}`
    )
    core.debug(`Cached download to local machine cache at ${localCachePath}`)
    // Cache download to GitHub cache if enabled
    if (useGitHubCache) {
      const cacheId = await cache.saveCache([cachePath], cacheKey)
      if (cacheId !== -1) {
        core.debug(
          `Cached CUDA/cudnn installer download to GitHub cache with cache id ${cacheId}`
        )
      } else {
        core.debug(`Did not cache, cache possibly already exists`)
      }
    }

    return localCachePath
  }
}

async function getDownloadURL(
  method: string,
  toolkit: CUDAToolkit
): Promise<CUDAToolkit> {
  const links: AbstractLinks = await getLinks()
  switch (method) {
    case 'local':
      toolkit.cuda_url = links.getLocalURLFromCudaVersion(toolkit.cuda_version)
      if (toolkit.cudnn_version !== undefined) {
        toolkit.cudnn_url = links.getLocalURLFromCudnnVersion(
          toolkit.cudnn_version
        )
      }
      return toolkit
    case 'network':
      if (!(links instanceof WindowsLinks)) {
        core.debug(`Tried to get windows links but got linux links instance`)
        throw new Error(
          `Network mode is not supported by linux, shouldn't even get here`
        )
      }
      toolkit.cuda_url = links.getNetworkURLFromCudaVersion(
        toolkit.cuda_version
      )
      if (toolkit.cudnn_version !== undefined) {
        toolkit.cudnn_url = links.getLocalURLFromCudnnVersion(
          toolkit.cudnn_version
        )
      }
      return toolkit
    default:
      throw new Error(
        `Invalid method: expected either 'local' or 'network', got '${method}'`
      )
  }
}
