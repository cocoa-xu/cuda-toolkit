import * as core from '@actions/core'
import {Method, parseMethod} from './method'
import {OSType, getOs} from './platform'
import {aptInstall, aptSetup, useApt} from './apt-installer'
import {download} from './downloader'
import {getVersion} from './version'
import {install, installCudnn} from './installer'
import {updatePath} from './update-path'
import path from 'path'

async function run(): Promise<void> {
  try {
    const cuda: string = core.getInput('cuda')
    core.debug(`Desired cuda version: ${cuda}`)
    const cudnn: string = core.getInput('cudnn')
    core.debug(`Desired cudnn version: ${cudnn}`)
    const cudnn_url: string = core.getInput('cudnn_url')
    core.debug(`Desired cuDNN: ${cudnn_url}`)
    const cudnn_archive_dir: string = core.getInput('cudnn_archive_dir')
    core.debug(`Desired cuDNN archive dir: ${cudnn_archive_dir}`)
    const subPackages: string = core.getInput('sub-packages')
    core.debug(`Desired subPackes: ${subPackages}`)
    const methodString: string = core.getInput('method')
    core.debug(`Desired method: ${methodString}`)
    const linuxLocalArgs: string = core.getInput('linux-local-args')
    core.debug(`Desired local linux args: ${linuxLocalArgs}`)
    const useGitHubCache: boolean = core.getBooleanInput('use-github-cache')
    core.debug(`Desired GitHub cache usage: ${useGitHubCache}`)

    // Parse subPackages array
    let subPackagesArray: string[] = []
    try {
      subPackagesArray = JSON.parse(subPackages)
      // TODO verify that elements are valid package names (nvcc, etc.)
    } catch (error) {
      const errString = `Error parsing input 'sub-packages' to a JSON string array: ${subPackages}`
      core.debug(errString)
      throw new Error(errString)
    }

    // Parse method
    const methodParsed: Method = parseMethod(methodString)
    core.debug(`Parsed method: ${methodParsed}`)

    // Parse version string
    const cuda_toolkit = await getVersion(cuda, cudnn, cudnn_url, methodParsed)

    // Parse linuxLocalArgs array
    let linuxLocalArgsArray: string[] = []
    try {
      linuxLocalArgsArray = JSON.parse(linuxLocalArgs)
      // TODO verify that elements are valid package names (--samples, --driver, --toolkit, etc.)
    } catch (error) {
      const errString = `Error parsing input 'linux-local-args' to a JSON string array: ${linuxLocalArgs}`
      core.debug(errString)
      throw new Error(errString)
    }

    // Check if subPackages are specified in 'local' method on Linux
    if (
      methodParsed === 'local' &&
      subPackagesArray.length > 0 &&
      (await getOs()) === OSType.linux
    ) {
      throw new Error(
        `Subpackages on 'local' method is not supported on Linux, use 'network' instead`
      )
    }

    // Linux network install (uses apt repository)
    const useAptInstall = await useApt(methodParsed)
    let cudnnArchivePath: string | undefined
    if (useAptInstall) {
      // Setup aptitude repos
      await aptSetup(cuda_toolkit.cuda_version)
      // Install packages
      const installResult = await aptInstall(
        cuda_toolkit.cuda_version,
        subPackagesArray
      )
      core.debug(`Install result: ${installResult}`)
    } else {
      // Download
      const [executablePath, archivePath]: [string, string | undefined] =
        await download(cuda_toolkit, methodParsed, useGitHubCache)

      // Install CUDA
      await install(
        executablePath,
        cuda_toolkit,
        subPackagesArray,
        linuxLocalArgsArray
      )

      cudnnArchivePath = archivePath
    }

    // Add CUDA environment variables to GitHub environment variables
    const cudaPath: string = await updatePath(cuda_toolkit.cuda_version)

    // Set output variables
    core.setOutput('cuda', cuda)
    core.setOutput('CUDA_PATH', cudaPath)

    if (
      cudnnArchivePath !== undefined &&
      cuda_toolkit.cudnn_url?.pathname !== undefined
    ) {
      let directoryName: string
      if (cudnn_archive_dir.length > 0) {
        directoryName = cudnn_archive_dir
      } else {
        directoryName = path.basename(cuda_toolkit.cudnn_url?.pathname)
      }
      await installCudnn(cudnnArchivePath, directoryName, cudaPath)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error)
    } else {
      core.setFailed('Unknown error')
    }
  }
}

run()
