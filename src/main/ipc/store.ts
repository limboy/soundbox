import { ipcMain } from 'electron'
import { AppState, readState, writeState } from '../lib/store'

export function registerStoreIpc(onChange: (next: AppState) => void): void {
  ipcMain.handle('soundbox:getState', async () => readState())
  ipcMain.handle('soundbox:setState', async (_e, patch: Partial<AppState>) => {
    const next = await writeState(patch)
    onChange(next)
    return next
  })
}
