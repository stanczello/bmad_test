import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'

let app: FastifyInstance

describe('Team Join - POST /teams/join', () => {
  beforeAll(async () => {
    const mod = await import('../../src/app.js')
    app = mod.buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app?.close()
  })

  it('accepts a valid team join token and returns team scope', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/teams/join',
      payload: {
        teamJoinToken: 'TEAM-ALPHA-2026'
      }
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toMatchObject({
      success: true,
      data: {
        team: {
          teamId: 'team-alpha',
          companyId: 'company-bmad',
          teamName: 'Alpha Team'
        },
        teamAccessKey: 'scope_alpha_collective'
      }
    })
    expect(JSON.stringify(body)).not.toMatch(/deviceId|email|userId/i)
  })

  it('rejects malformed tokens with recovery guidance', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/teams/join',
      payload: {
        teamJoinToken: 'bad token!'
      }
    })

    expect(response.statusCode).toBe(400)
    const body = response.json()
    expect(body).toMatchObject({
      success: false,
      error: {
        code: 'INVALID_TOKEN_FORMAT'
      }
    })
    expect(body.error.message).toMatch(/rollout owner/i)
  })

  it('rejects invalid or expired tokens with clear guidance', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/teams/join',
      payload: {
        teamJoinToken: 'TEAM-UNKNOWN-2026'
      }
    })

    expect(response.statusCode).toBe(401)
    const body = response.json()
    expect(body).toMatchObject({
      success: false,
      error: {
        code: 'TEAM_TOKEN_INVALID_OR_EXPIRED'
      }
    })
    expect(body.error.message).toMatch(/invalid or expired/i)
  })
})
