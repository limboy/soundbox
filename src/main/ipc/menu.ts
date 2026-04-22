import { ipcMain, Menu, shell, BrowserWindow } from 'electron'
import { resolve, normalize } from 'node:path'

export function registerMenuIpc(getWindow: () => BrowserWindow | null): void {
  ipcMain.handle('soundbox:revealInFinder', async (_e, path: string) => {
    shell.showItemInFolder(normalize(resolve(path)))
  })

  ipcMain.handle('soundbox:showSongContextMenu', async (_e, path: string) => {
    const win = getWindow()
    if (!win) return

    const normalizedPath = normalize(resolve(path))

    const menu = Menu.buildFromTemplate([
      {
        label: 'Play',
        click: () => {
          win.webContents.send('soundbox:play-song', path)
        }
      },
      { type: 'separator' },
      {
        label: 'Reveal in Finder',
        click: () => {
          shell.showItemInFolder(normalizedPath)
        }
      }
    ])

    menu.popup({ window: win })
  })
}

