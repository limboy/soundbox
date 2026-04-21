import chokidar, { FSWatcher } from 'chokidar'
import { BrowserWindow } from 'electron'

let watcher: FSWatcher | null = null
let debounce: NodeJS.Timeout | null = null

export function startWatching(root: string, win: BrowserWindow): void {
  stopWatching()
  watcher = chokidar.watch(root, {
    ignored: (p) => /(^|[/\\])\../.test(p) || /node_modules/.test(p),
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 },
    depth: 12
  })
  const notify = (kind: 'tree' | 'text', path: string): void => {
    if (win.isDestroyed()) return
    if (debounce) clearTimeout(debounce)
    debounce = setTimeout(() => {
      if (win.isDestroyed()) return
      win.webContents.send('soundbox:library-changed', { kind, path })
    }, 250)
  }
  watcher.on('add', (p) => notify(isTextLike(p) ? 'text' : 'tree', p))
  watcher.on('unlink', (p) => notify(isTextLike(p) ? 'text' : 'tree', p))
  watcher.on('change', (p) => notify(isTextLike(p) ? 'text' : 'tree', p))
  watcher.on('addDir', (p) => notify('tree', p))
  watcher.on('unlinkDir', (p) => notify('tree', p))
}

export function stopWatching(): void {
  if (debounce) {
    clearTimeout(debounce)
    debounce = null
  }
  if (watcher) {
    watcher.close().catch(() => {})
    watcher = null
  }
}

function isTextLike(p: string): boolean {
  return /\.(lrc|srt|vtt|txt|md|markdown|html?|json)$/i.test(p)
}
