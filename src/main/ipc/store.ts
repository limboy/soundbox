import { ipcMain } from 'electron'
import { AppState, readState, writeState } from '../lib/store'
import { updateWatcher } from '../lib/watcher'

export function registerStoreIpc(): void {
  ipcMain.handle('soundbox:getState', async () => readState())
  ipcMain.handle('soundbox:setState', async (_e, patch: Partial<AppState>) => {
    const next = await writeState(patch)
    updateWatcher(next)
    return next
  })
}
