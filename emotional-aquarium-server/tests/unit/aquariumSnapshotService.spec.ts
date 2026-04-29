import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAquariumSnapshotForAccessKey,
  resetAquariumDemoStateForTests,
  setDemoModeForTeam
} from '../../src/services/aquariumSnapshotService.js'
import { getCurrentCycle, resetRitualStoreForTests, upsertSubmissionForCycle } from '../../src/services/ritualService.js'

describe('aquariumSnapshotService', () => {
  beforeEach(() => {
    resetRitualStoreForTests()
    resetAquariumDemoStateForTests()
  })

  it('shows own-shape visibility for synced in-cycle submissions', () => {
    const morning = new Date('2026-04-29T09:00:00.000Z')
    const morningCycle = getCurrentCycle(morning)

    const upsert = upsertSubmissionForCycle({
      teamId: 'team-alpha',
      deviceId: 'anon_alpha_device',
      cycleId: morningCycle.cycleId,
      affirmationId: 'affirm-calm',
      action: 'finalize',
      now: morning
    })

    expect(upsert.success).toBe(true)

    const snapshot = getAquariumSnapshotForAccessKey(
      'scope_alpha_collective',
      'anon_alpha_device',
      morning
    )

    expect(snapshot).toMatchObject({
      ownContributionVisible: true,
      ownShape: 'circle',
      isDemoMode: false
    })
    expect(snapshot?.shapes.length).toBeGreaterThan(0)
  })

  it('applies noon reset semantics and explains empty state in afternoon cycle', () => {
    const morning = new Date('2026-04-29T09:00:00.000Z')
    const morningCycle = getCurrentCycle(morning)

    upsertSubmissionForCycle({
      teamId: 'team-alpha',
      deviceId: 'anon_alpha_device',
      cycleId: morningCycle.cycleId,
      affirmationId: 'affirm-kind',
      action: 'finalize',
      now: morning
    })

    const afternoon = new Date('2026-04-29T13:00:00.000Z')
    const snapshot = getAquariumSnapshotForAccessKey('scope_alpha_collective', 'anon_alpha_device', afternoon)

    expect(snapshot).toMatchObject({
      cycleWindow: 'afternoon',
      shapes: [],
      ownContributionVisible: false
    })
    expect(snapshot?.emptyStateMessage).toMatch(/reset at noon/i)
  })

  it('isolates demo mode from live contribution data', () => {
    const morning = new Date('2026-04-29T09:00:00.000Z')
    const morningCycle = getCurrentCycle(morning)

    upsertSubmissionForCycle({
      teamId: 'team-alpha',
      deviceId: 'anon_alpha_device',
      cycleId: morningCycle.cycleId,
      affirmationId: 'affirm-curious',
      action: 'finalize',
      now: morning
    })

    setDemoModeForTeam('team-alpha', true)

    const snapshot = getAquariumSnapshotForAccessKey('scope_alpha_collective', 'anon_alpha_device', morning)

    expect(snapshot).toMatchObject({
      isDemoMode: true,
      ownContributionVisible: false,
      ownShape: null,
      habitatTone: 'demo-glow'
    })
    expect(snapshot?.submittedCount).toBeGreaterThan(0)
  })
})
