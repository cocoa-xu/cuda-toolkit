import * as core from '@actions/core'
import {OSType, getOs, CUDAToolkit} from './platform'
import {AbstractLinks} from './links/links'
import {Method} from './method'
import {SemVer} from 'semver'
import {WindowsLinks} from './links/windows-x86_64-links'
import {getLinks} from './links/get-links'

// Helper for converting string to SemVer and verifying it exists in the links
export async function getVersion(
  cudaVersionString: string,
  cudnnVersionString: string,
  arch: string,
  method: Method
): Promise<CUDAToolkit> {
  const version = new SemVer(cudaVersionString)
  let cudnn_version = new SemVer('0.0.0')
  if (cudnnVersionString.length > 0) {
    cudnn_version = new SemVer(cudnnVersionString)
  }

  const links: AbstractLinks = await getLinks(arch)
  const currentOs = await getOs()
  let versions
  let cudnnVersions
  switch (method) {
    case 'local':
      versions = links.getAvailableLocalCudaVersions()
      break
    case 'network':
      switch (currentOs) {
        case OSType.linux:
          // TODO adapt this to actual available network versions for linux
          versions = links.getAvailableLocalCudaVersions()
          break
        case OSType.windows:
          versions = (links as WindowsLinks).getAvailableNetworkCudaVersions()
          break
      }
  }
  core.info(`Available CUDA versions: ${versions}`)
  if (versions.find(v => v.compare(version) === 0) !== undefined) {
    core.info(`Found CUDA version that matches: ${version}`)

    switch (currentOs) {
      case OSType.linux:
        cudnnVersions = links.getAvailableCudnnVersions()
        break
      case OSType.windows:
        cudnnVersions = (links as WindowsLinks).getAvailableCudnnVersions()
        break
    }
    if (cudnnVersionString.length === 0) {
      return {
        cuda_version: version,
        cudnn_version: undefined,
        cuda_url: undefined,
        cudnn_url: undefined
      }
    }

    core.info(`Available cudnn versions: ${cudnnVersions}`)
    if (cudnnVersions.find(v => v.compare(cudnn_version) === 0) !== undefined) {
      core.info(`Found cudnn version that matches: ${cudnn_version}`)
      const cudnnInfo = links.cudnnVersionToURL.get(cudnnVersionString)
      if (cudnnInfo !== undefined) {
        const compatibleCudnn = cudnnInfo.get(version.major)
        if (compatibleCudnn === undefined) {
          core.error(
            `cudnn version ${cudnn_version} is not compatible with CUDA version ${version}`
          )
          throw new Error(
            `cudnn version ${cudnn_version} is not compatible with CUDA version ${version}`
          )
        }
        return {
          cuda_version: version,
          cudnn_version: cudnn_version,
          cuda_url: undefined,
          cudnn_url: new URL(compatibleCudnn)
        }
      }
      core.error(
        `internal error: cudnn version ${cudnn_version} not found in cudnnVersionToURL`
      )
      throw new Error(
        `internal error: cudnn version ${cudnn_version} not found in cudnnVersionToURL`
      )
    }
  }

  core.debug(`Version not available error!`)
  throw new Error(`CUDA version not available: ${version}`)
}
