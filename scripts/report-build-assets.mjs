import { readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { gzipSync } from 'node:zlib'
import { readFileSync } from 'node:fs'

const distDir = new URL('../dist/assets/', import.meta.url)

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)))
    } else {
      files.push(path)
    }
  }

  return files
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`
}

try {
  const rootPath = distDir.pathname
  const files = await collectFiles(rootPath)
  const rows = await Promise.all(
    files.map(async (path) => {
      const info = await stat(path)
      const gzipBytes = gzipSync(readFileSync(path)).length
      return {
        file: relative(rootPath, path),
        bytes: info.size,
        gzipBytes,
      }
    }),
  )

  const interesting = rows
    .filter((row) => /\.(js|css)$/.test(row.file))
    .sort((left, right) => right.bytes - left.bytes)

  console.log('Build asset summary (JS/CSS sorted by raw size)')
  console.log('file\traw\tgzip')
  for (const row of interesting) {
    console.log(`${row.file}\t${formatKb(row.bytes)}\t${formatKb(row.gzipBytes)}`)
  }
} catch (error) {
  console.error('Could not inspect dist/assets. Run npm run build first.')
  if (error instanceof Error) {
    console.error(error.message)
  }
  process.exitCode = 1
}
