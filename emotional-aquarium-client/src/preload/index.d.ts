import { ElectronAPI } from '@electron-toolkit/preload'

interface AppApi {
  getDeviceId: () => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppApi
  }
}
