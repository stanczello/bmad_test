import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { resetAquariumDemoStateForTests } from '../../src/services/aquariumSnapshotService.js'
import { getCurrentCycle, resetRitualStoreForTests } from '../../src/services/ritualService.js'

let app: FastifyInstance

async function joinTeam(teamJoinToken: string): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/teams/join',
    payload: {
      teamJoinToken
    }
  })

  return response.json().data.teamAccessKey as string
}

describe('Aquarium Access - GET /aquarium/current', () => {
  beforeAll(async () => {
    const mod = await import('../../src/app.js')
    app = mod.buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app?.close()
  })

  beforeEach(() => {
    resetRitualStoreForTests()
    resetAquariumDemoStateForTests()
  })

  it('returns only authorized team-scoped shapes and own contribution visibility', async () => {
    const alphaAccessKey = await joinTeam('TEAM-ALPHA-2026')
    const betaAccessKey = await joinTeam('TEAM-BETA-2026')
    const cycleId = getCurrentCycle().cycleId

    await app.inject({
      method: 'POST',
      url: '/ritual/submission',
      headers: {
        'x-team-access-key': alphaAccessKey
      },
      payload: {
        deviceId: 'anon-alpha-1',
        cycleId,
        affirmationId: 'affirm-calm',
        action: 'finalize'
      }
    })

    await app.inject({
      method: 'POST',
      url: '/ritual/submission',
      headers: {
        'x-team-access-key': betaAccessKey
      },
      payload: {
        deviceId: 'anon-beta-1',
        cycleId,
        affirmationId: 'affirm-kind',
        action: 'finalize'
      }
    })

    const alphaResponse = await app.inject({
      method: 'GET',
      url: '/aquarium/current?deviceId=anon-alpha-1',
      headers: {
        'x-team-access-key': alphaAccessKey
      }
    })

    const betaResponse = await app.inject({
      method: 'GET',
      url: '/aquarium/current',
      headers: {
        'x-team-access-key': betaAccessKey
      }
    })

    expect(alphaResponse.statusCode).toBe(200)
    expect(betaResponse.statusCode).toBe(200)

    const alphaBody = alphaResponse.json()
    const betaBody = betaResponse.json()

    expect(alphaBody).toMatchObject({
      success: true,
      data: {
        snapshot: {
          teamId: 'team-alpha',
          teamName: 'Alpha Team',
          ownContributionVisible: true,
          ownShape: 'circle'
        }
      }
    })
    expect(betaBody).toMatchObject({
      success: true,
      data: {
        snapshot: {
          teamId: 'team-beta',
          teamName: 'Beta Team',
          ownContributionVisible: false
        }
      }
    })
    expect(alphaBody.data.snapshot).not.toMatchObject(betaBody.data.snapshot)
    expect(JSON.stringify(alphaBody)).not.toMatch(
      /deviceId|email|userId|participantName|manager|surveillance/i
    )
  })

  it('isolates demo mode snapshots from live team submissions', async () => {
    const alphaAccessKey = await joinTeam('TEAM-ALPHA-2026')
    const cycleId = getCurrentCycle().cycleId

    await app.inject({
      method: 'POST',
      url: '/ritual/submission',
      headers: {
        'x-team-access-key': alphaAccessKey
      },
      payload: {
        deviceId: 'anon-alpha-live',
        cycleId,
        affirmationId: 'affirm-curious',
        action: 'finalize'
      }
    })

    const enableDemoResponse = await app.inject({
      method: 'POST',
      url: '/aquarium/demo-mode',
      headers: {
        'x-team-access-key': alphaAccessKey
      },
      payload: {
        enabled: true
      }
    })

    const demoSnapshotResponse = await app.inject({
      method: 'GET',
      url: '/aquarium/current?deviceId=anon-alpha-live',
      headers: {
        'x-team-access-key': alphaAccessKey
      }
    })

    expect(enableDemoResponse.statusCode).toBe(200)
    expect(demoSnapshotResponse.statusCode).toBe(200)

    const demoSnapshot = demoSnapshotResponse.json().data.snapshot
    expect(demoSnapshot).toMatchObject({
      isDemoMode: true,
      ownContributionVisible: false,
      habitatTone: 'demo-glow'
    })
  })

  it('rejects aquarium requests without a valid team access key', async () => {
    const missingAccessResponse = await app.inject({
      method: 'GET',
      url: '/aquarium/current'
    })

    expect(missingAccessResponse.statusCode).toBe(401)
    expect(missingAccessResponse.json()).toMatchObject({
      success: false,
      error: {
        code: 'TEAM_SCOPE_UNAUTHORIZED'
      }
    })

    const invalidAccessResponse = await app.inject({
      method: 'GET',
      url: '/aquarium/current',
      headers: {
        'x-team-access-key': 'scope_unknown_collective'
      }
    })

    expect(invalidAccessResponse.statusCode).toBe(403)
    expect(invalidAccessResponse.json()).toMatchObject({
      success: false,
      error: {
        code: 'TEAM_SCOPE_UNAUTHORIZED'
      }
    })
  })
})