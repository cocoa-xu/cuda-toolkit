import * as core from '@actions/core'
import {OSType, getOs} from './platform'
import {Method} from './method'
import {SemVer} from 'semver'
import {exec} from '@actions/exec'
import {execReturnOutput} from './run-command'

export async function useApt(method: Method): Promise<boolean> {
  return method === 'network' && (await getOs()) === OSType.linux
}

export async function aptSetup(version: SemVer): Promise<void> {
  const osType = await getOs()
  if (osType !== OSType.linux) {
    throw new Error(
      `apt setup can only be run on linux runners! Current os type: ${osType}`
    )
  }
  core.debug(`Setup packages for ${version}`)
  const ubuntuVersion: string = await execReturnOutput('lsb_release', ['-sr'])
  const ubuntuVersionNoDot = ubuntuVersion.replace('.', '')
  const arch = `x86_64`
  const keyRingVersion = `1.1-1`
  const keyRingUrl = `https://developer.download.nvidia.com/compute/cuda/repos/ubuntu${ubuntuVersionNoDot}/${arch}/cuda-keyring_${keyRingVersion}_all.deb`
  const keyRingFilename = `cuda_keyring.deb`

  core.debug(`Keyring url: ${keyRingUrl}`)

  // cuda-keyring installs the GPG key, the apt repository source list, and the
  // pin file, so no separate pin download or add-apt-repository step is needed.
  await exec(`wget ${keyRingUrl} -O ${keyRingFilename}`)
  await exec(`sudo dpkg -i ${keyRingFilename}`)
  await exec(`sudo apt-get update`)
}

export async function aptInstall(
  version: SemVer,
  subPackages: string[]
): Promise<number> {
  const osType = await getOs()
  if (osType !== OSType.linux) {
    throw new Error(
      `apt install can only be run on linux runners! Current os type: ${osType}`
    )
  }
  if (subPackages.length === 0) {
    // Install everything
    const packageName = `cuda-${version.major}-${version.minor}`
    core.debug(`Install package: ${packageName}`)
    return await exec(`sudo apt-get -y install`, [packageName])
  } else {
    // Only install specified packages
    const versionedSubPackages = subPackages.map(
      subPackage => `cuda-${subPackage}-${version.major}-${version.minor}`
    )
    core.debug(`Only install subpackages: ${versionedSubPackages}`)
    return await exec(`sudo apt-get -y install`, versionedSubPackages)
  }
}
