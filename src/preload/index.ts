import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {}

const soundbox = {
  openFolder: () => ipcRenderer.invoke('soundbox:openFolder') as Promise<string | null>,
  readTree: (root: string) => ipcRenderer.invoke('soundbox:readTree', root),
  readText: (path: string) =>
    ipcRenderer.invoke('soundbox:readText', path) as Promise<string>,
  findCompanions: (audioPath: string) =>
    ipcRenderer.invoke('soundbox:findCompanions', audioPath) as Promise<
      Array<{ ext: string; path: string }>
    >,
  probeDuration: (path: string) =>
    ipcRenderer.invoke('soundbox:probeDuration', path) as Promise<number | null>,
  getState: () => ipcRenderer.invoke('soundbox:getState'),
  setState: (patch: { rootFolder?: string | null; lastAudioPath?: string | null }) =>
    ipcRenderer.invoke('soundbox:setState', patch),
  onLibraryChanged: (cb: (payload: { kind: 'tree' | 'text'; path: string }) => void) => {
    const listener = (_: IpcRendererEvent, payload: { kind: 'tree' | 'text'; path: string }): void =>
      cb(payload)
    ipcRenderer.on('soundbox:library-changed', listener)
    return () => {
      ipcRenderer.removeListener('soundbox:library-changed', listener)
    }
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
