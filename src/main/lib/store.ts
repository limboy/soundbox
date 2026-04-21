import { app } from 'electron'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export type CollectionType = 'Music' | 'Audio Book'
export type Collection = {
  id: string
  title: string
  type: CollectionType
  items: string[] // Array of file paths
}

export type AppState = {
  rootFolder: string | null
  collections: Collection[]
  selectedCollectionId: string | null
  lastAudioPath: string | null
}

const DEFAULT: AppState = {
  rootFolder: null,
  collections: [],
  selectedCollectionId: null,
  lastAudioPath: null
}

let cached: AppState | null = null

function storePath(): string {
  return join(app.getPath('userData'), 'soundbox.json')
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
  return cached
}

export async function writeState(patch: Partial<AppState>): Promise<AppState> {
  const current = await readState()
  const next = { ...current, ...patch }
  cached = next
  const path = storePath()
  const tmp = `${path}.tmp`
  await writeFile(tmp, JSON.stringify(next, null, 2), 'utf8')
  await rename(tmp, path)
  return next
}
