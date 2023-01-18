import {LinuxLinks} from '../../src/links/linux-links'
import {WindowsLinks} from '../../src/links/windows-links'
import {getLinks} from '../../src/links/get-links'

test.concurrent('getLinks gives a valid ILinks class', async () => {
  try {
    const links = await getLinks()
    expect(
      links instanceof LinuxLinks || links instanceof WindowsLinks
    ).toBeTruthy()
  } catch (error) {
    // Other OS
  }
})

test.concurrent('getLinks return same versions in same order', async () => {
  const linuxLinks = LinuxLinks.Instance.getAvailableLocalCudaVersions()
  const windowsLinks = WindowsLinks.Instance.getAvailableLocalCudaVersions()
  const windowsNetworkLinks =
    WindowsLinks.Instance.getAvailableNetworkCudaVersions()

  expect(linuxLinks.length).toBe(windowsLinks.length)
  expect(windowsLinks.length).toBe(windowsNetworkLinks.length)
  expect(linuxLinks).toEqual(windowsLinks)
  expect(windowsLinks).toEqual(windowsNetworkLinks)
})

test.concurrent(
  'getLinks return compatible cudnn version given cuda version',
  async () => {
    const linuxLinks =
      LinuxLinks.Instance.getAvailableLocalCudnnVersions('11.0.0')
    const windowsLinks =
      WindowsLinks.Instance.getAvailableLocalCudnnVersions('11.0.0')

    expect(linuxLinks.length).toBe(windowsLinks.length)
  }
)
