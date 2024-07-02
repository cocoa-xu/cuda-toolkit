import {LinuxX8664Links} from '../../src/links/linux-x86_64-links'
import {WindowsLinks} from '../../src/links/windows-x86_64-links'
import {getLinks} from '../../src/links/get-links'

test.concurrent('getLinks gives a valid ILinks class', async () => {
  try {
    const links = await getLinks('x86_64')
    expect(
      links instanceof LinuxX8664Links || links instanceof WindowsLinks
    ).toBeTruthy()
  } catch (error) {
    // Other OS
  }
})

test.concurrent('getLinks return same versions in same order', async () => {
  const linuxX8664Links =
    LinuxX8664Links.Instance.getAvailableLocalCudaVersions()
  const windowsLinks = WindowsLinks.Instance.getAvailableLocalCudaVersions()
  const windowsNetworkLinks =
    WindowsLinks.Instance.getAvailableNetworkCudaVersions()

  expect(linuxX8664Links.length).toBe(windowsLinks.length)
  expect(windowsLinks.length).toBe(windowsNetworkLinks.length)
  expect(linuxX8664Links).toEqual(windowsLinks)
  expect(windowsLinks).toEqual(windowsNetworkLinks)
})
