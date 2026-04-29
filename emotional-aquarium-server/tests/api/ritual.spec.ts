import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'

let app: FastifyInstance

async function joinTeam(teamJoinToken: string): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/teams/join',
    payload: { teamJoinToken }
  })

  return response.json().data.teamAccessKey as string
}

describe('Ritual flow - affirmations, cycle, and submission', () => {
  beforeAll(async () => {
    const mod = await import('../../src/app.js')
    app = mod.buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app?.close()
  })

  it('returns curated positive-only affirmations and cycle context', async () => {
    const accessKey = await joinTeam('TEAM-ALPHA-2026')

    const affirmationsResponse = await app.inject({
      method: 'GET',
      url: '/ritual/affirmations',
      headers: {
        'x-team-access-key': accessKey
      }
    })

    const cycleResponse = await app.inject({
      method: 'GET',
      url: '/ritual/cycle/current',
      headers: {
        'x-team-access-key': accessKey
      }
    })

    expect(affirmationsResponse.statusCode).toBe(200)
    expect(cycleResponse.statusCode).toBe(200)

    const affirmationsBody = affirmationsResponse.json()
    const cycleBody = cycleResponse.json()

    expect(affirmationsBody.success).toBe(true)
    expect(affirmationsBody.data.affirmations.length).toBeGreaterThan(0)
    expect(affirmationsBody.data.affirmations.every((item: { category: string }) => item.category === 'positive')).toBe(
      true
    )
    expect(cycleBody).toMatchObject({
      success: true,
      data: {
        cycle: {
          cycleId: expect.any(String),
          label: expect.stringMatching(/morning|afternoon/i)
        }
      }
    })
  })

  it('allows in-cycle updates before finalization and blocks duplicate final submissions', async () => {
    const accessKey = await joinTeam('TEAM-ALPHA-2026')
    const cycleResponse = await app.inject({
      method: 'GET',
      url: '/ritual/cycle/current',
      headers: {
        'x-team-access-key': accessKey
      }
    })

    const cycleId = cycleResponse.json().data.cycle.cycleId as string
    const deviceId = 'anon_test_ritual_device'

    const pendingResponse = await app.inject({
      method: 'POST',
      url: '/ritual/submission',
      headers: {
        'x-team-access-key': accessKey
      },
      payload: {
        deviceId,
        cycleId,
        affirmationId: 'affirm-calm',
        action: 'save'
      }
    })

    const updatedPendingResponse = await app.inject({
      method: 'POST',
      url: '/ritual/submission',
      headers: {
        'x-team-access-key': accessKey
      },
      payload: {
        deviceId,
        cycleId,
        affirmationId: 'affirm-kind',
        action: 'save'
      }
    })

    const finalizedResponse = await app.inject({
      method: 'POST',
      url: '/ritual/submission',
      headers: {
        'x-team-access-key': accessKey
      },
      payload: {
        deviceId,
        cycleId,
        affirmationId: 'affirm-kind',
        action: 'finalize'
      }
    })

    const duplicateFinalizedResponse = await app.inject({
      method: 'POST',
      url: '/ritual/submission',
      headers: {
        'x-team-access-key': accessKey
      },
      payload: {
        deviceId,
        cycleId,
        affirmationId: 'affirm-calm',
        action: 'finalize'
      }
    })

    expect(pendingResponse.statusCode).toBe(200)
    expect(updatedPendingResponse.statusCode).toBe(200)
    expect(finalizedResponse.statusCode).toBe(200)
    expect(duplicateFinalizedResponse.statusCode).toBe(409)

    const updatedPendingBody = updatedPendingResponse.json()
    expect(updatedPendingBody.data.submission).toMatchObject({
      affirmationId: 'affirm-kind',
      finalized: false,
      status: 'pending'
    })

    const finalizedBody = finalizedResponse.json()
    expect(finalizedBody.data.submission).toMatchObject({
      affirmationId: 'affirm-kind',
      finalized: true,
      status: 'synced'
    })
    expect(finalizedBody.data.stateLabel).toMatch(/submitted and synced/i)

    const duplicateBody = duplicateFinalizedResponse.json()
    expect(duplicateBody).toMatchObject({
      success: false,
      error: {
        code: 'DUPLICATE_CYCLE_SUBMISSION'
      }
    })
  })

  it('rejects out-of-cycle submissions with explanatory state', async () => {
    const accessKey = await joinTeam('TEAM-BETA-2026')

    const response = await app.inject({
      method: 'POST',
      url: '/ritual/submission',
      headers: {
        'x-team-access-key': accessKey
      },
      payload: {
        deviceId: 'anon_cycle_mismatch',
        cycleId: '1900-01-01-morning',
        affirmationId: 'affirm-curious',
        action: 'finalize'
      }
    })

    expect(response.statusCode).toBe(409)
    expect(response.json()).toMatchObject({
      success: false,
      error: {
        code: 'OUT_OF_CYCLE'
      }
    })
  })

  it('resets submissions for the active team cycle in test mode', async () => {
    const accessKey = await joinTeam('TEAM-ALPHA-2026')
    const cycleResponse = await app.inject({
      method: 'GET',
      url: '/ritual/cycle/current',
      headers: {
        'x-team-access-key': accessKey
      }
    })

    const cycleId = cycleResponse.json().data.cycle.cycleId as string

    await app.inject({
      method: 'POST',
      url: '/ritual/submission',
      headers: {
        'x-team-access-key': accessKey
      },
      payload: {
        deviceId: 'anon_reset_route_device',
        cycleId,
        affirmationId: 'affirm-calm',
        action: 'save'
      }
    })

    const resetResponse = await app.inject({
      method: 'POST',
      url: '/ritual/submission/reset',
      headers: {
        'x-team-access-key': accessKey
      },
      payload: {}
    })

    expect(resetResponse.statusCode).toBe(200)
    expect(resetResponse.json()).toMatchObject({
      success: true,
      data: {
        cycleId,
        removedCount: expect.any(Number)
      }
    })
  })

  it('blocks reset endpoint without team authorization header', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/ritual/submission/reset',
      payload: {}
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toMatchObject({
      success: false,
      error: {
        code: 'TEAM_SCOPE_UNAUTHORIZED'
      }
    })
  })
})