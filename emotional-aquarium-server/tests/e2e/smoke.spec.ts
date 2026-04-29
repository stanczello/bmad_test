import { test, expect } from '@playwright/test'

test.describe('Story 1.1 - Scaffold Smoke (ATDD)', () => {
  test('[P1] health endpoint is reachable and returns correct shape', async ({ request }) => {
    const response = await request.get('/health')

    expect(response.ok()).toBe(true)
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toMatchObject({
      success: true,
      data: { status: 'ok' }
    })
  })

  test.skip('[P2] Electron renderer loads without unhandled errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')
    expect(errors).toHaveLength(0)
  })
})
