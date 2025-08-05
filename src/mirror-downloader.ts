import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'
import * as crypto from 'crypto'
import {URL} from 'url'
import * as cliProgress from 'cli-progress'

export interface DownloadOptions {
  rootDir: string
  maxConcurrent?: number
  showProgress?: boolean
}

export interface DownloadProgress {
  url: string
  filename: string
  downloadedBytes: number
  totalBytes: number
  percentage: number
  speed: number
}

export class MirrorDownloader {
  private rootDir: string
  private maxConcurrent: number
  private showProgress: boolean
  private activeDownloads: Set<string> = new Set()
  private downloadQueue: Array<{
    url: string
    resolve: (path: string) => void
    reject: (error: Error) => void
  }> = []
  private multiBar: cliProgress.MultiBar | null = null
  private progressBars: Map<string, cliProgress.SingleBar> = new Map()

  constructor(options: DownloadOptions) {
    this.rootDir = options.rootDir
    this.maxConcurrent = options.maxConcurrent || 3
    this.showProgress = options.showProgress !== false
  }

  /**
   * Convert NVIDIA URL to local cache path
   * Example: https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.10.2.21_cuda11-archive.zip
   * becomes: /var/www/mirror/compute/cudnn/redist/cudnn/windows-x86_64/cudnn-windows-x86_64-9.10.2.21_cuda11-archive.zip
   */
  private getLocalPath(url: string): string {
    const parsedUrl = new URL(url)

    // Remove the hostname part and keep only the path
    let relativePath = parsedUrl.pathname

    // Remove leading slash if present
    if (relativePath.startsWith('/')) {
      relativePath = relativePath.substring(1)
    }

    return path.join(this.rootDir, relativePath)
  }

  /**
   * Ensure directory exists for the given file path
   */
  private async ensureDirectory(filePath: string): Promise<void> {
    const dir = path.dirname(filePath)
    await fs.promises.mkdir(dir, {recursive: true})
  }

  /**
   * Generate SHA256 hash for a file
   */
  private async generateSHA256(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256')
      const stream = fs.createReadStream(filePath)

      stream.on('data', data => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }

  /**
   * Write SHA256 file
   */
  private async writeSHA256File(filePath: string, hash: string): Promise<void> {
    const sha256Path = `${filePath}.sha256`
    const filename = path.basename(filePath)
    await fs.promises.writeFile(sha256Path, `${hash}  ${filename}\n`)
  }

  /**
   * Check if file and its SHA256 exist
   */
  private async fileAndSHA256Exist(filePath: string): Promise<boolean> {
    const sha256Path = `${filePath}.sha256`
    try {
      await fs.promises.access(filePath)
      await fs.promises.access(sha256Path)
      return true
    } catch {
      return false
    }
  }

  /**
   * Download a single file with progress tracking
   */
  private async downloadFile(url: string): Promise<string> {
    const localPath = this.getLocalPath(url)
    const filename = path.basename(localPath)

    // Check if file and SHA256 already exist
    if (await this.fileAndSHA256Exist(localPath)) {
      if (!this.showProgress) {
        console.log(`✓ File and SHA256 already exist: ${filename}`)
      }
      return localPath
    }

    await this.ensureDirectory(localPath)

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url)
      const client = parsedUrl.protocol === 'https:' ? https : http

      const request = client.get(url, response => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            this.downloadFile(redirectUrl).then(resolve).catch(reject)
            return
          }
        }

        if (response.statusCode !== 200) {
          reject(
            new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`)
          )
          return
        }

        const totalBytes = parseInt(
          response.headers['content-length'] || '0',
          10
        )
        let downloadedBytes = 0
        const startTime = Date.now()

        // Create progress bar for this download
        let progressBar: cliProgress.SingleBar | null = null
        if (this.showProgress && this.multiBar && totalBytes > 0) {
          progressBar = this.multiBar.create(totalBytes, 0, {
            filename:
              filename.length > 50 ? '...' + filename.slice(-47) : filename,
            speed: '0.00 MB/s'
          })
          this.progressBars.set(url, progressBar)
        }

        const writeStream = fs.createWriteStream(localPath)

        response.on('data', chunk => {
          downloadedBytes += chunk.length
          writeStream.write(chunk)

          if (progressBar) {
            const elapsedSeconds = (Date.now() - startTime) / 1000
            const speed = downloadedBytes / elapsedSeconds / 1024 / 1024 // MB/s
            progressBar.update(downloadedBytes, {
              speed: `${speed.toFixed(2)} MB/s`
            })
          }
        })

        response.on('end', async () => {
          writeStream.end()

          try {
            // Generate SHA256 hash
            const hash = await this.generateSHA256(localPath)
            await this.writeSHA256File(localPath, hash)

            if (progressBar) {
              progressBar.update(totalBytes, {
                speed: 'Complete'
              })
              this.progressBars.delete(url)
            } else if (!this.showProgress) {
              console.log(`✓ Downloaded: ${filename}`)
              console.log(`✓ Generated SHA256: ${filename}.sha256`)
            }
            resolve(localPath)
          } catch (error) {
            // Clean up files on error
            fs.unlink(localPath, () => {})
            fs.unlink(`${localPath}.sha256`, () => {})
            if (progressBar) {
              this.multiBar?.remove(progressBar)
              this.progressBars.delete(url)
            }
            reject(error)
          }
        })

        response.on('error', error => {
          writeStream.destroy()
          fs.unlink(localPath, () => {}) // Clean up partial file
          if (progressBar) {
            this.multiBar?.remove(progressBar)
            this.progressBars.delete(url)
          }
          reject(error)
        })
      })

      request.on('error', error => {
        reject(error)
      })

      request.setTimeout(30000, () => {
        request.destroy()
        reject(new Error('Request timeout'))
      })
    })
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Process the download queue with concurrency control
   */
  private async processQueue(): Promise<void> {
    while (
      this.downloadQueue.length > 0 &&
      this.activeDownloads.size < this.maxConcurrent
    ) {
      const item = this.downloadQueue.shift()
      if (!item) break

      this.activeDownloads.add(item.url)

      this.downloadFile(item.url)
        .then(localPath => {
          this.activeDownloads.delete(item.url)
          item.resolve(localPath)
          this.processQueue() // Process next item in queue
        })
        .catch(error => {
          this.activeDownloads.delete(item.url)
          item.reject(error)
          this.processQueue() // Process next item in queue
        })
    }
  }

  /**
   * Download a single URL
   */
  async download(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.downloadQueue.push({url, resolve, reject})
      this.processQueue()
    })
  }

  /**
   * Download multiple URLs concurrently
   */
  async downloadAll(urls: string[]): Promise<string[]> {
    console.log(
      `Starting download of ${urls.length} files with max ${this.maxConcurrent} concurrent downloads...`
    )

    // Initialize multi-bar for progress tracking
    if (this.showProgress) {
      this.multiBar = new cliProgress.MultiBar(
        {
          clearOnComplete: false,
          hideCursor: true,
          format:
            ' {bar} | {filename} | {percentage}% | {value}/{total} | {speed}'
        },
        cliProgress.Presets.shades_classic
      )
    }

    try {
      const promises = urls.map(url => this.download(url))
      const results = await Promise.allSettled(promises)

      // Stop the multi-bar
      if (this.multiBar) {
        this.multiBar.stop()
        this.multiBar = null
      }

      const successful: string[] = []
      const failed: string[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value)
        } else {
          failed.push(urls[index])
          console.error(
            `Failed to download ${urls[index]}: ${result.reason.message}`
          )
        }
      })

      console.log(
        `\nDownload completed: ${successful.length} successful, ${failed.length} failed`
      )

      if (failed.length > 0) {
        console.log('Failed downloads:')
        failed.forEach(url => console.log(`  - ${url}`))
      }

      return successful
    } catch (error) {
      // Cleanup on error
      if (this.multiBar) {
        this.multiBar.stop()
        this.multiBar = null
      }
      throw error
    }
  }
}

/**
 * Convenience function to create and use a downloader
 */
export async function downloadToMirror(
  urls: string | string[],
  options: DownloadOptions
): Promise<string | string[]> {
  const downloader = new MirrorDownloader(options)

  if (typeof urls === 'string') {
    return downloader.download(urls)
  } else {
    return downloader.downloadAll(urls)
  }
}
