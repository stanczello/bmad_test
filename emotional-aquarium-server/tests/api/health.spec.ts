import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'

let app: FastifyInstance

describe('Health Check - GET /health', () => {
  beforeAll(async () => {
    const mod = await import('../../src/app.js')
    app = mod.buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app?.close()
  })

  it('[P1] should return 200 with standard success envelope', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    })

    expect(response.statusCode).toBe(200)

    const body = JSON.parse(response.body)
    expect(body).toMatchObject({
      success: true,
      data: {
        status: 'ok'
      }
    })
    expect(Object.keys(body)).toEqual(['success', 'data'])
  })

  it('[P1] should return correct Content-Type header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    })

    expect(response.headers['content-type']).toMatch(/application\/json/)
  })

  it('[P2] should respond within 200ms', async () => {
    const start = Date.now()
    await app.inject({ method: 'GET', url: '/health' })
    const elapsed = Date.now() - start

    expect(elapsed).toBeLessThan(200)
  })
})
