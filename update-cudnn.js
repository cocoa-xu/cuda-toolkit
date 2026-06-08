#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const semver = require('semver')

const REDIST_BASE =
  'https://developer.download.nvidia.com/compute/cudnn/redist'

// Inclusive version range to fill. Override with: node update-cudnn.js <from> <to>
const DEFAULT_FROM = '9.11.1'
const DEFAULT_TO = '9.22.0'

// Each target file resolves to the first platform that the release actually
// ships. linux-aarch64 falls back to linux-sbsa, matching the existing data
// (NVIDIA stopped publishing linux-aarch64 archives after 9.21.x).
const TARGETS = [
  {file: 'src/links/linux-x86_64-links.ts', platforms: ['linux-x86_64']},
  {file: 'src/links/windows-x86_64-links.ts', platforms: ['windows-x86_64']},
  {file: 'src/links/linux-aarch64-links.ts', platforms: ['linux-aarch64', 'linux-sbsa']}
]

async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`)
  }
  return res.text()
}

async function discoverVersions() {
  const html = await fetchText(`${REDIST_BASE}/`)
  const versions = new Set()
  for (const m of html.matchAll(/redistrib_(\d+\.\d+\.\d+)\.json/g)) {
    versions.add(m[1])
  }
  return [...versions].sort(semver.compare)
}

function variantsForPlatform(cudnn, platforms) {
  const platform = platforms.find(p => cudnn[p] !== undefined)
  if (platform === undefined) return null
  return Object.entries(cudnn[platform])
    .map(([variant, data]) => ({
      major: parseInt(variant.slice('cuda'.length), 10),
      url: `${REDIST_BASE}/${data.relative_path}`
    }))
    .sort((a, b) => a.major - b.major)
}

function renderEntry(version, variants) {
  const pairs = variants
    .map(v => `          [\n            ${v.major},\n            '${v.url}'\n          ]`)
    .join(',\n')
  return `      [\n        '${version}',\n        new Map([\n${pairs}\n        ])\n      ]`
}

const ENTRY_RE =
  /      \[\n        '(\d+\.\d+\.\d+)',\n        new Map\(\[\n([\s\S]*?)\n        \]\)\n      \]/g

function parseExistingEntries(inner) {
  const entries = []
  for (const m of inner.matchAll(ENTRY_RE)) {
    entries.push({version: m[1], text: m[0]})
  }
  // Guard against silent corruption: the parsed entries must round-trip.
  if (entries.map(e => e.text).join(',\n') !== inner) {
    throw new Error('cudnn map layout not recognized; aborting to avoid corruption')
  }
  return entries
}

function updateFile(absPath, platforms, releases) {
  const text = fs.readFileSync(absPath, 'utf8')
  const start = '    this.cudnnVersionToURL = new Map([\n'
  const startIdx = text.indexOf(start)
  if (startIdx === -1) {
    throw new Error(`cudnnVersionToURL map not found in ${absPath}`)
  }
  const contentStart = startIdx + start.length
  const endIdx = text.indexOf('\n    ])', contentStart)
  const inner = text.slice(contentStart, endIdx)

  const existing = parseExistingEntries(inner)
  const present = new Set(existing.map(e => e.version))

  const added = []
  for (const {version, cudnn} of releases) {
    if (present.has(version)) continue
    const variants = variantsForPlatform(cudnn, platforms)
    if (variants === null || variants.length === 0) continue
    existing.push({version, text: renderEntry(version, variants)})
    added.push(version)
  }

  if (added.length === 0) return []

  existing.sort((a, b) => semver.compare(a.version, b.version))
  const newInner = existing.map(e => e.text).join(',\n')
  fs.writeFileSync(absPath, text.slice(0, contentStart) + newInner + text.slice(endIdx))
  return added
}

async function main() {
  const from = process.argv[2] || DEFAULT_FROM
  const to = process.argv[3] || DEFAULT_TO
  console.log(`[*] filling missing cuDNN versions in [${from}, ${to}]`)

  const all = await discoverVersions()
  const wanted = all.filter(v => semver.gte(v, from) && semver.lte(v, to))
  console.log(`[*] ${wanted.length} candidate version(s): ${wanted.join(', ')}`)

  const releases = await Promise.all(
    wanted.map(async version => {
      const data = JSON.parse(
        await fetchText(`${REDIST_BASE}/redistrib_${version}.json`)
      )
      if (!data || !data.cudnn) {
        throw new Error(`no "cudnn" entry in redistrib_${version}.json`)
      }
      return {version, cudnn: data.cudnn}
    })
  )

  for (const target of TARGETS) {
    const absPath = path.resolve(__dirname, target.file)
    const added = updateFile(absPath, target.platforms, releases)
    if (added.length > 0) {
      console.log(`[+] ${target.file}: added ${added.length} -> ${added.join(', ')}`)
    } else {
      console.log(`[=] ${target.file}: already up to date`)
    }
  }
}

main().catch(err => {
  console.error(`[!] ${err.message}`)
  process.exit(1)
})
