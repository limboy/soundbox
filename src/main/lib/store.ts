import { app } from 'electron'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export type CollectionType = 'Music' | 'Audio Book'
export type Collection = {
  id: string
  title: string
  type: CollectionType
  items: string[] // Array of file paths
}

export type AppState = {
  collections: Collection[]
  selectedCollectionId: string | null
  lastAudioPath: string | null
}

const DEFAULT: AppState = {
  collections: [],
  selectedCollectionId: null,
  lastAudioPath: null
}

let cached: AppState | null = null
const authorizedPaths = new Set<string>()

function storePath(): string {
  return join(app.getPath('userData'), 'soundbox.json')
}

function normalizePath(p: string): string {
  const n = resolve(p)
  return process.platform !== 'linux' ? n.toLowerCase() : n
}

function updateAuthorizedPaths(state: AppState): void {
  authorizedPaths.clear()
  for (const c of state.collections) {
    for (const item of c.items) {
      authorizedPaths.add(normalizePath(item))
    }
  }
}

export async function readState(): Promise<AppState> {
  if (cached) return cached
  try {
    const raw = await readFile(storePath(), 'utf8')
    const parsed = JSON.parse(raw) as Partial<AppState>
    cached = { ...DEFAULT, ...parsed }
  } catch {
    cached = { ...DEFAULT }
  }
  updateAuthorizedPaths(cached)
  return cached
}

export async function writeState(patch: Partial<AppState>): Promise<AppState> {
  const current = await readState()
  const next = { ...current, ...patch }
  cached = next
  updateAuthorizedPaths(cached)
  const path = storePath()
  const tmp = `${path}.tmp`
  await writeFile(tmp, JSON.stringify(next, null, 2), 'utf8')
  await rename(tmp, path)
  return next
}

export function isAuthorizedPath(path: string): boolean {
  return authorizedPaths.has(normalizePath(path))
}
