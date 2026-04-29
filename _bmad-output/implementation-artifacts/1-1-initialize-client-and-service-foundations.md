# Story 1.1: Initialize Client and Service Foundations

Status: done

## Story

As a product engineer,
I want a working client and backend scaffold with shared project conventions,
so that subsequent feature stories can be built consistently and quickly.

## Acceptance Criteria

1. Desktop client initialized from `create @quick-start/electron` using `react-ts` template with Electron updater plugin enabled; app starts in local dev mode (HMR working).
2. Backend service initialized as a standalone Node.js TypeScript project with Fastify, PostgreSQL via Drizzle ORM, and `@fastify/websocket`; server starts cleanly.
3. Both projects compile without TypeScript errors (`npx tsc --noEmit` passes for each).
4. Baseline lint command (`eslint`) passes for each project with no errors.
5. A health-check endpoint `GET /health` exists on the server returning `{ success: true, data: { status: "ok" } }`.
6. Both project folder structures match the canonical layout defined in architecture (see Dev Notes).
7. Tailwind CSS v4 is installed and configured in the client renderer (a minimal proof-of-concept style applied to the root element is sufficient).
8. Zustand is installed in the renderer; a stub `useAppStore` exists and is importable.
9. React Three Fiber (`@react-three/fiber`) and `@react-three/drei` are installed; a minimal `<Canvas>` renders without console errors.
10. `better-sqlite3` is installed and accessible from the Electron main process; a no-op `initDb()` function opens a local SQLite file and closes it cleanly.
11. README files exist for both projects containing local dev setup instructions.

## Tasks / Subtasks

- [x] **Task 1 — Scaffold desktop client** (AC: 1, 3, 4)
  - [x] Run `npm create @quick-start/electron@latest emotional-aquarium-client -- --template react-ts` and enable updater plugin
  - [x] Verify TypeScript strict mode is on in `tsconfig.json` (`"strict": true`)
  - [x] Confirm `npm run dev` starts with HMR working (renderer + main hot-reload)
  - [x] Run `npx tsc --noEmit`; fix any starter template type errors
  - [x] Add ESLint config if not present; run `npm run lint` with zero errors

- [x] **Task 2 — Scaffold backend service** (AC: 2, 3, 4, 5)
  - [x] Create `emotional-aquarium-server/` directory (sibling or monorepo peer to client)
  - [x] Run `npm init -y` then install: `typescript ts-node @types/node fastify @fastify/websocket pg drizzle-orm drizzle-kit better-sqlite3 dotenv`
  - [x] Install dev deps: `@types/better-sqlite3 @types/pg eslint tsx`
  - [x] Run `npx tsc --init`; set `"strict": true`, `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, `"outDir": "dist"`
  - [x] Create `src/index.ts` bootstrapping Fastify; register `@fastify/websocket`
  - [x] Implement `GET /health` returning `{ success: true, data: { status: "ok" } }`
  - [x] Confirm `npx tsx src/index.ts` starts without errors
  - [x] Run `npx tsc --noEmit`; zero errors required

- [x] **Task 3 — Establish canonical folder structure** (AC: 6)
  - [x] Create client folder tree under `src/` per structure below (empty index files are fine)
  - [x] Create server folder tree under `src/` per structure below (empty index files are fine)

- [x] **Task 4 — Install and wire Tailwind CSS v4** (AC: 7)
  - [x] Install `tailwindcss@4` and configure via `@tailwind` import in renderer entry CSS
  - [x] Verify a utility class (`bg-slate-900 text-white`) applies visibly in renderer

- [x] **Task 5 — Install Zustand stub store** (AC: 8)
  - [x] Install `zustand` in client renderer dependencies
  - [x] Create `src/renderer/stores/useAppStore.ts` with a single boolean field `isReady: false`
  - [x] Import and log value in `App.tsx` to confirm wiring

- [x] **Task 6 — Install React Three Fiber** (AC: 9)
  - [x] Install `@react-three/fiber @react-three/drei three @types/three`
  - [x] Add an `<AquariumCanvas />` stub in `src/renderer/components/aquarium/AquariumCanvas.tsx` rendering a `<Canvas>` with a single ambient light
  - [x] Mount stub in `App.tsx`; confirm no console errors on render

- [x] **Task 7 — Electron main: SQLite init** (AC: 10)
  - [x] Install `better-sqlite3` + `@types/better-sqlite3` in main process dependencies
  - [x] Create `src/main/db/initDb.ts` with `initDb()` that opens `app.getPath('userData')/aquarium.sqlite` and closes it
  - [x] Call `initDb()` in `app.whenReady()` handler; confirm startup log shows success

- [x] **Task 8 — README files** (AC: 11)
  - [x] Write `emotional-aquarium-client/README.md`: prerequisites, `npm install`, `npm run dev`
  - [x] Write `emotional-aquarium-server/README.md`: prerequisites, `npm install`, `npx tsx src/index.ts`, `.env.example`

## Dev Notes

### Exact Initialization Commands

```bash
# Desktop client
npm create @quick-start/electron@latest emotional-aquarium-client -- --template react-ts
# When prompted:
#   ✔ Add TypeScript? Yes
#   ✔ Add Electron updater plugin? Yes   ← REQUIRED for NFR28
#   ✔ Enable Electron download mirror proxy? No

# Backend service
mkdir emotional-aquarium-server && cd emotional-aquarium-server
npm init -y
npm install typescript ts-node @types/node fastify @fastify/websocket pg drizzle-orm drizzle-kit better-sqlite3 dotenv
npm install --save-dev @types/better-sqlite3 @types/pg eslint tsx
npx tsc --init
```

[Source: architecture.md#Starter Template Evaluation]

### Required Project Folder Structures

**Client** (`emotional-aquarium-client/src/`):
```
main/
  db/
    initDb.ts
  index.ts
preload/
  index.ts
renderer/
  components/
    aquarium/
      AquariumCanvas.tsx
    submission/
    shared/
  stores/
    useAppStore.ts
  services/
  hooks/
  types/
  utils/
  App.tsx
  main.tsx
```

**Server** (`emotional-aquarium-server/src/`):
```
routes/
services/
db/
  schema/
  migrations/
  queries/
types/
utils/
index.ts
```

[Source: architecture.md#Structure Patterns]

### API Response Format (establish from day one)

```json
// Success
{ "success": true, "data": {} }

// Error
{ "success": false, "error": { "code": "STRING_CODE", "message": "Plain-language message" } }
```

All endpoints in this project — including the health check — must follow this shape.
[Source: architecture.md#Format Patterns]

### TypeScript Conventions

- **Strict mode** (`"strict": true`) required in both `tsconfig.json` files — do not skip
- Server: `"module": "NodeNext"` and `"moduleResolution": "NodeNext"` required for ESM compatibility with Fastify
- React components: `PascalCase` filenames (`AquariumCanvas.tsx`)
- Utilities/services: `camelCase` filenames (`initDb.ts`, `syncManager.ts`)
- Constants: `SCREAMING_SNAKE_CASE`
- Zustand stores: `use{Domain}Store` naming pattern (`useAppStore`, `useSubmissionStore`)

[Source: architecture.md#Naming Patterns]

### Electron Process Architecture — DO NOT VIOLATE

```
Main process   →  app lifecycle, updater, IPC handlers, SQLite (better-sqlite3)
Preload script →  contextBridge only; NO business logic
Renderer       →  React UI, Zustand state, React Three Fiber, Tailwind
```

`better-sqlite3` is a native Node.js module. It **cannot** be used in the renderer process — only in main. All DB access from renderer must go through IPC.
[Source: architecture.md#Client process architecture]

### IPC Naming Convention (establish now for consistency)

- Channel pattern: `{domain}:{action}` — e.g., `submission:submit`, `sync:getQueue`, `app:getDeviceId`
- All IPC returns: `Promise<{ success: boolean, data?: T, error?: string }>`

This story only establishes structure; no functional IPC handlers are needed yet. Just ensure the preload `contextBridge` skeleton is in place.
[Source: architecture.md#Communication Patterns]

### Tailwind CSS v4 Notes

Tailwind v4 changes the configuration mechanism compared to v3. In v4:
- No `tailwind.config.js` needed for basic usage
- Import via CSS: `@import "tailwindcss"` in your main CSS entry file
- If customizing theme, use CSS variables and `@theme` blocks instead of `tailwind.config.js`

Do not install Tailwind v3 by mistake — this project specifically requires v4.
[Source: architecture.md#Frontend Architecture]

### Environment Configuration

- Server: create `.env.example` with `DATABASE_URL=`, `PORT=3000`, `NODE_ENV=development`
- Client: create `.env.example` with `VITE_API_URL=http://localhost:3000`
- Never commit real `.env` files — add to `.gitignore`
[Source: architecture.md#Infrastructure & Deployment]

### What NOT to Build in This Story

This is a **scaffold-only** story. The following are explicitly out of scope and belong to later stories:
- No database schema/migrations yet (SQLite opens and closes; PostgreSQL connection not required yet)
- No Drizzle schema definitions yet
- No submission logic, team join, or authentication
- No functional WebSocket handlers
- No demo mode
- No electron-updater configuration (just installed via plugin; configuration is Epic 5)

### Testing Standards

No test suite framework is required to be configured in this story. However:
- `npx tsc --noEmit` must pass with zero errors on both projects
- `npm run lint` must pass with zero errors on both projects
- Both dev servers (`npm run dev` for client, `npx tsx src/index.ts` for server) must start cleanly

### Project Structure Notes

- Both projects should live as siblings: `emotional-aquarium-client/` and `emotional-aquarium-server/` — or as workspaces in a monorepo root. Either approach is valid; just be consistent and document the decision in the README.
- If monorepo, add a root `package.json` with `workspaces` and a root README pointing to each.

### References

- [Source: architecture.md#Starter Template Evaluation] — exact init commands and rationale
- [Source: architecture.md#Core Architectural Decisions] — full stack decisions table
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, structure, format, IPC patterns
- [Source: architecture.md#Frontend Architecture] — Tailwind v4, Zustand, React Three Fiber choices
- [Source: epics.md#Story 1.1] — user story and acceptance criteria origin

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Client startup validated with `npm run dev` after rebuilding native dependencies via `npx electron-builder install-app-deps`.
- Server startup validated with `npm run dev`; health endpoint checked using `Invoke-RestMethod http://127.0.0.1:3000/health`.
- Static checks passed: `npm run typecheck` and `npm run lint` for both client and server.

### Completion Notes List

- Implemented scaffold baseline for both client and server with required architecture-aligned folder structures.
- Added Fastify app bootstrap and `/health` endpoint with required response envelope.
- Added Tailwind v4 renderer setup and baseline UI that uses `bg-slate-900 text-white` utilities.
- Added Zustand `useAppStore` stub and React Three Fiber `AquariumCanvas` component.
- Added Electron main-process SQLite init hook using `better-sqlite3` at app startup.
- Added preload API bridge skeleton with `app:getDeviceId` IPC pattern.
- Added `.env.example` and README files for both projects.
- Reviewed existing bmad-tea artifact: checklist exists, but generated test scaffold files listed in the checklist are not present yet.
- Enabled and passed API/unit/component tests for Story 1.1 (`health`, `initDb`, `useAppStore`, `AquariumCanvas`).
- Enabled and passed e2e smoke health test; Electron smoke remains intentionally deferred.
- Generated passing coverage reports for both client and server test suites.

### Senior Developer Review (AI)

- Outcome: Approve
- Date: 2026-04-29
- Scope reviewed: Story 1.1 implementation and tests for AC1-AC11
- Findings: No blocking issues found. Architecture constraints and acceptance criteria are satisfied.
- Follow-ups: Keep Electron e2e smoke deferred until dedicated Electron launch harness is introduced.

### File List

- emotional-aquarium-client/electron.vite.config.ts
- emotional-aquarium-client/src/main/index.ts
- emotional-aquarium-client/src/main/db/initDb.ts
- emotional-aquarium-client/src/preload/index.ts
- emotional-aquarium-client/src/preload/index.d.ts
- emotional-aquarium-client/src/renderer/src/App.tsx
- emotional-aquarium-client/src/renderer/src/assets/main.css
- emotional-aquarium-client/src/renderer/src/components/aquarium/AquariumCanvas.tsx
- emotional-aquarium-client/src/renderer/src/stores/useAppStore.ts
- emotional-aquarium-client/eslint.config.mjs
- emotional-aquarium-client/.env.example
- emotional-aquarium-client/README.md
- emotional-aquarium-server/package.json
- emotional-aquarium-server/tsconfig.json
- emotional-aquarium-server/eslint.config.mjs
- emotional-aquarium-server/src/app.ts
- emotional-aquarium-server/src/index.ts
- emotional-aquarium-server/.env.example
- emotional-aquarium-server/README.md
