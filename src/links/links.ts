import {SemVer} from 'semver'

// Interface for getting cuda versions and corresponding download URLs
export abstract class AbstractLinks {
  // key: cuda version, value: cuda URL
  cudaVersionToURL: Map<string, string> = new Map()
  // key: cuda version, value: [key: cuda major version, value: cudnn URL]
  cudnnVersionToURL: Map<string, Map<number, string>> = new Map()

  getAvailableLocalCudaVersions(): SemVer[] {
    return Array.from(this.cudaVersionToURL.keys()).map(s => new SemVer(s))
  }

  getAvailableCudnnVersions(): SemVer[] {
    return Array.from(this.cudnnVersionToURL.keys()).map(s => new SemVer(s))
  }

  getLocalURLFromCudaVersion(version: SemVer): URL {
    const urlString = this.cudaVersionToURL.get(`${version}`)
    if (urlString === undefined) {
      throw new Error(`Invalid version: ${version}`)
    }
    return new URL(urlString)
  }
}
