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

  test('[P2] Electron renderer loads without unhandled errors', async ({ page }) => {
    const rendererUrl =
      (globalThis as { process?: { env?: { FRONTEND_URL?: string } } }).process?.env
        ?.FRONTEND_URL || 'http://localhost:5173'
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.addInitScript(() => {
      ;(window as unknown as { api?: unknown }).api = {
        getDeviceId: async () => 'e2e-device-id',
        getUpdateStatus: async () => null,
        getReleaseChannel: async () => 'stable',
        installUpdate: async () => {},
        onUpdateStatus: () => () => {}
      }
    })

    const response = await page.goto(rendererUrl, { waitUntil: 'domcontentloaded' })
    expect(response?.ok()).toBe(true)
    await expect(page.locator('body')).toBeVisible()
    expect(errors).toHaveLength(0)
  })
})
