import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getDeviceId: (): Promise<string> => electronAPI.ipcRenderer.invoke('app:getDeviceId'),
  getUpdateStatus: (): Promise<unknown> => ipcRenderer.invoke('app:getUpdateStatus'),
  getReleaseChannel: (): Promise<string> => ipcRenderer.invoke('app:getReleaseChannel'),
  installUpdate: (): Promise<void> => ipcRenderer.invoke('app:installUpdate'),
  onUpdateStatus: (callback: (status: unknown) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, status: unknown): void => callback(status)
    ipcRenderer.on('app:updateStatus', handler)
    return () => ipcRenderer.removeListener('app:updateStatus', handler)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
