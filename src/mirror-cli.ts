#!/usr/bin/env node

import {MirrorDownloader} from './mirror-downloader'
import {LinuxX8664Links} from './links/linux-x86_64-links'
import {LinuxSBSALinks} from './links/linux-sbsa-links'
import {WindowsLinks} from './links/windows-x86_64-links'
import {AbstractLinks} from './links/links'
import * as process from 'process'

interface CLIOptions {
  cache: string
  links: string
  maxConcurrent: number
  showProgress: boolean
  urls: string[]
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2)
  const options: CLIOptions = {
    cache: '/tmp',
    links: '',
    maxConcurrent: 3,
    showProgress: true,
    urls: []
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--cache':
        options.cache = args[++i]
        break
      case '--links':
        options.links = args[++i]
        break
      case '--max-concurrent':
      case '-c':
        options.maxConcurrent = parseInt(args[++i], 10)
        break
      case '--no-progress':
        options.showProgress = false
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
      default:
        // Handle any remaining arguments as URLs for backwards compatibility
        if (arg.startsWith('http') || !arg.startsWith('-')) {
          options.urls.push(arg)
        }
        break
    }
  }

  return options
}

function printHelp(): void {
  console.log(`
CUDA Toolkit Mirror Downloader

Usage: node mirror-cli.js [options]

Options:
  --links <name>           Link set name (linux-x86_64, windows-x86_64, etc.)
  --cache <path>           Cache directory for mirror (default: /var/www/mirror)
  -c, --max-concurrent <n> Maximum concurrent downloads (default: 3)
  --no-progress           Disable progress bars
  -h, --help              Show this help message

Available Link Sets:
  linux-x86_64     Linux x86_64 CUDA and cuDNN packages
  windows-x86_64   Windows x86_64 CUDA and cuDNN packages

Examples:
  # Download all linux-x86_64 links
  node mirror-cli.js --links linux-x86_64 --cache /var/www/mirror

  # Download with custom settings
  node mirror-cli.js --links windows-x86_64 --cache /my/mirror -c 5

Path Mapping:
  URLs like: https://developer.download.nvidia.com/compute/cudnn/redist/cudnn/windows-x86_64/file.zip
  Are saved to: <cache-dir>/compute/cudnn/redist/cudnn/windows-x86_64/file.zip
`)
}

function getLinksInstance(linksName: string): AbstractLinks {
  switch (linksName) {
    case 'linux-x86_64':
      return LinuxX8664Links.Instance
    case 'linux-sbsa':
      return LinuxSBSALinks.Instance
    case 'windows-x86_64':
      return WindowsLinks.Instance
    default:
      throw new Error(
        `Unknown links name: ${linksName}. Available: linux-x86_64, linux-sbsa, windows-x86_64`
      )
  }
}

function getAllUrls(links: AbstractLinks): string[] {
  const urls: string[] = []

  // Add all CUDA URLs
  for (const [, url] of links.cudaVersionToURL) {
    urls.push(url)
  }

  // Add all cuDNN URLs
  for (const [, cudaMap] of links.cudnnVersionToURL) {
    for (const [, url] of cudaMap) {
      urls.push(url)
    }
  }

  return urls
}

async function main(): Promise<void> {
  const options = parseArgs()

  if (!options.links) {
    console.error('Error: --links parameter is required')
    console.error('Use --help for usage information')
    process.exit(1)
  }

  if (options.maxConcurrent < 1 || options.maxConcurrent > 20) {
    console.error('Error: max-concurrent must be between 1 and 20')
    process.exit(1)
  }

  try {
    const links = getLinksInstance(options.links)
    const urls = getAllUrls(links)

    console.log(`Links set: ${options.links}`)
    console.log(`Cache directory: ${options.cache}`)
    console.log(`Max concurrent downloads: ${options.maxConcurrent}`)
    console.log(
      `Progress bars: ${options.showProgress ? 'enabled' : 'disabled'}`
    )
    console.log(`Total URLs to download: ${urls.length}`)
    console.log('')

    const downloader = new MirrorDownloader({
      rootDir: options.cache,
      maxConcurrent: options.maxConcurrent,
      showProgress: options.showProgress
    })

    if (urls.length === 1) {
      const result = await downloader.download(urls[0])
      console.log(`File saved to: ${result}`)
    } else {
      const results = await downloader.downloadAll(urls)
      console.log(`\nFiles saved to:`)
      results.forEach(filePath => console.log(`  ${filePath}`))
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`)
    process.exit(1)
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error(
      `Unexpected error: ${error instanceof Error ? error.message : error}`
    )
    process.exit(1)
  })
}
