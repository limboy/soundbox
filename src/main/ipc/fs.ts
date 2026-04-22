import { ipcMain } from 'electron'
import { readFile, stat } from 'node:fs/promises'
import { extname } from 'node:path'
import { parseFile } from 'music-metadata'
import { findCompanions, readTree } from '../lib/scan'
import { app } from 'electron'
import { join } from 'node:path'
import { writeFile, mkdir } from 'node:fs/promises'
import crypto from 'node:crypto'

import { getCachedMetadata, setCachedMetadata } from '../lib/metadata-cache'

// No longer needed since we have persistent cache
// const durationCache = new Map<string, number | null>()


export function registerFsIpc(): void {
  ipcMain.handle('soundbox:readTree', async (_e, root: string) => {
    return readTree(root)
  })

  ipcMain.handle('soundbox:readText', async (_e, path: string) => {
    return readFile(path, 'utf8')
  })

  ipcMain.handle('soundbox:findCompanions', async (_e, audioPath: string) => {
    return findCompanions(audioPath)
  })

  ipcMain.handle('soundbox:probeDuration', async (_e, path: string) => {
    const cached = await getCachedMetadata(path)
    if (cached !== null) return cached.duration

    try {
      const meta = await parseFile(path, { duration: true, skipCovers: true })
      const ms =
        typeof meta.format.duration === 'number' ? Math.round(meta.format.duration * 1000) : null

      const artist =
        meta.common.artist ||
        meta.common.albumartist ||
        (meta.common.artists && meta.common.artists[0]) ||
        'Unknown'
      const album = meta.common.album || 'Unknown'
      const title = meta.common.title || 'Unknown'

      await setCachedMetadata(path, {
        duration: ms,
        artist: artist.trim(),
        album: album.trim(),
        title: title.trim()
      })

      return ms
    } catch {
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

  ipcMain.handle('soundbox:getBulkMetadata', async (_e, paths: string[]) => {
    const result: Record<
      string,
      { meta: { artist: string; album: string; title: string }; duration: number | null }
    > = {}
    for (const path of paths) {
      const cached = await getCachedMetadata(path)
      if (cached) {
        result[path] = {
          meta: {
            artist: cached.artist,
            album: cached.album,
            title: cached.title
          },
          duration: cached.duration
        }
      }
    }
    return result
  })

  ipcMain.handle('soundbox:probeMetadata', async (_e, path: string) => {

    const cached = await getCachedMetadata(path)
    if (cached !== null) {
      return {
        artist: cached.artist,
        album: cached.album,
        title: cached.title
      }
    }

    try {
      const meta = await parseFile(path, { duration: true, skipCovers: true })
      
      const artist = (
        meta.common.artist ||
        meta.common.albumartist ||
        (meta.common.artists && meta.common.artists[0]) ||
        'Unknown'
      ).trim()
      const album = (meta.common.album || 'Unknown').trim()
      const title = (meta.common.title || 'Unknown').trim()
      const ms =
        typeof meta.format.duration === 'number' ? Math.round(meta.format.duration * 1000) : null
      
      await setCachedMetadata(path, {
        duration: ms,
        artist,
        album,
        title
      })

      return {
        artist,
        album,
        title,
      }
    } catch {
      return null
    }
  })

  ipcMain.handle('soundbox:fetchAndCacheLyrics', async (_e, path: string, trackName: string, artistName: string, albumName: string, duration: number) => {
    try {
      const u = new URL('https://lrclib.net/api/get')
      u.searchParams.set('track_name', trackName)
      u.searchParams.set('artist_name', artistName)
      u.searchParams.set('album_name', albumName)
      u.searchParams.set('duration', Math.round(duration).toString())
      const res = await fetch(u.toString())
      if (!res.ok) return null
      const data = await res.json()
      if (!data || !data.syncedLyrics) return null
      
      const lyricsCacheDir = join(app.getPath('userData'), 'lyricsCache')
      try {
        await mkdir(lyricsCacheDir, { recursive: true })
      } catch {
        /* ignore */
      }

      const hash = crypto.createHash('md5').update(path).digest('hex')
      const cachePath = join(lyricsCacheDir, `${hash}.lrc`)
      await writeFile(cachePath, data.syncedLyrics, 'utf8')
      return cachePath
    } catch {
      return null
    }
  })
}

export function clearDurationCache(): void {
  // durationCache.clear()
}
