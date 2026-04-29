import { create } from 'zustand'

export type UpdatePhase =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'ready'
  | 'error'

export type UpdateStatus =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'available'; version: string }
  | { phase: 'not-available' }
  | { phase: 'downloading'; percent: number }
  | { phase: 'ready'; version: string }
  | { phase: 'error'; message: string }

type AppState = {
  isReady: boolean
  releaseChannel: string
  updateStatus: UpdateStatus
  setReleaseChannel: (channel: string) => void
  setUpdateStatus: (status: UpdateStatus) => void
}

export const useAppStore = create<AppState>((set) => ({
  isReady: false,
  releaseChannel: 'stable',
  updateStatus: { phase: 'idle' },
  setReleaseChannel: (releaseChannel) => {
    set({ releaseChannel })
  },
  setUpdateStatus: (updateStatus) => {
    set({ updateStatus })
  }
}))
