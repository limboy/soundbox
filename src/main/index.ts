import { app, shell, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  registerLocalProtocolHandler,
  registerLocalSchemePrivileged
} from './lib/protocol'
import { readState } from './lib/store'
import { startWatching, stopWatching } from './lib/watcher'
import { clearDurationCache, registerFsIpc } from './ipc/fs'
import { registerDialogIpc } from './ipc/dialog'
import { registerStoreIpc } from './ipc/store'

registerLocalSchemePrivileged()

let currentRoot: string | null = null
let mainWindow: BrowserWindow | null = null

function getRoot(): string | null {
  return currentRoot
}

function getWindow(): BrowserWindow | null {
  return mainWindow && !mainWindow.isDestroyed() ? mainWindow : null
}

function applyRoot(root: string | null): void {
  currentRoot = root
  clearDurationCache()
  const win = getWindow()
  if (root && win) {
    startWatching(root, win)
  } else {
    stopWatching()
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerLocalProtocolHandler(getRoot)
  registerDialogIpc(getWindow)
  registerFsIpc()
  registerStoreIpc((next) => applyRoot(next.rootFolder))

  const initial = await readState()
  currentRoot = initial.rootFolder

  createWindow()

  if (currentRoot && mainWindow) {
    startWatching(currentRoot, mainWindow)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopWatching()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
