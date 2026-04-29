import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  getAffirmations,
  getCurrentCycle,
  getSubmissionForCycle,
  saveRitualSelection,
  finalizeRitualSelection,
  replayQueuedFinalization,
  isOfflineMode
} from '../../src/renderer/src/services/ritualService'
import { getAquariumSnapshot, setAquariumDemoMode } from '../../src/renderer/src/services/aquariumService'

const originalFetch = global.fetch

describe('service clients', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('handles successful ritual fetches and writes request params', async () => {
    global.fetch = vi.fn(async () => ({
      json: async () => ({ success: true, data: {} })
    })) as typeof fetch

    await getAffirmations('scope_alpha_collective')
    await getCurrentCycle('scope_alpha_collective')
    await getSubmissionForCycle({
      teamAccessKey: 'scope_alpha_collective',
      deviceId: 'anon_test',
      cycleId: '2026-04-29-afternoon'
    })

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/ritual/affirmations', {
      headers: { 'x-team-access-key': 'scope_alpha_collective' }
    })
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/ritual/cycle/current', {
      headers: { 'x-team-access-key': 'scope_alpha_collective' }
    })

    const lastCall = vi.mocked(global.fetch).mock.calls[2]
    expect(String(lastCall?.[0])).toContain('/ritual/submission?')
    expect(String(lastCall?.[0])).toContain('deviceId=anon_test')
    expect(String(lastCall?.[0])).toContain('cycleId=2026-04-29-afternoon')
  })

  it('posts save/finalize payloads and replays queued finalization', async () => {
    global.fetch = vi.fn(async () => ({
      json: async () => ({
        success: true,
        data: {
          submission: {
            deviceId: 'anon_test',
            cycleId: '2026-04-29-afternoon',
            affirmationId: 'affirm-calm',
            status: 'synced',
            finalized: true,
            updatedAt: new Date().toISOString()
          },
          stateLabel: 'Submitted and synced for this cycle.'
        }
      })
    })) as typeof fetch

    await saveRitualSelection({
      teamAccessKey: 'scope_alpha_collective',
      deviceId: 'anon_test',
      cycleId: '2026-04-29-afternoon',
      affirmationId: 'affirm-calm'
    })

    await finalizeRitualSelection({
      teamAccessKey: 'scope_alpha_collective',
      deviceId: 'anon_test',
      cycleId: '2026-04-29-afternoon',
      affirmationId: 'affirm-kind'
    })

    await replayQueuedFinalization({
      queueId: 'q1',
      teamAccessKey: 'scope_alpha_collective',
      deviceId: 'anon_test',
      cycleId: '2026-04-29-afternoon',
      affirmationId: 'affirm-kind',
      queuedAt: new Date().toISOString(),
      attempts: 0
    })

    const calls = vi.mocked(global.fetch).mock.calls
    expect(calls.length).toBe(3)
    expect(String(calls[0]?.[0])).toContain('/ritual/submission')
    expect(String(calls[1]?.[0])).toContain('/ritual/submission')
    expect(String(calls[2]?.[0])).toContain('/ritual/submission')
  })

  it('returns network fallback errors for ritual and aquarium service calls', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('offline')
    }) as typeof fetch

    const ritualA = await getAffirmations('scope_alpha_collective')
    const ritualB = await getCurrentCycle('scope_alpha_collective')
    const ritualC = await getSubmissionForCycle({
      teamAccessKey: 'scope_alpha_collective',
      deviceId: 'anon_test'
    })
    const ritualD = await saveRitualSelection({
      teamAccessKey: 'scope_alpha_collective',
      deviceId: 'anon_test',
      cycleId: '2026-04-29-afternoon',
      affirmationId: 'affirm-calm'
    })
    const ritualE = await finalizeRitualSelection({
      teamAccessKey: 'scope_alpha_collective',
      deviceId: 'anon_test',
      cycleId: '2026-04-29-afternoon',
      affirmationId: 'affirm-calm'
    })

    const aquariumA = await getAquariumSnapshot('scope_alpha_collective', 'anon_test')
    const aquariumB = await setAquariumDemoMode('scope_alpha_collective', true)

    expect(ritualA.success).toBe(false)
    expect(ritualB.success).toBe(false)
    expect(ritualC.success).toBe(false)
    expect(ritualD.success).toBe(false)
    expect(ritualE.success).toBe(false)
    expect(aquariumA.success).toBe(false)
    expect(aquariumB.success).toBe(false)
  })

  it('queries aquarium snapshot without device id and checks offline mode flag', async () => {
    global.fetch = vi.fn(async () => ({
      json: async () => ({ success: true, data: { snapshot: { shapes: [] } } })
    })) as typeof fetch

    await getAquariumSnapshot('scope_alpha_collective')

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/aquarium/current', {
      headers: {
        'x-team-access-key': 'scope_alpha_collective'
      }
    })

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false
    })
    expect(isOfflineMode()).toBe(true)
  })
})

afterAll(() => {
  global.fetch = originalFetch
})
