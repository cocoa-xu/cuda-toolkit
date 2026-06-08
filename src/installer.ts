import * as artifact from '@actions/artifact'
import * as core from '@actions/core'
import {OSType, getOs, CUDAToolkit} from './platform'
import {spawn} from 'child_process'
import fs from 'fs'

export async function spawnAsync(
  command: string,
  args: string[],
  options: any
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options)

    child.on('close', code => {
      if (code === 0) {
        resolve(code)
      } else {
        reject(new Error(`Process exited with code ${code}`))
      }
    })

    child.on('error', error => {
      reject(error)
    })
  })
}

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
    const exitCode = await spawnAsync(command, installArgs, {
      stdio: 'inherit',
      shell: true
    })
    core.info(`Installer exit code: ${exitCode}`)
  } catch (error) {
    core.error(`Error during installation: ${error}`)
    throw error
  } finally {
    core.info(`Installation finished, cleaning up temporary files.`)
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
  cudaPath: string
): Promise<void> {
  let command: string
  let installArgs: string[]

  // Strip the archive's top-level directory so cuDNN's bin/include/lib are
  // merged into the existing CUDA toolkit at cudaPath.
  switch (await getOs()) {
    case OSType.linux:
      command = 'sudo'
      installArgs = [
        'tar',
        '-xf',
        cudnnArchivePath,
        '--strip-components=1',
        '-C',
        cudaPath
      ]
      break
    case OSType.windows:
      command = 'tar'
      installArgs = [
        '-xf',
        `"${cudnnArchivePath}"`,
        '--strip-components=1',
        '-C',
        `"${cudaPath}"`
      ]
      break
  }

  try {
    core.info(`Unarchiving cuDNN into ${cudaPath}`)
    const exitCode = await spawnAsync(command, installArgs, {
      stdio: 'inherit',
      shell: true
    })
    core.info(`exit code: ${exitCode}`)
  } catch (error) {
    core.error(`Error during cuDNN installation: ${error}`)
    throw error
  }
}
