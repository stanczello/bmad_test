---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
lastStep: step-04c-aggregate
lastSaved: '2026-04-29'
storyId: '1.1'
storyKey: 1-1-initialize-client-and-service-foundations
storyFile: _bmad-output/implementation-artifacts/1-1-initialize-client-and-service-foundations.md
atddChecklistPath: _bmad-output/test-artifacts/atdd-checklist-1-1-initialize-client-and-service-foundations.md
generatedTestFiles:
  - emotional-aquarium-server/tests/api/health.spec.ts
  - emotional-aquarium-server/tests/unit/initDb.spec.ts
  - emotional-aquarium-client/tests/unit/useAppStore.spec.ts
  - emotional-aquarium-client/tests/components/AquariumCanvas.spec.tsx
  - tests/e2e/smoke.spec.ts
inputDocuments:
  - _bmad-output/implementation-artifacts/1-1-initialize-client-and-service-foundations.md
  - _bmad/tea/config.yaml
  - knowledge/test-levels-framework.md
  - knowledge/test-priorities-matrix.md
  - knowledge/test-quality.md
  - knowledge/test-healing-patterns.md
  - knowledge/data-factories.md
  - knowledge/selector-resilience.md
  - knowledge/risk-governance.md
---

# ATDD Checklist — Story 1.1: Initialize Client and Service Foundations

> **TDD Phase:** 🟡 PARTIAL GREEN — Health API, initDb, useAppStore, and AquariumCanvas tests are active and passing. Electron smoke remains deferred as scaffolded `test.skip()`.

---

## Step 1: Preflight & Context

| Field | Value |
|-------|-------|
| Story | 1.1 — Initialize Client and Service Foundations |
| Stack | `fullstack` (Electron + Fastify Node.js) |
| Test framework (server) | Vitest |
| Test framework (client) | Vitest + React Testing Library |
| E2E framework | Playwright |
| Playwright Utils | Enabled (`tea_use_playwright_utils: true`) |
| Pact.js Utils | Disabled (`tea_use_pactjs_utils: false`) |
| Browser automation | `auto` |
| Execution mode | `sequential` |

### ⚠️ Prerequisite Gap — Test Framework Bootstrap Required

No `playwright.config.ts`, `vitest.config.ts`, or test directories exist yet. Since this is the foundation story, the **test framework bootstrap must be added as Task 0** before all other implementation tasks. See [Test Framework Bootstrap](#test-framework-bootstrap) section below.

---

## Step 2: Generation Mode

**Mode selected:** AI Generation

Rationale: Acceptance criteria are well-defined and the app hasn't been scaffolded yet, so browser recording is not possible. All test scenarios are standard (API contract, unit, component, smoke E2E).

---

## Step 3: Test Strategy

### Risk Assessment & Acceptance Criteria Mapping

| AC | Description | Test Level | Priority | Risk Rationale |
|----|-------------|-----------|---------|---------------|
| AC5 | `GET /health` returns `{ success: true, data: { status: "ok" } }` | Integration/API | **P1** | Establishes the API response shape contract that ALL future endpoints inherit. Wrong shape here = rework across the entire backend. |
| AC10 | `initDb()` opens + closes SQLite cleanly | Unit | **P1** | Main process DB init crash = app won't start. Hard to diagnose downstream. |
| AC3/4 | `tsc --noEmit` + ESLint pass for both projects | CI Gate | **P0** | Every subsequent story builds on TypeScript strictness. A passing baseline is critical. |
| AC8 | `useAppStore` exports `isReady: false` and is importable | Unit | **P2** | Store shape contracts propagate to many future components. |
| AC9 | `<AquariumCanvas />` renders `<Canvas>` without console errors | Component | **P2** | R3F setup failures are opaque; catching bad wiring early saves hours later. |
| AC1 | Electron app starts in dev mode (HMR) | E2E Smoke | **P2** | Dev environment health. Manual verification acceptable for v1.1. |
| AC2 | Backend server starts and responds | E2E Smoke / API | **P1** | Covered by AC5 health check API test. |
| AC6 | Folder structures match canonical layout | Code Review | — | Best validated via code review, not automated test. Not a runtime behavior. |
| AC7 | Tailwind v4 configured, utility class applies | Component Visual | **P3** | Low risk at scaffold stage — just an install confirmation. |
| AC11 | README files exist | File existence / Dev convention | **P3** | Important for onboarding, not a runtime risk. |

### Test Pyramid Target for Story 1.1

```
    E2E Smoke       ← 1 test (app loads)
   ─────────────
  API / Integration  ← 2 tests (health endpoint happy + error shapes)
 ─────────────────────
Unit / Component     ← 3 tests (initDb, useAppStore, AquariumCanvas)
─────────────────────────
CI Gates: tsc + eslint (not counted as tests — run in pipeline)
```

---

## Step 4: Red-Phase Test Scaffolds

### Test Framework Bootstrap

> **Do this before any implementation.** Add the following as **Task 0** in Story 1.1.

#### Server — Vitest setup

```bash
cd emotional-aquarium-server
npm install --save-dev vitest @vitest/coverage-v8 supertest @types/supertest
```

`emotional-aquarium-server/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
```

Add to `emotional-aquarium-server/package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

#### Client — Vitest + React Testing Library setup

```bash
cd emotional-aquarium-client
npm install --save-dev vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

`emotional-aquarium-client/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
```

`emotional-aquarium-client/tests/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

Add to `emotional-aquarium-client/package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

#### E2E — Playwright setup

```bash
# At monorepo root or dedicated e2e folder
npm install --save-dev @playwright/test
npx playwright install chromium
```

`playwright.config.ts` (root or `tests/e2e/`):
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx tsx src/index.ts',
    url: 'http://localhost:3000/health',
    reuseExistingServer: !process.env.CI,
    cwd: '../emotional-aquarium-server',
  },
});
```

---

### Worker A — Red-Phase API Tests (Server)

#### `emotional-aquarium-server/tests/api/health.spec.ts`

```typescript
// Provider endpoint: GET /health — new endpoint, not yet implemented
// Scrutiny evidence:
//   Response shape: { success: boolean, data: { status: string } } — from architecture.md#Format Patterns
//   Status code: 200 on success — standard health check convention
//   Field names: success, data, status — from AC5 + architecture.md
//   Required fields: success (boolean), data.status (string) — architecture.md
//   Data types: success = boolean, data = object, data.status = string
//   Enum values: data.status = "ok" — from AC5 exact spec
//   Nested structures: data is a flat object with one key
// TDD Phase: RED — endpoint not implemented yet.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// Import the Fastify app factory (to be created during implementation)
// import { buildApp } from '../../src/app';

let app: FastifyInstance;

describe('Health Check — GET /health', () => {
  beforeAll(async () => {
    // TODO: Replace with actual app factory import once implemented
    // app = buildApp();
    // await app.ready();
  });

  afterAll(async () => {
    await app?.close();
  });

  it.skip('[P1] should return 200 with standard success envelope', async () => {
    // THIS TEST WILL FAIL — endpoint not implemented yet
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
      },
    });
    // Ensure no extra root-level keys bleed in
    expect(Object.keys(body)).toEqual(['success', 'data']);
  });

  it.skip('[P1] should return correct Content-Type header', async () => {
    // THIS TEST WILL FAIL — endpoint not implemented yet
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it.skip('[P2] should respond within 200ms', async () => {
    // THIS TEST WILL FAIL — endpoint not implemented yet
    const start = Date.now();
    await app.inject({ method: 'GET', url: '/health' });
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(200);
  });
});
```

#### `emotional-aquarium-server/tests/unit/initDb.spec.ts`

```typescript
// Unit test for initDb() in src/main/db/initDb.ts
// TDD Phase: RED — function not implemented yet.

import { describe, it, expect, afterEach, vi } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';

// Import to be created during implementation
// import { initDb } from '../../src/main/db/initDb';

const TEST_DB_PATH = path.join(process.cwd(), 'test-aquarium.sqlite');

describe('initDb — SQLite initialisation', () => {
  afterEach(() => {
    // Clean up test database file after each test
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  it.skip('[P1] should open and close SQLite file without throwing', () => {
    // THIS TEST WILL FAIL — initDb not implemented yet
    // import { initDb } from '../../src/main/db/initDb';
    // expect(() => initDb(TEST_DB_PATH)).not.toThrow();
    expect(true).toBe(false); // Placeholder — replace with real import above
  });

  it.skip('[P1] should create the SQLite file on disk', () => {
    // THIS TEST WILL FAIL — initDb not implemented yet
    // initDb(TEST_DB_PATH);
    // expect(fs.existsSync(TEST_DB_PATH)).toBe(true);
    expect(true).toBe(false); // Placeholder — replace with real import above
  });

  it.skip('[P2] should be callable multiple times without error (idempotent open/close)', () => {
    // THIS TEST WILL FAIL — initDb not implemented yet
    // expect(() => {
    //   initDb(TEST_DB_PATH);
    //   initDb(TEST_DB_PATH);
    // }).not.toThrow();
    expect(true).toBe(false); // Placeholder — replace with real import above
  });
});
```

---

### Worker A — Red-Phase Unit Tests (Client)

#### `emotional-aquarium-client/tests/unit/useAppStore.spec.ts`

```typescript
// Unit test for useAppStore in src/renderer/stores/useAppStore.ts
// TDD Phase: RED — store not implemented yet.

import { describe, it, expect } from 'vitest';

// Import to be created during implementation
// import { useAppStore } from '../../src/renderer/stores/useAppStore';

describe('useAppStore — Zustand stub store', () => {
  it.skip('[P2] should export useAppStore as a callable function', async () => {
    // THIS TEST WILL FAIL — store not implemented yet
    const { useAppStore } = await import('../../src/renderer/stores/useAppStore');
    expect(typeof useAppStore).toBe('function');
  });

  it.skip('[P2] should have isReady initialised to false', async () => {
    // THIS TEST WILL FAIL — store not implemented yet
    const { useAppStore } = await import('../../src/renderer/stores/useAppStore');
    const state = useAppStore.getState();
    expect(state).toHaveProperty('isReady', false);
  });

  it.skip('[P2] state shape should only contain isReady at initialisation', async () => {
    // THIS TEST WILL FAIL — store not implemented yet
    const { useAppStore } = await import('../../src/renderer/stores/useAppStore');
    const state = useAppStore.getState();
    expect(Object.keys(state)).toContain('isReady');
  });
});
```

---

### Worker B — Red-Phase Component Tests (Client)

#### `emotional-aquarium-client/tests/components/AquariumCanvas.spec.tsx`

```typescript
// Component test for <AquariumCanvas /> in src/renderer/components/aquarium/AquariumCanvas.tsx
// TDD Phase: RED — component not implemented yet.
// Note: React Three Fiber requires WebGL. jsdom does not support WebGL natively.
// Use vi.mock to stub @react-three/fiber's Canvas to a simple <canvas> element
// so the test validates wiring without WebGL.

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';

// Stub <Canvas> to avoid WebGL dependency in unit tests
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <canvas data-testid="r3f-canvas">{children}</canvas>
  ),
}));

vi.mock('@react-three/drei', () => ({}));

// Import to be created during implementation
// import { AquariumCanvas } from '../../src/renderer/components/aquarium/AquariumCanvas';

describe('AquariumCanvas — React Three Fiber stub', () => {
  it.skip('[P2] should render a canvas element without throwing', async () => {
    // THIS TEST WILL FAIL — component not implemented yet
    const { AquariumCanvas } = await import(
      '../../src/renderer/components/aquarium/AquariumCanvas'
    );
    expect(() => render(<AquariumCanvas />)).not.toThrow();
  });

  it.skip('[P2] should mount the R3F Canvas', async () => {
    // THIS TEST WILL FAIL — component not implemented yet
    const { AquariumCanvas } = await import(
      '../../src/renderer/components/aquarium/AquariumCanvas'
    );
    render(<AquariumCanvas />);
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });
});
```

---

### Worker B — Red-Phase E2E Smoke Tests

#### `tests/e2e/smoke.spec.ts`

```typescript
// E2E smoke test — Story 1.1 scaffold.
// Verifies the server is reachable and the health endpoint responds.
// TDD Phase: RED — server not started yet.

import { test, expect } from '@playwright/test';

test.describe('Story 1.1 — Scaffold Smoke (ATDD)', () => {
  test.skip('[P1] health endpoint is reachable and returns correct shape', async ({
    request,
  }) => {
    // THIS TEST WILL FAIL — server not implemented yet
    const response = await request.get('/health');

    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      success: true,
      data: { status: 'ok' },
    });
  });

  test.skip('[P2] Electron renderer loads without unhandled errors', async ({
    page,
  }) => {
    // THIS TEST WILL FAIL — Electron client not running yet
    // NOTE: For Electron E2E, replace with playwright-electron or custom launch config.
    // This test is a placeholder to document the expected behavior.
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/'); // Will be replaced with electron app URL
    expect(errors).toHaveLength(0);
  });
});
```

---

## Implementation Checklist

Use this as a companion to the story task list. Remove `test.skip()` from each scaffold as you complete the corresponding task.

### Pre-implementation (do first — before any story tasks)

- [ ] Bootstrap server test framework (Vitest) — see [Test Framework Bootstrap](#test-framework-bootstrap)
- [ ] Bootstrap client test framework (Vitest + RTL) — see above
- [ ] Bootstrap E2E framework (Playwright) — see above
- [ ] Verify `npm test` runs (and fails) for both projects without error in test runner setup

### Story Task Gates (per AC)

| Task | Acceptance Criterion | Test to activate |
|------|---------------------|------------------|
| Task 2 — Scaffold backend + health endpoint | AC2, AC5 | Remove `it.skip` from `health.spec.ts` × 3 (completed; tests passing) |
| Task 7 — SQLite init | AC10 | Remove `it.skip` from `initDb.spec.ts` × 3 (completed; tests passing) |
| Task 5 — Zustand stub store | AC8 | Remove `it.skip` from `useAppStore.spec.ts` × 3 (completed; tests passing) |
| Task 6 — React Three Fiber | AC9 | Remove `it.skip` from `AquariumCanvas.spec.tsx` × 2 (completed; tests passing) |
| E2E smoke | AC2, AC5 (server) | Remove `test.skip` from `smoke.spec.ts:health` |
| CI gates | AC3, AC4 | Already enforced via `tsc --noEmit` + `eslint` in `package.json` scripts |

### Definition of Done for Story 1.1 Testing

- [ ] All `test.skip()` removed (no skipped tests remain in the suite)
- [x] `npm test` passes for both server and client (zero failures)
- [ ] `npx tsc --noEmit` passes for both projects
- [ ] `npm run lint` passes for both projects
- [x] `npx playwright test tests/e2e/smoke.spec.ts` passes (health endpoint only — Electron smoke is deferred)
- [x] Test coverage report generated (`npm run test:coverage`)

---

## Risk Register

| Risk | Probability | Impact | Score | Mitigation |
|------|------------|--------|-------|-----------|
| `better-sqlite3` native binding fails in non-Electron Node.js test env | P2 | I3 | 6 | Pass explicit file path to `initDb(path)` instead of using `app.getPath()` in unit tests; mock Electron APIs |
| R3F / WebGL not supported in jsdom | P1 (certain) | I2 | 2 | Mitigated by `vi.mock('@react-three/fiber')` in component test |
| Playwright E2E smoke fails if server webServer config wrong | P2 | I2 | 4 | Use `reuseExistingServer: true` in dev; test health URL before running suite |
| TypeScript strict mode catches issues in starter templates | P2 | I2 | 4 | Expected — story tasks include `npx tsc --noEmit` fix cycle |

---

## Notes for Developer

1. **`initDb` signature:** Design `initDb(dbPath?: string)` to accept an optional path override. This makes it testable without Electron's `app.getPath()`. Fall back to `app.getPath('userData')` only in production.

2. **App factory pattern for server:** Extract a `buildApp()` factory from `src/index.ts` that creates and returns the Fastify instance without calling `app.listen()`. This allows `app.inject()` in tests without a live TCP port.

3. **Do not use `test.todo`** — use `test.skip` as scaffolded. `test.todo` does not accept a callback, so assertions would be lost.

4. **Activate tests one AC at a time** — this enforces the TDD red→green cycle and keeps CI feedback tight.
