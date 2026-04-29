import { describe, expect, it, vi } from 'vitest'
import { publishTeamLiveSnapshot, registerTeamLiveSocket } from '../../src/services/aquariumLiveService'

type LiveEvent = 'close' | 'error'

type MockSocket = {
  send: ReturnType<typeof vi.fn>
  close: ReturnType<typeof vi.fn>
  on: (event: LiveEvent, listener: () => void) => void
  readyState: number
  trigger: (event: LiveEvent) => void
}

function createMockSocket(readyState = 1): MockSocket {
  const listeners: Partial<Record<LiveEvent, () => void>> = {}

  return {
    send: vi.fn(),
    close: vi.fn(),
    readyState,
    on: (event, listener) => {
      listeners[event] = listener
    },
    trigger: (event) => {
      listeners[event]?.()
    }
  }
}

describe('aquariumLiveService', () => {
  it('publishes payload to open sockets only', () => {
    const openSocket = createMockSocket(1)
    const closedSocket = createMockSocket(3)

    registerTeamLiveSocket('team-live-open', openSocket)
    registerTeamLiveSocket('team-live-open', closedSocket)

    publishTeamLiveSnapshot('team-live-open', { type: 'snapshot:update', snapshot: { count: 2 } })

    expect(openSocket.send).toHaveBeenCalledTimes(1)
    expect(closedSocket.send).not.toHaveBeenCalled()
  })

  it('unregisters sockets on close and error events', () => {
    const closeSocket = createMockSocket(1)
    const errorSocket = createMockSocket(1)

    registerTeamLiveSocket('team-live-unregister', closeSocket)
    registerTeamLiveSocket('team-live-unregister', errorSocket)

    closeSocket.trigger('close')
    errorSocket.trigger('error')

    publishTeamLiveSnapshot('team-live-unregister', { type: 'snapshot:update' })

    expect(closeSocket.send).not.toHaveBeenCalled()
    expect(errorSocket.send).not.toHaveBeenCalled()
  })

  it('safely no-ops when publishing to unknown team', () => {
    expect(() => publishTeamLiveSnapshot('team-live-unknown', { type: 'snapshot:update' })).not.toThrow()
  })
})
