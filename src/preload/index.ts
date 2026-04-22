import { contextBridge, ipcRenderer, IpcRendererEvent, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {}

const soundbox = {
  openFolder: () => ipcRenderer.invoke('soundbox:openFolder') as Promise<string | null>,
  readTree: (root: string) => ipcRenderer.invoke('soundbox:readTree', root),
  probeDuration: (path: string) =>
    ipcRenderer.invoke('soundbox:probeDuration', path) as Promise<number | null>,
  probeMetadata: (path: string) =>
    ipcRenderer.invoke('soundbox:probeMetadata', path) as Promise<{
      artist: string
      album: string
      title: string
    } | null>,
  getBulkMetadata: (paths: string[]) =>
    ipcRenderer.invoke('soundbox:getBulkMetadata', paths) as Promise<
      Record<
        string,
        { meta: { artist: string; album: string; title: string }; duration: number | null }
      >
    >,
  getState: () => ipcRenderer.invoke('soundbox:getState'),
  setState: (patch: Partial<import('./soundbox').AppState>) =>
    ipcRenderer.invoke('soundbox:setState', patch),
  onLibraryChanged: (cb: (payload: { kind: 'tree'; path: string }) => void) => {
    const listener = (_: IpcRendererEvent, payload: { kind: 'tree'; path: string }): void =>
      cb(payload)
    ipcRenderer.on('soundbox:library-changed', listener)
    return () => {
      ipcRenderer.removeListener('soundbox:library-changed', listener)
    }
  },
  onStateUpdated: (cb: (state: import('./soundbox').AppState) => void) => {
    const listener = (_: IpcRendererEvent, state: import('./soundbox').AppState): void => cb(state)
    ipcRenderer.on('soundbox:state-updated', listener)
    return () => {
      ipcRenderer.removeListener('soundbox:state-updated', listener)
    }
  },
  getPathInfo: (path: string) =>
    ipcRenderer.invoke('soundbox:getPathInfo', path) as Promise<{
      isDirectory: boolean
      isFile: boolean
      ext: string
    } | null>,
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
  update: {
    onUpdateReady: (cb: (info: { version: string }) => void) => {
      const listener = (_: IpcRendererEvent, info: { version: string }): void => cb(info)
      ipcRenderer.on('soundbox:update-ready', listener)
      return () => {
        ipcRenderer.removeListener('soundbox:update-ready', listener)
      }
    },
    apply: () => ipcRenderer.invoke('soundbox:apply-update') as Promise<void>
  }
}


if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('soundbox', soundbox)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.soundbox = soundbox
}
