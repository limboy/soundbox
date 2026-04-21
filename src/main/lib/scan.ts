import type { Dirent } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'

export const AUDIO_EXTS = new Set(['.mp3', '.m4a', '.m4b', '.flac'])

export const TEXT_EXTS = new Set([
  '.lrc',
  '.srt',
  '.vtt',
  '.txt',
  '.md',
  '.markdown',
  '.html',
  '.htm'
])

export type TreeNode =
  | { kind: 'dir'; name: string; path: string; children: TreeNode[] }
  | { kind: 'audio'; name: string; path: string }

const IGNORE = new Set(['.DS_Store', 'Thumbs.db', '.git', 'node_modules', '.Trash'])

export async function readTree(root: string): Promise<TreeNode> {
  const name = basename(root) || root
  const rootNode: TreeNode = { kind: 'dir', name, path: root, children: [] }
  await walk(rootNode, 0)
  return rootNode
}

async function walk(node: Extract<TreeNode, { kind: 'dir' }>, depth: number): Promise<void> {
  if (depth > 12) return
  let entries: Dirent[] = []
  try {
    entries = (await readdir(node.path, { withFileTypes: true })) as Dirent[]
  } catch {
    return
  }
  entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })
  for (const entry of entries) {
    if (IGNORE.has(entry.name)) continue
    if (entry.name.startsWith('.')) continue
    const fullPath = join(node.path, entry.name)
    if (entry.isDirectory()) {
      const child: TreeNode = { kind: 'dir', name: entry.name, path: fullPath, children: [] }
      await walk(child, depth + 1)
      if (child.children.length > 0) node.children.push(child)
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase()
      if (AUDIO_EXTS.has(ext)) {
        node.children.push({ kind: 'audio', name: entry.name, path: fullPath })
      }
    }
  }
}

export function flattenAudio(node: TreeNode): Array<Extract<TreeNode, { kind: 'audio' }>> {
  const out: Array<Extract<TreeNode, { kind: 'audio' }>> = []
  const visit = (n: TreeNode): void => {
    if (n.kind === 'audio') out.push(n)
    else n.children.forEach(visit)
  }
  visit(node)
  return out
}

export async function findCompanions(
  audioPath: string
): Promise<Array<{ ext: string; path: string }>> {
  const dir = audioPath.replace(/[^/\\]+$/, '')
  const base = basename(audioPath, extname(audioPath))
  let entries: Dirent[] = []
  try {
    entries = (await readdir(dir, { withFileTypes: true })) as Dirent[]
  } catch {
    return []
  }
  const out: Array<{ ext: string; path: string }> = []
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const ext = extname(entry.name).toLowerCase()
    if (!TEXT_EXTS.has(ext)) continue
    const entryBase = basename(entry.name, extname(entry.name))
    if (entryBase !== base) continue
    out.push({ ext, path: join(dir, entry.name) })
  }
  out.sort((a, b) => extOrder(a.ext) - extOrder(b.ext))
  return out
}

const EXT_ORDER: Record<string, number> = {
  '.lrc': 0,
  '.srt': 1,
  '.vtt': 2,
  '.md': 3,
  '.markdown': 4,
  '.txt': 5,
  '.html': 6,
  '.htm': 7
}

function extOrder(ext: string): number {
  return EXT_ORDER[ext] ?? 99
}
