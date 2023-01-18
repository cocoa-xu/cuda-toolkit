import {SemVer} from 'semver'

// Interface for getting cuda versions and corresponding download URLs
export abstract class AbstractLinks {
  protected cudaVersionToURL: Map<string, string> = new Map()
  protected cudnnVersionData: Map<string, [string, string[]]> = new Map()

  getAvailableLocalCudaVersions(): SemVer[] {
    return Array.from(this.cudaVersionToURL.keys()).map(s => new SemVer(s))
  }

  getAvailableLocalCudnnVersions(cuda_version: string): SemVer[] {
    return Array.from(this.compatibleCudnnVersions(cuda_version).keys()).map(
      s => new SemVer(s)
    )
  }

  getLocalURLFromCudaVersion(version: SemVer): URL {
    const urlString = this.cudaVersionToURL.get(`${version}`)
    if (urlString === undefined) {
      throw new Error(`Invalid version: ${version}`)
    }
    return new URL(urlString)
  }

  getLocalURLFromCudnnVersion(version: SemVer): URL | undefined {
    const metadata = this.cudnnVersionData.get(`${version}`)
    if (metadata === undefined) {
      return undefined
    }
    return new URL(metadata[0])
  }

  compatibleCudnnVersions(cuda_version: string): Map<string, string> {
    const compatible_versions = Array.from(this.cudnnVersionData.keys()).reduce<
      Map<string, string>
    >((acc, v) => {
      const cudaSemVer = new SemVer(cuda_version)
      const metadata = this.cudnnVersionData.get(v)
      if (metadata !== undefined) {
        const [url, cur_compatible_versions] = metadata
        const compatible =
          cur_compatible_versions.filter(c => {
            const cv = new SemVer(c, true)

            if (cv.major !== cudaSemVer.major) {
              return false
            } else if (cv.minor === 0) {
              return true
            } else {
              return cv.compare(cudaSemVer) !== 1
            }
          }).length > 0
        if (compatible) {
          acc.set(v, url)
        }
      }
      return acc
    }, new Map())
    return compatible_versions
  }
}
