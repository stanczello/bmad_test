import { describe, expect, it } from 'vitest'
import { getOperationalDiagnostics, recordHealthEvent } from '../../src/services/healthService'

describe('healthService', () => {
  it('records health events and exposes diagnostics counters', () => {
    recordHealthEvent('team:join-success')
    recordHealthEvent('team:join-success')
    recordHealthEvent('submission:reset-cycle')

    const diagnostics = getOperationalDiagnostics()

    expect(diagnostics.uptimeSecs).toBeGreaterThanOrEqual(0)
    expect(diagnostics.events['team:join-success']?.count).toBeGreaterThanOrEqual(2)
    expect(diagnostics.events['submission:reset-cycle']?.count).toBeGreaterThanOrEqual(1)
    expect(diagnostics.events['team:join-success']?.lastSeenAt).toBeTruthy()
  })
})
