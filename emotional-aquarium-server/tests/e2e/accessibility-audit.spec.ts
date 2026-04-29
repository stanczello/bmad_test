import { expect, test } from '@playwright/test'

test.use({ bypassCSP: true })

test('accessibility audit - no serious or critical axe violations on landing screen', async ({ page }) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

  await page.goto(frontendUrl, { waitUntil: 'networkidle' })

  await page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'
  })

  const results = await page.evaluate(async () => {
    const axeHandle = (window as Window & {
      axe: { run: () => Promise<{ violations: Array<{ id: string; impact: string | null }> }> }
    }).axe
    return axeHandle.run()
  })

  const blockingViolations = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical'
  )

  expect(blockingViolations).toEqual([])
})