import { ipcMain } from 'electron'
import { readFile, stat } from 'node:fs/promises'
import { extname } from 'node:path'
import { parseFile } from 'music-metadata'
import { isInsideRoot } from '../lib/paths'
import { findCompanions, readTree } from '../lib/scan'

const durationCache = new Map<string, number | null>()

export function registerFsIpc(getRoot: () => string | null): void {
  ipcMain.handle('soundbox:readTree', async (_e, root: string) => {
    return readTree(root)
  })

  ipcMain.handle('soundbox:readText', async (_e, path: string) => {
    const root = getRoot()
    if (!root || !isInsideRoot(root, path)) throw new Error('Forbidden')
    return readFile(path, 'utf8')
  })

  ipcMain.handle('soundbox:findCompanions', async (_e, audioPath: string) => {
    const root = getRoot()
    if (!root || !isInsideRoot(root, audioPath)) return []
    return findCompanions(audioPath)
  })

  ipcMain.handle('soundbox:probeDuration', async (_e, path: string) => {
    const root = getRoot()
    if (!root || !isInsideRoot(root, path)) return null
    if (durationCache.has(path)) return durationCache.get(path) ?? null
    try {
      const meta = await parseFile(path, { duration: true, skipCovers: true })
      const ms =
        typeof meta.format.duration === 'number'
          ? Math.round(meta.format.duration * 1000)
          : null
      durationCache.set(path, ms)
      return ms
    } catch {
      durationCache.set(path, null)
      return null
    }
  })
  ipcMain.handle('soundbox:getPathInfo', async (_e, path: string) => {
    try {
      const s = await stat(path)
      return {
        isDirectory: s.isDirectory(),
        isFile: s.isFile(),
        ext: extname(path).toLowerCase()
      }
    } catch {
      return null
    }
  })
}

export function clearDurationCache(): void {
  durationCache.clear()
}
