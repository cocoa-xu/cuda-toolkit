import * as artifact from '@actions/artifact'
import * as core from '@actions/core'
import {OSType, getOs, CUDAToolkit, DownloadType} from './platform'
import {spawn} from 'child_process'
import {getFileExtension} from './downloader'
import fs from 'fs'

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
    core.info(`Running install executable: ${executablePath}: ${installArgs}`)
    const exitCode = await spawn(command, installArgs, {
      stdio: 'inherit',
      shell: true
    })
    core.debug(`Installer exit code: ${exitCode}`)
  } catch (error) {
    core.error(`Error during installation: ${error}`)
    throw error
  } finally {
    // Always upload installation log regardless of error
    if ((await getOs()) === OSType.linux) {
      const artifactClient = artifact.create()
      const artifactName = 'install-log'
      const cudaLogPath = '/var/log/cuda-installer.log'
      if (fs.existsSync(cudaLogPath)) {
        const rootDirectory = '/'
        const artifactOptions = {
          continueOnError: true
        }
        const uploadResult = await artifactClient.uploadArtifact(
          artifactName,
          [cudaLogPath],
          rootDirectory,
          artifactOptions
        )
        core.debug(`Upload result: ${uploadResult}`)
      }
    }
    // await io.rmRF(executablePath)
  }
}

export async function installCudnn(
  cudnnArchivePath: string,
  directoryName: string,
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
        `'${cudnnArchivePath}'`,
        '-DestinationPath',
        `'${cudaPath}'`,
        '-force'
      ]
      fileExt = getFileExtension(OSType.windows, DownloadType.cudnn)
      break
  }

  // unarchive cudnn to CUDA directory
  try {
    core.info(`Unarchiving cudnn files: ${cudnnArchivePath}`)
    const exitCode = await spawn(command, installArgs, {
      stdio: 'inherit',
      shell: true
    })
    core.info(`exit code: ${exitCode}`)
  } catch (error) {
    core.error(`Error during installation: ${error}`)
    throw error
  }

  // await io.rmRF(cudnnArchivePath)

  let filename: string = directoryName
  filename = filename.substring(0, filename.lastIndexOf(fileExt) - 1)
  // move everything unarchived
  core.info(`moving cuDNN shared libraries: ${cudaPath}\\${filename}\\bin`)
  const options = {force: true, recursive: true, copySourceDirectory: false}
  switch (await getOs()) {
    case OSType.linux:
      command = `sudo bash`
      installArgs = [
        '-c',
        `mv "${cudaPath}/${filename}/lib/*" "${cudaPath}/lib/" && mv "${cudaPath}/${filename}/include/*" "${cudaPath}/include/"`
      ]
      try {
        const exitCode = await spawn(command, installArgs, {
          stdio: 'inherit',
          shell: true
        })
        core.debug(`exit code: ${exitCode}`)
      } catch (error) {
        core.debug(`Error during install cuDNN shared libraries: ${error}`)
        throw error
      }
      break
    case OSType.windows:
      try {
        command = 'powershell'
        installArgs = [
          '-command',
          'Move-Item',
          '-Path',
          `"'${cudaPath}\\${filename}\\bin\\*'"`,
          '-DestinationPath',
          `"'${cudaPath}\\bin\\'"`,
          '-Force',
          '-ErrorAction',
          'SilentlyContinue'
        ]
        await spawn(command, installArgs, {
          stdio: 'inherit',
          shell: true
        })
      } catch (error) {
        core.error(`Error during install cuDNN shared libraries: ${error}`)
        throw error
      }
      break
  }

  switch (await getOs()) {
    case OSType.windows:
      try {
        core.info(`moving cuDNN header files: ${cudnnArchivePath}`)
        command = 'powershell'
        installArgs = [
          '-command',
          'Move-Item',
          '-Path',
          `"'${cudaPath}\\${filename}\\include\\*'"`,
          '-DestinationPath',
          `"'${cudaPath}\\include\\'"`,
          '-Force',
          '-ErrorAction',
          'SilentlyContinue'
        ]
        await spawn(command, installArgs, {
          stdio: 'inherit',
          shell: true
        })
      } catch (error) {
        core.error(`Error during install cuDNN header files: ${error}`)
        throw error
      }

      try {
        core.info(`moving cuDNN lib files: ${cudnnArchivePath}`)
        command = 'powershell'
        installArgs = [
          '-command',
          'Move-Item',
          '-Path',
          `"'${cudaPath}\\${filename}\\lib\\x64\\*'"`,
          '-DestinationPath',
          `"'${cudaPath}\\lib\\x64\\'"`,
          '-Force',
          '-ErrorAction',
          'SilentlyContinue'
        ]
        await spawn(command, installArgs, {
          stdio: 'inherit',
          shell: true
        })
      } catch (error) {
        core.error(`Error during install cuDNN lib files: ${error}`)
        throw error
      }
      break
  }
}
