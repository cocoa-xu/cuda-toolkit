import * as artifact from '@actions/artifact'
import * as core from '@actions/core'
import {OSType, getOs, CUDAToolkit, DownloadType} from './platform'
import {exec} from '@actions/exec'
import {getFileExtension} from './downloader'
const path = require('path')

export async function install(
  executablePath: string,
  toolkit: CUDAToolkit,
  subPackagesArray: string[],
  linuxLocalArgsArray: string[]
): Promise<void> {
  // Install arguments, see: https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#runfile-advanced
  // and https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html
  let installArgs: string[]

  // Command string that is executed
  let command: string

  // Subset of subpackages to install instead of everything, see: https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html#install-cuda-software
  const subPackages: string[] = subPackagesArray

  // Execution options which contain callback functions for stdout and stderr of install process
  const execOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        core.debug(data.toString())
      },
      stderr: (data: Buffer) => {
        core.debug(`Error: ${data.toString()}`)
      }
    }
  }

  const version = toolkit.cuda_version
  // Configure OS dependent run command and args
  switch (await getOs()) {
    case OSType.linux:
      // Root permission needed on linux
      command = `sudo ${executablePath}`
      // Install silently, and add additional arguments
      installArgs = ['--silent'].concat(linuxLocalArgsArray)
      break
    case OSType.windows:
      // Windows handles permissions automatically
      command = executablePath
      // Install silently
      installArgs = ['-s']
      // Add subpackages to command args (if any)
      installArgs = installArgs.concat(
        subPackages.map(subPackage => {
          // Display driver sub package name is not dependent on version
          if (subPackage === 'Display.Driver') {
            return subPackage
          }
          return `${subPackage}_${version.major}.${version.minor}`
        })
      )
      break
  }

  // Run CUDA installer
  try {
    core.debug(`Running install executable: ${executablePath}`)
    const exitCode = await exec(command, installArgs, execOptions)
    core.debug(`Installer exit code: ${exitCode}`)
  } catch (error) {
    core.debug(`Error during installation: ${error}`)
    throw error
  } finally {
    // Always upload installation log regardless of error
    if ((await getOs()) === OSType.linux) {
      const artifactClient = artifact.create()
      const artifactName = 'install-log'
      const files = ['/var/log/cuda-installer.log']
      const rootDirectory = '/var/log'
      const artifactOptions = {
        continueOnError: true
      }
      const uploadResult = await artifactClient.uploadArtifact(
        artifactName,
        files,
        rootDirectory,
        artifactOptions
      )
      core.debug(`Upload result: ${uploadResult}`)
    }
  }
}

export async function installCudnn(
  cudnnArchivePath: string,
  cudaPath: string
): Promise<void> {
  let installArgs: string[]
  let command: string
  let fileExt: string
  const execOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        core.debug(data.toString())
      },
      stderr: (data: Buffer) => {
        core.debug(`Error: ${data.toString()}`)
      }
    }
  }

  switch (await getOs()) {
    case OSType.linux:
      command = `sudo tar`
      installArgs = ['-xf', cudnnArchivePath, '-C', cudaPath]
      fileExt = getFileExtension(OSType.linux, DownloadType.cudnn)
      break
    case OSType.windows:
      command = 'powershell'
      installArgs = [
        '-command',
        'Expand-Archive',
        '-LiteralPath',
        `"${cudnnArchivePath}"`,
        '-DestinationPath',
        `"${cudaPath}"`
      ]
      fileExt = getFileExtension(OSType.linux, DownloadType.cudnn)
      break
  }

  // unarchive cudnn to CUDA directory
  try {
    core.debug(`Unarchiving cudnn files: ${cudnnArchivePath}`)
    const exitCode = await exec(command, installArgs, execOptions)
    core.debug(`exit code: ${exitCode}`)
  } catch (error) {
    core.debug(`Error during installation: ${error}`)
    throw error
  }

  let filename: string = path.basename(cudnnArchivePath)
  filename = filename.substring(0, filename.lastIndexOf(fileExt))
  // move everything unarchived
  switch (await getOs()) {
    case OSType.linux:
      command = `sudo bash`
      installArgs = [
        '-c',
        `mv "${cudaPath}/${filename}/lib/*" "${cudaPath}/lib/" && mv "${cudaPath}/${filename}/include/*" "${cudaPath}/include/"`
      ]
      break
    case OSType.windows:
      command = 'powershell'
      installArgs = [
        '-command',
        'Get-ChildItem',
        '-Path',
        `"${cudaPath}\\${filename}\\bin/\\*.dll"`,
        '-Recurse',
        '|',
        'Move-Item',
        '-Destination',
        `"${cudaPath}\\bin"`
      ]
      break
  }
  try {
    core.debug(`moving cudnn files: ${cudnnArchivePath}`)
    const exitCode = await exec(command, installArgs, execOptions)
    core.debug(`exit code: ${exitCode}`)
  } catch (error) {
    core.debug(`Error during installation: ${error}`)
    throw error
  }

  switch (await getOs()) {
    case OSType.windows:
      command = 'powershell'
      installArgs = [
        '-command',
        'Get-ChildItem',
        '-Path',
        `"${cudaPath}\\${filename}\\include\\\\*.h"`,
        '-Recurse',
        '|',
        'Move-Item',
        '-Destination',
        `"${cudaPath}\\include"`
      ]
      try {
        core.debug(`moving cudnn files: ${cudnnArchivePath}`)
        const exitCode = await exec(command, installArgs, execOptions)
        core.debug(`exit code: ${exitCode}`)
      } catch (error) {
        core.debug(`Error during installation: ${error}`)
        throw error
      }

      installArgs = [
        '-command',
        'Get-ChildItem',
        '-Path',
        `"${cudaPath}\\${filename}\\lib\\x64\\\\*.lib"`,
        '-Recurse',
        '|',
        'Move-Item',
        '-Destination',
        `"${cudaPath}\\lib\\x64"`
      ]
      try {
        core.debug(`moving cudnn files: ${cudnnArchivePath}`)
        const exitCode = await exec(command, installArgs, execOptions)
        core.debug(`exit code: ${exitCode}`)
      } catch (error) {
        core.debug(`Error during installation: ${error}`)
        throw error
      }
      break
  }
}
