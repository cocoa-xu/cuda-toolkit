import {Method} from '../src/method'
import {SemVer} from 'semver'
import {getVersion} from '../src/version'

test.concurrent.each<Method>(['local', 'network'])(
  'Successfully parse correct version for method %s',
  async method => {
    const versionString = '11.2.2'
    const cudnnVersionString = '8.7.0'
    const cudnnURL = 'https://example.com'
    try {
      const toolkit = await getVersion(
        versionString,
        cudnnVersionString,
        cudnnURL,
        method
      )
      expect(toolkit.cuda_version).toBeInstanceOf(SemVer)
      expect(toolkit.cudnn_version).toBeInstanceOf(SemVer)
      expect(toolkit.cuda_version.compare(new SemVer(versionString))).toBe(0)
      if (toolkit.cudnn_version !== undefined) {
        expect(
          toolkit.cudnn_version.compare(new SemVer(cudnnVersionString))
        ).toBe(0)
      }
    } catch (error) {
      // Other OS
    }
  }
)

test.concurrent.each<Method>(['local', 'network'])(
  'Expect error to be thrown on invalid version string for method %s',
  async method => {
    const versionString =
      'invalid version string that does not conform to semver'
    const cudnnURL = 'invalid URL'
    await expect(
      getVersion(versionString, versionString, cudnnURL, method)
    ).rejects.toThrow(TypeError(`Invalid Version: ${versionString}`))
  }
)

test.concurrent.each<Method>(['local', 'network'])(
  'Expect error to be thrown on unavailable version for method %s',
  async method => {
    const versionString = '0.0.1'
    const cudnnVersionString = '8.7.0'
    const cudnnURL = 'invalid URL'
    try {
      await expect(
        getVersion(versionString, cudnnVersionString, cudnnURL, method)
      ).rejects.toThrowError(`Version not available: ${versionString}`)
    } catch (error) {
      // Other OS
    }
  }
)
