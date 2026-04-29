import { describe, it, expect } from 'vitest'

describe('useAppStore', () => {
  it('initializes with stable release channel and idle updater state', async () => {
    const { useAppStore } = await import('../../src/renderer/src/stores/useAppStore')
    const state = useAppStore.getState()

    expect(state.isReady).toBe(false)
    expect(state.releaseChannel).toBe('stable')
    expect(state.updateStatus).toEqual({ phase: 'idle' })
  })

  it('updates release channel', async () => {
    const { useAppStore } = await import('../../src/renderer/src/stores/useAppStore')
    useAppStore.getState().setReleaseChannel('beta')

    expect(useAppStore.getState().releaseChannel).toBe('beta')
  })

  it('updates updater status with phase payload', async () => {
    const { useAppStore } = await import('../../src/renderer/src/stores/useAppStore')

    useAppStore.getState().setUpdateStatus({ phase: 'downloading', percent: 65 })
    expect(useAppStore.getState().updateStatus).toEqual({ phase: 'downloading', percent: 65 })

    useAppStore.getState().setUpdateStatus({ phase: 'ready', version: '1.2.3' })
    expect(useAppStore.getState().updateStatus).toEqual({ phase: 'ready', version: '1.2.3' })
  })
})
