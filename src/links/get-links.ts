import {OSType, getOs} from '../platform'
import {AbstractLinks} from './links'
import {LinuxX8664Links} from './linux-x86_64-links'
import {LinuxAArch64Links} from './linux-aarch64-links'
import {LinuxPPC64leLinks} from './linux-ppc64le-links'
import {LinuxSBSALinks} from './linux-sbsa-links'
import {WindowsLinks} from './windows-x86_64-links'
import os from 'os'

// Platform independent getter for ILinks interface
export async function getLinks(arch: string): Promise<AbstractLinks> {
  const osType = await getOs()
  if (arch.length === 0) arch = os.arch()
  switch (osType) {
    case OSType.windows:
      if (arch === 'x64') return WindowsLinks.Instance
      else throw new Error(`Unsupported architecture: ${arch}`)
    case OSType.linux:
      if (arch === 'x64') return LinuxX8664Links.Instance
      else if (arch === 'arm64') return LinuxAArch64Links.Instance
      else if (arch === 'ppc64le') return LinuxPPC64leLinks.Instance
      else if (arch === 'sbsa') return LinuxSBSALinks.Instance
      else throw new Error(`Unsupported architecture: ${arch}`)
  }
}
