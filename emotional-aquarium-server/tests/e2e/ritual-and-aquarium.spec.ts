import { expect, test } from '@playwright/test'

type JoinResponse = {
  success: boolean
  data?: {
    team: {
      teamId: string
      companyId: string
      teamName: string
    }
    teamAccessKey: string
  }
  error?: {
    code: string
    message: string
  }
}

test.describe('Ritual + Aquarium E2E (Playwright API)', () => {
  test('1) joins team and returns scoped access key', async ({ request }) => {
    const response = await request.post('/teams/join', {
      data: { teamJoinToken: 'TEAM-ALPHA-2026' }
    })

    expect(response.status()).toBe(200)
    const body = (await response.json()) as JoinResponse

    expect(body.success).toBe(true)
    expect(body.data?.team.teamId).toBe('team-alpha')
    expect(body.data?.teamAccessKey).toBe('scope_alpha_collective')
  })

  test('2) rejects invalid join token', async ({ request }) => {
    const response = await request.post('/teams/join', {
      data: { teamJoinToken: 'TEAM-INVALID-0000' }
    })

    expect(response.status()).toBe(401)
    const body = (await response.json()) as JoinResponse

    expect(body.success).toBe(false)
    expect(body.error?.code).toBe('TEAM_TOKEN_INVALID_OR_EXPIRED')
  })

  test('3) returns cycle and affirmations for authorized scope', async ({ request }) => {
    const joinResponse = await request.post('/teams/join', {
      data: { teamJoinToken: 'TEAM-ALPHA-2026' }
    })
    const accessKey = ((await joinResponse.json()) as JoinResponse).data!.teamAccessKey

    const cycleResponse = await request.get('/ritual/cycle/current', {
      headers: { 'x-team-access-key': accessKey }
    })
    const affirmationsResponse = await request.get('/ritual/affirmations', {
      headers: { 'x-team-access-key': accessKey }
    })

    expect(cycleResponse.status()).toBe(200)
    expect(affirmationsResponse.status()).toBe(200)

    const cycleBody = (await cycleResponse.json()) as {
      success: boolean
      data: { cycle: { cycleId: string; label: string } }
    }
    const affirmationsBody = (await affirmationsResponse.json()) as {
      success: boolean
      data: { affirmations: Array<{ category: string }> }
    }

    expect(cycleBody.success).toBe(true)
    expect(cycleBody.data.cycle.cycleId).toContain('2026-')
    expect(affirmationsBody.success).toBe(true)
    expect(affirmationsBody.data.affirmations.length).toBeGreaterThan(0)
    expect(affirmationsBody.data.affirmations.every((item) => item.category === 'positive')).toBe(true)
  })

  test('4) supports finalize flow and blocks duplicate finalized submission', async ({ request }) => {
    const joinResponse = await request.post('/teams/join', {
      data: { teamJoinToken: 'TEAM-ALPHA-2026' }
    })
    const accessKey = ((await joinResponse.json()) as JoinResponse).data!.teamAccessKey

    const cycleResponse = await request.get('/ritual/cycle/current', {
      headers: { 'x-team-access-key': accessKey }
    })
    const cycleId = ((await cycleResponse.json()) as { data: { cycle: { cycleId: string } } }).data.cycle
      .cycleId

    const deviceId = `pw-device-${Date.now()}-dup`

    const finalizeFirst = await request.post('/ritual/submission', {
      headers: { 'x-team-access-key': accessKey },
      data: {
        deviceId,
        cycleId,
        affirmationId: 'affirm-calm',
        action: 'finalize'
      }
    })

    const finalizeDuplicate = await request.post('/ritual/submission', {
      headers: { 'x-team-access-key': accessKey },
      data: {
        deviceId,
        cycleId,
        affirmationId: 'affirm-kind',
        action: 'finalize'
      }
    })

    expect(finalizeFirst.status()).toBe(200)
    expect(finalizeDuplicate.status()).toBe(409)

    const duplicateBody = (await finalizeDuplicate.json()) as {
      success: boolean
      error: { code: string }
    }
    expect(duplicateBody.success).toBe(false)
    expect(duplicateBody.error.code).toBe('DUPLICATE_CYCLE_SUBMISSION')
  })

  test('5) reset route clears cycle submission and allows re-finalize', async ({ request }) => {
    const joinResponse = await request.post('/teams/join', {
      data: { teamJoinToken: 'TEAM-ALPHA-2026' }
    })
    const accessKey = ((await joinResponse.json()) as JoinResponse).data!.teamAccessKey

    const cycleResponse = await request.get('/ritual/cycle/current', {
      headers: { 'x-team-access-key': accessKey }
    })
    const cycleId = ((await cycleResponse.json()) as { data: { cycle: { cycleId: string } } }).data.cycle
      .cycleId

    const deviceId = `pw-device-${Date.now()}-reset`

    const firstFinalize = await request.post('/ritual/submission', {
      headers: { 'x-team-access-key': accessKey },
      data: {
        deviceId,
        cycleId,
        affirmationId: 'affirm-calm',
        action: 'finalize'
      }
    })
    expect(firstFinalize.status()).toBe(200)

    const resetResponse = await request.post('/ritual/submission/reset', {
      headers: { 'x-team-access-key': accessKey },
      data: {}
    })
    expect(resetResponse.status()).toBe(200)

    const resetBody = (await resetResponse.json()) as {
      success: boolean
      data: { removedCount: number; cycleId: string }
    }
    expect(resetBody.success).toBe(true)
    expect(resetBody.data.cycleId).toBe(cycleId)
    expect(resetBody.data.removedCount).toBeGreaterThanOrEqual(1)

    const secondFinalize = await request.post('/ritual/submission', {
      headers: { 'x-team-access-key': accessKey },
      data: {
        deviceId,
        cycleId,
        affirmationId: 'affirm-kind',
        action: 'finalize'
      }
    })

    expect(secondFinalize.status()).toBe(200)
  })
})
