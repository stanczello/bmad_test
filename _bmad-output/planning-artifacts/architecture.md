---
stepsCompleted:
  - step-01-init.md
  - step-02-context.md
  - step-03-starter.md
  - step-04-decisions.md
  - step-05-patterns.md
  - step-06-structure.md
  - step-07-validation.md
  - step-08-complete.md
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/product-brief-bmad_test.md"
workflowType: 'architecture'
lastStep: 8
status: 'complete'
project_name: 'bmad_test'
user_name: 'astan'
date: '2026-04-28'
completedAt: '2026-04-28'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:** 57 FRs across 7 capability areas:
- **Affirmation Submission (FR1–FR8):** Single-selection from curated positive vocabulary, one submission per cycle, update-before-final-confirm, cycle-boundary enforcement, duplicate prevention.
- **Aquarium Experience (FR9–FR16):** Real-time shared 3D display of team shapes, noon reset, passive viewing, demo mode for rollout champions.
- **Identity, Privacy & Safety (FR17–FR23):** Full anonymization in display, positive-only restriction, no manager surveillance views, no notifications.
- **Team Context & Rollout (FR24–FR30):** Team-scoped data isolation, staged internal rollout, minimal onboarding, demo validation.
- **Offline & Sync (FR31–FR37):** Offline submission queue, automatic sync on connectivity restore, cycle-rule reconciliation for late arrivals.
- **Cross-Platform Desktop (FR38–FR44):** macOS + Windows MVP, consistent behavior, silent background auto-update with rollback.
- **Cycle Rules (FR45–FR50):** Morning/afternoon windows, server-authoritative noon reset, consistency across offline-returning clients.
- **Self-Serve Support (FR51–FR57):** Clear submission states, plain-language cues, self-explanatory interaction throughout.

**Non-Functional Requirements:** 32 NFRs across 6 areas:
- **Performance:** 1s submission feedback, 2s app load, 5s real-time propagation, smooth 3D animation under mid-tier hardware load.
- **Reliability:** Submission durability after confirmation, offline persistence through restart, automatic sync retry, deterministic cycle state across clients.
- **Security & Privacy:** TLS in transit, encryption at rest, no PII in display payloads, team-scoped access control, minimal data retention, audit trail for admin actions.
- **Scalability:** Single pilot team → multi-team without redesign; staged rollout support; data model compatible with future web companion.
- **Accessibility:** Keyboard navigation, sufficient contrast, shape labels not color-only, plain-language state messages, reduced-motion support.
- **Integration & Operations:** Silent background updates, health/operational signals for sync diagnostics, server-authoritative timezone/reset handling, demo mode isolated from live data, lightweight repeatable team initialization.

**Scale & Complexity:**
- Primary domain: Cross-platform desktop app + backend service
- Complexity level: Low-Medium (small team scale, but real-time + offline + 3D adds meaningful architecture surface)
- Estimated architectural components: ~6 (desktop client, real-time push layer, REST/sync API, submission data store, cycle engine, demo mode subsystem)

### Technical Constraints & Dependencies

- macOS + Windows MVP; web companion is explicitly post-MVP
- Lightweight independent runtime — no heavy framework dependency on user machines
- Silent auto-update required with rollback safety
- No 3rd-party integrations in MVP scope
- No notifications or reminders (by product design)
- Positive-only vocabulary is a fixed curated list (no free text input)

### Cross-Cutting Concerns Identified

1. **Sync & state management** — offline queue, pending/synced/reset states visible throughout the client UI
2. **Temporal authority** — server is the definitive source of truth for cycle boundaries; clients reconcile on reconnect
3. **Anonymization layer** — submissions stored with identity server-side, displayed without any identity client-side
4. **Demo mode flag** — a runtime context toggle that affects data routing, display behavior, and isolation throughout the system
5. **Silent update lifecycle** — background check, staged download, apply, rollback on failure, cross-platform packaging

## Starter Template Evaluation

### Primary Technology Domain

Cross-platform desktop app (Electron + TypeScript + React) with a companion Node.js backend service (TypeScript + PostgreSQL).

### Starter Options Considered

| Candidate | Notes |
|---|---|
| `create @quick-start/electron` (electron-vite) | ✅ Official, actively maintained, React-TS preset, Vite v8, HMR, isolated build |
| `electron-react-boilerplate` | Heavier, webpack-based, less actively updated |
| `electron-forge` | More setup required for TypeScript+React+Vite combination |

### Selected Starter: `create @quick-start/electron` (react-ts template)

**Rationale:** Only production-grade Electron+React+TypeScript scaffold with Vite v8 HMR, isolated build architecture, and a first-class `electron-updater` plugin option. Directly satisfies NFR28 (silent auto-update).

**Initialization Commands:**

```bash
# Desktop client
npm create @quick-start/electron@latest emotional-aquarium-client -- --template react-ts
# ✔ Add TypeScript? Yes
# ✔ Add Electron updater plugin? Yes   ← required for NFR28
# ✔ Enable Electron download mirror proxy? No

# Backend service (separate workspace)
mkdir emotional-aquarium-server && cd emotional-aquarium-server
npm init -y
npm install typescript ts-node @types/node fastify @fastify/websocket pg drizzle-orm
npx tsc --init
```

**Architectural Decisions Provided by Starter:**

| Area | Decision |
|---|---|
| Language | TypeScript (strict mode) |
| Build tooling | Vite v8 + electron-vite v6 |
| Process architecture | Main (Node.js), Preload (bridge), Renderer (React) — isolated contexts |
| HMR | Full HMR for renderer; hot reload for main/preload |
| Packaging / distribution | electron-builder via updater plugin |
| Desktop auto-update | `electron-updater` included ← satisfies NFR28 |

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data store (client + server), real-time transport, cycle authority, team identity model, anonymization strategy

**Important Decisions (Shape Architecture):**
- 3D renderer, state management, styling, update distribution

**Deferred Decisions (Post-MVP):**
- SSO/OAuth, web companion API contract, advanced analytics, on-prem hosting option

---

### Data Architecture

| Decision | Choice | Version | Rationale |
|---|---|---|---|
| Server ORM | **Drizzle ORM** | latest stable | TypeScript-native, schema-as-code, no runtime bloat, excellent PostgreSQL support |
| Server database | **PostgreSQL** | latest stable on Railway | Relational model suits team-scoped data, audit trail (NFR18), future multi-team growth (NFR19–NFR21) |
| Client offline store | **SQLite via `better-sqlite3`** | latest stable | Embedded, zero-config, survives app restart (NFR8), transactional durability for submission queue (NFR7) |

**Data model notes:**
- Submissions stored server-side with anonymous device ID (for dedup only — never in display payloads, NFR15)
- Aquarium display payload contains only: shape type, affirmation label, cycle ID — no user identity
- Team scope enforced at query layer; cross-team data access structurally impossible (NFR16)
- Minimal data retention: only current and previous cycle submissions retained in active store (NFR17)

---

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| Team onboarding identity | **Team join token** (pre-shared per team, distributed by rollout owner) | Zero login friction (FR28), fits internal rollout model (FR24), lightweight repeatable setup (NFR32) |
| Per-user dedup identity | **Anonymous device ID** — generated on first install, stored in SQLite, sent with every submission | Never shown in UI; server uses only for cycle dedup (FR7) and offline sync reconciliation (FR34). Satisfies anonymity requirement (FR17–FR18) |
| Transport security | **TLS for all client↔server communication** | NFR13 — mandatory |
| Data at rest | **PostgreSQL encryption at rest** (Railway managed) | NFR14 |
| Display payload anonymization | Enforced at API response layer — device ID stripped before payload leaves server | NFR15 |
| Admin auditability | Structured server-side log for team scope changes and cycle reset events | NFR18 |

---

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| Submission API | **REST — `POST /submissions`** | Stateless, offline-safe (queue locally, replay on reconnect), simple cycle-boundary validation |
| Aquarium initial load | **REST — `GET /aquarium`** | Fetch current cycle shapes on app open/reconnect |
| Real-time shape propagation | **WebSocket — `WS /aquarium/stream`** | Push new shapes to all connected clients within ≤5s (NFR3); `@fastify/websocket` |
| Cycle reset notification | **WebSocket push** from server on noon reset event | All connected clients receive reset signal; offline clients reconcile on reconnect via `GET /aquarium` |
| Cycle authority | **Server-side scheduled job** (configurable team timezone, NFR30) — server owns the clock (NFR10) | Deterministic, consistent across all clients regardless of local clock drift or offline status |
| Demo mode isolation | Demo requests routed to an isolated in-memory data context on server; never touches the live PostgreSQL submission store (NFR31) | |
| Error handling | Typed error responses; client surfaces plain-language state messages (FR55, NFR26) | |
| API framework | **Fastify** (TypeScript, async-first, native WebSocket plugin) | Faster than Express, better TypeScript support, lighter than NestJS |

---

### Frontend Architecture

| Decision | Choice | Version | Rationale |
|---|---|---|---|
| 3D renderer | **React Three Fiber (`@react-three/fiber`) + `@react-three/drei`** | latest stable | React-native Three.js wrapper; `drei` provides ready-made helpers for ambient animation; smooth performance on mid-tier hardware (NFR4) |
| State management | **Zustand** | latest stable | Lightweight, TypeScript-native, no boilerplate; manages submission state, offline queue, aquarium shapes, cycle state, demo mode flag cleanly |
| Styling | **Tailwind CSS v4** | v4 | Utility-first, custom retro-aesthetic palette theming; reduced-motion utilities built-in (NFR27); good keyboard/accessibility support |
| Routing | Single-window Electron app — **no router needed**; views managed via Zustand state | Appropriate for screensaver-style ambient app |
| Accessibility | `aria-label` on all interactive controls, keyboard nav for submission flow (NFR23–NFR26); reduced-motion CSS via `prefers-reduced-motion` + Tailwind motion utilities (NFR27) | |

**Client process architecture (electron-vite):**
- **Main process** — app lifecycle, update manager (`electron-updater`), IPC handlers, SQLite access via `better-sqlite3`
- **Preload script** — typed IPC bridge (contextBridge) — no direct Node.js access from renderer
- **Renderer process** — React UI, Zustand state, React Three Fiber aquarium, Tailwind styles

---

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Backend hosting | **Railway** | One-click PostgreSQL, straightforward Node.js deploys, affordable for internal tool scale |
| Desktop update distribution | **GitHub Releases** | Zero extra infrastructure; `electron-updater` native support; free for internal tool; staged rollout via release channels (NFR28, FR44) |
| Update strategy | **Silent background check** on app start + periodic; auto-download, apply on next restart; rollback on failure (NFR11, FR42–FR43) | |
| Environment config | `.env` per environment (dev/staging/prod); team token and API endpoint configured at install time (NFR32) | |
| Observability | Fastify structured logging + Railway log drain; health endpoint for sync/reset anomaly diagnostics (NFR29) | |

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffolding (electron-vite react-ts + Fastify server + Drizzle + PostgreSQL)
2. SQLite offline store + submission queue on client
3. REST submission API + cycle engine (server-authoritative noon reset)
4. WebSocket real-time feed
5. React Three Fiber aquarium renderer (shapes + animation)
6. Zustand state wiring (submission flow, cycle state, offline queue status)
7. Team join token onboarding + anonymous device ID
8. Demo mode subsystem (isolated data context)
9. electron-updater integration + GitHub Releases pipeline
10. Tailwind retro theme + accessibility pass

**Cross-Component Dependencies:**
- Cycle engine (server) drives both WebSocket push events AND offline sync reconciliation — must be implemented before either client feature
- Anonymous device ID must exist before submission dedup logic can be implemented
- Demo mode flag threads through Zustand state, API routing, and server isolation layer — design the seam early
- SQLite offline queue must respect cycle boundaries — reconciliation logic shared with server-side dedup

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
14 areas where AI agents could make different choices across naming, structure, formats, communication, and process handling.

### Naming Patterns

**Database Naming Conventions:**
- Tables use plural `snake_case`: `submissions`, `teams`, `device_registrations`, `affirmation_types`
- Columns use `snake_case`: `device_id`, `team_id`, `submitted_at`, `cycle_id`
- Foreign keys use `{table_singular}_id`: `team_id`, `device_id`
- Standard timestamps on all tables: `created_at`, `updated_at`
- Enum columns use `snake_case`; cycle phase values are `morning`, `afternoon`

**API Naming Conventions:**
- REST resources use plural `snake_case`: `/submissions`, `/teams`, `/aquarium`
- Path params use `:id`, `:team_id`, `:cycle_id`
- Query params use `snake_case`: `?cycle_id=`, `?team_id=`
- WebSocket event names use `snake_case`: `shape_added`, `cycle_reset`, `sync_ack`

**Code Naming Conventions:**
- React component files use `PascalCase`: `AquariumView.tsx`, `SubmissionPanel.tsx`
- Utilities, services, and helpers use `camelCase`: `syncManager.ts`, `cycleEngine.ts`
- Components and types use `PascalCase`
- Functions and variables use `camelCase`
- Constants use `SCREAMING_SNAKE_CASE`: `MAX_SHAPES_PER_CYCLE`, `NOON_RESET_HOUR`
- Zustand stores use `use{Domain}Store`: `useSubmissionStore`, `useAquariumStore`, `useCycleStore`

### Structure Patterns

**Project Organization:**

Client structure:

```text
src/
  main/
  preload/
  renderer/
    components/
      aquarium/
      submission/
      shared/
    stores/
    services/
    hooks/
    types/
    utils/
```

Server structure:

```text
src/
  routes/
  services/
  db/
    schema/
    migrations/
    queries/
  types/
  utils/
```

- Tests are co-located as `*.test.ts` files beside source files
- Cross-cutting integration tests live in top-level `tests/`
- Business logic belongs in `services/`; route handlers stay thin
- Raw SQL is allowed only in `src/db/queries/`

**File Structure Patterns:**
- Electron main process owns app lifecycle, updater integration, IPC handlers, and SQLite access
- Preload owns typed `contextBridge` exposure only; no business logic in preload
- Renderer owns React UI, Zustand state, React Three Fiber rendering, and presentation logic
- Environment configuration uses `.env` files per environment

### Format Patterns

**API Response Formats:**

Success responses:

```json
{ "success": true, "data": {} }
```

Error responses:

```json
{ "success": false, "error": { "code": "STRING_CODE", "message": "Plain-language message" } }
```

**Data Exchange Formats:**
- WebSocket messages use `{ event, payload, timestamp }`
- All dates/times in APIs use ISO 8601 strings
- API payload fields use `camelCase`
- Database columns remain `snake_case`; mapping happens at the server boundary
- Aquarium payloads include only anonymized display fields: `shapeType`, `affirmationLabel`, `cycleId`

### Communication Patterns

**Event System Patterns:**
- IPC channel naming uses `{domain}:{action}`: `submission:submit`, `sync:getQueue`, `app:getDeviceId`
- All IPC returns `Promise<{ success: boolean, data?: T, error?: string }>`
- WebSocket server events are `shape_added`, `cycle_reset`, and `sync_ack`
- Demo mode requests carry `X-Demo-Mode: true` and route to isolated non-live data paths

**State Management Patterns:**
- Zustand state updates are immutable via `set((state) => ({ ... }))`
- Async state flags use explicit names: `isLoading`, `isSubmitting`, `isSyncing`
- Queue state lifecycle is fixed: `pending -> syncing -> synced | expired`
- View state is feature-scoped; no single global app-loading store

### Process Patterns

**Error Handling Patterns:**
- Server never leaks stack traces to clients
- Client-facing messages come from centralized error constants, not raw exception strings
- Dedup, expired-cycle, and sync-failure conditions use typed error codes
- Logging is structured and operational; UI messaging stays plain-language

**Loading State Patterns:**
- Initial aquarium load may show a local loading placeholder
- Subsequent shape updates stream incrementally without full-screen reload spinners
- Submission actions show local progress and pending-sync state until `sync_ack` or failure
- Offline retry uses exponential backoff and automatic reconnect handling

### Enforcement Guidelines

**All AI Agents MUST:**
- Use `snake_case` for database artifacts, `camelCase` for API and TypeScript fields, and `PascalCase` for components/types
- Use the standard REST response envelope for every HTTP endpoint
- Route all renderer-to-Node access through typed preload APIs only
- Use ISO 8601 strings for all transmitted dates/times
- Keep SQL out of route handlers and business logic out of preload
- Preserve anonymization by excluding device IDs and personal identifiers from aquarium payloads
- Treat server time as authoritative for cycle boundaries and resets

**Pattern Enforcement:**
- Validate naming and format rules in code review for every story
- Reject new endpoints or IPC handlers that do not match the documented envelope conventions
- Treat deviations from queue lifecycle or demo-mode isolation as architecture violations
- Update this architecture document before adopting a new cross-cutting pattern

### Pattern Examples

**Good Examples:**
- `POST /submissions` returns `{ success: true, data: { submissionId, state } }`
- `shape_added` payload includes `{ shapeType, affirmationLabel, cycleId }`
- `useSubmissionStore` manages `isSubmitting`, `pendingQueue`, and typed actions together

**Anti-Patterns:**
- Returning raw arrays or ad hoc error objects from REST endpoints
- Querying PostgreSQL directly inside Fastify route files
- Using client-local time to determine whether a cycle is active
- Sending device IDs to the renderer aquarium display model

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
emotional-aquarium/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── .gitignore
├── .editorconfig
├── .env.example
├── docs/
│   ├── architecture/
│   ├── api/
│   └── operations/
├── .github/
│   └── workflows/
│       ├── client-ci.yml
│       ├── server-ci.yml
│       └── release-desktop.yml
├── apps/
│   ├── desktop/
│   │   ├── package.json
│   │   ├── electron.vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── electron-builder.yml
│   │   ├── .env.example
│   │   ├── resources/
│   │   │   ├── icons/
│   │   │   └── demo-shapes/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── index.ts
│   │   │   │   ├── appWindow.ts
│   │   │   │   ├── ipc/
│   │   │   │   │   ├── submissionIpc.ts
│   │   │   │   │   ├── syncIpc.ts
│   │   │   │   │   └── appIpc.ts
│   │   │   │   ├── db/
│   │   │   │   │   ├── sqlite.ts
│   │   │   │   │   ├── queueRepository.ts
│   │   │   │   │   └── migrations/
│   │   │   │   ├── updates/
│   │   │   │   │   └── updater.ts
│   │   │   │   └── config/
│   │   │   │       └── env.ts
│   │   │   ├── preload/
│   │   │   │   ├── index.ts
│   │   │   │   └── api.ts
│   │   │   ├── renderer/
│   │   │   │   ├── index.html
│   │   │   │   ├── main.tsx
│   │   │   │   ├── app/
│   │   │   │   │   ├── App.tsx
│   │   │   │   │   ├── providers/
│   │   │   │   │   └── layout/
│   │   │   │   ├── components/
│   │   │   │   │   ├── aquarium/
│   │   │   │   │   │   ├── AquariumView.tsx
│   │   │   │   │   │   ├── ShapeField.tsx
│   │   │   │   │   │   ├── ShapeMesh.tsx
│   │   │   │   │   │   └── DemoAquariumView.tsx
│   │   │   │   │   ├── submission/
│   │   │   │   │   │   ├── SubmissionPanel.tsx
│   │   │   │   │   │   ├── AffirmationPicker.tsx
│   │   │   │   │   │   ├── SubmissionStatus.tsx
│   │   │   │   │   │   └── CycleBanner.tsx
│   │   │   │   │   └── shared/
│   │   │   │   │       ├── Button.tsx
│   │   │   │   │       ├── EmptyState.tsx
│   │   │   │   │       └── StatusMessage.tsx
│   │   │   │   ├── stores/
│   │   │   │   │   ├── useSubmissionStore.ts
│   │   │   │   │   ├── useAquariumStore.ts
│   │   │   │   │   ├── useCycleStore.ts
│   │   │   │   │   └── useDemoStore.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── apiClient.ts
│   │   │   │   │   ├── websocketClient.ts
│   │   │   │   │   ├── syncManager.ts
│   │   │   │   │   └── deviceIdentity.ts
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useAquariumStream.ts
│   │   │   │   │   ├── useReducedMotion.ts
│   │   │   │   │   └── useSubmissionFlow.ts
│   │   │   │   ├── types/
│   │   │   │   │   ├── aquarium.ts
│   │   │   │   │   ├── submission.ts
│   │   │   │   │   ├── cycle.ts
│   │   │   │   │   └── ipc.ts
│   │   │   │   ├── utils/
│   │   │   │   │   ├── errorMessages.ts
│   │   │   │   │   ├── cycleFormatting.ts
│   │   │   │   │   └── affirmationCatalog.ts
│   │   │   │   └── styles/
│   │   │   │       ├── globals.css
│   │   │   │       └── theme.css
│   │   │   └── tests/
│   │   │       ├── integration/
│   │   │       └── e2e/
│   └── server/
│       ├── package.json
│       ├── tsconfig.json
│       ├── drizzle.config.ts
│       ├── .env.example
│       ├── src/
│       │   ├── index.ts
│       │   ├── app.ts
│       │   ├── config/
│       │   │   ├── env.ts
│       │   │   └── teams.ts
│       │   ├── routes/
│       │   │   ├── submissions.ts
│       │   │   ├── aquarium.ts
│       │   │   ├── health.ts
│       │   │   └── demo.ts
│       │   ├── services/
│       │   │   ├── submissionService.ts
│       │   │   ├── aquariumService.ts
│       │   │   ├── cycleEngine.ts
│       │   │   ├── websocketHub.ts
│       │   │   ├── demoModeService.ts
│       │   │   └── teamProvisioningService.ts
│       │   ├── db/
│       │   │   ├── client.ts
│       │   │   ├── schema/
│       │   │   │   ├── teams.ts
│       │   │   │   ├── devices.ts
│       │   │   │   ├── submissions.ts
│       │   │   │   ├── cycles.ts
│       │   │   │   └── auditLogs.ts
│       │   │   ├── queries/
│       │   │   │   ├── submissionQueries.ts
│       │   │   │   ├── aquariumQueries.ts
│       │   │   │   ├── cycleQueries.ts
│       │   │   │   └── teamQueries.ts
│       │   │   └── migrations/
│       │   ├── websocket/
│       │   │   ├── aquariumGateway.ts
│       │   │   └── eventTypes.ts
│       │   ├── types/
│       │   │   ├── api.ts
│       │   │   ├── domain.ts
│       │   │   └── websocket.ts
│       │   └── utils/
│       │       ├── errors.ts
│       │       ├── logger.ts
│       │       └── time.ts
│       └── tests/
│           ├── integration/
│           └── e2e/
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── contracts/
│   │       │   ├── api.ts
│   │       │   ├── websocket.ts
│   │       │   └── affirmations.ts
│   │       ├── constants/
│   │       │   ├── cycles.ts
│   │       │   └── demoMode.ts
│   │       └── types/
│   │           ├── submission.ts
│   │           └── aquarium.ts
│   └── config/
│       ├── eslint/
│       ├── typescript/
│       └── prettier/
└── tests/
  ├── fixtures/
  ├── contract/
  └── smoke/
```

### Architectural Boundaries

**API Boundaries:**
- `apps/server/src/routes/submissions.ts` owns submission write APIs and dedup validation entry
- `apps/server/src/routes/aquarium.ts` owns read models for current aquarium and cycle state
- `apps/server/src/routes/demo.ts` owns demo-only endpoints and must never hit live query paths
- `apps/server/src/routes/health.ts` exposes operational signals for sync/reset diagnostics

**Component Boundaries:**
- `renderer/components/submission/` owns all user input and feedback for the one-per-cycle ritual
- `renderer/components/aquarium/` owns passive display and real-time rendering only
- `renderer/stores/` is the only client state authority; components do not talk to WebSocket or SQLite directly
- `renderer/services/` owns transport and synchronization adapters

**Service Boundaries:**
- `submissionService.ts` validates team token, device identity, cycle eligibility, and persistence rules
- `cycleEngine.ts` is the only authority for cycle transitions and noon reset scheduling
- `websocketHub.ts` broadcasts canonical server events and does not read database state directly
- `demoModeService.ts` isolates simulated aquarium state from live team data

**Data Boundaries:**
- PostgreSQL is the source of truth for server state
- SQLite in `apps/desktop/src/main/db/` is client-local only for queue persistence and device identity
- Shared API/WebSocket contracts live in `packages/shared/src/contracts/`
- Raw SQL is confined to `apps/server/src/db/queries/`

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
- Affirmation Submission → `apps/desktop/src/renderer/components/submission/`, `apps/server/src/routes/submissions.ts`, `apps/server/src/services/submissionService.ts`
- Aquarium Experience → `apps/desktop/src/renderer/components/aquarium/`, `apps/server/src/routes/aquarium.ts`, `apps/server/src/services/aquariumService.ts`, `apps/server/src/websocket/`
- Identity / Privacy / Safety → `apps/server/src/services/submissionService.ts`, `apps/server/src/db/schema/devices.ts`, `packages/shared/src/contracts/`
- Team Context / Rollout → `apps/server/src/services/teamProvisioningService.ts`, `apps/server/src/config/teams.ts`, `apps/desktop/src/renderer/services/deviceIdentity.ts`
- Offline Participation / Sync → `apps/desktop/src/main/db/queueRepository.ts`, `apps/desktop/src/renderer/services/syncManager.ts`, `apps/server/src/services/submissionService.ts`
- Cross-Platform Desktop Support → `apps/desktop/src/main/`, `apps/desktop/electron-builder.yml`, `.github/workflows/release-desktop.yml`
- Cycle Rules / Temporal Behavior → `apps/server/src/services/cycleEngine.ts`, `apps/server/src/utils/time.ts`, `packages/shared/src/constants/cycles.ts`
- Self-Serve Support / Clarity → `apps/desktop/src/renderer/components/shared/`, `apps/desktop/src/renderer/utils/errorMessages.ts`

**Cross-Cutting Concerns:**
- Demo mode → `useDemoStore.ts`, `routes/demo.ts`, `demoModeService.ts`, `packages/shared/src/constants/demoMode.ts`
- Auto-update → `apps/desktop/src/main/updates/updater.ts`, `electron-builder.yml`, `.github/workflows/release-desktop.yml`
- Accessibility / reduced motion → `renderer/hooks/useReducedMotion.ts`, `renderer/styles/`, submission and aquarium components
- Logging / auditability → `server/utils/logger.ts`, `db/schema/auditLogs.ts`

### Integration Points

**Internal Communication:**
- Renderer → Preload via typed `window.api` bridge
- Preload → Main via IPC handlers in `src/main/ipc/`
- Renderer → Server via `apiClient.ts` and `websocketClient.ts`
- Server routes → services → queries is the only backend flow

**External Integrations:**
- Railway hosts Fastify app + PostgreSQL
- GitHub Releases serves signed desktop update artifacts
- No third-party auth, analytics, or messaging integration in MVP

**Data Flow:**
1. User submits affirmation in `SubmissionPanel.tsx`
2. `useSubmissionStore` writes optimistic state and calls `syncManager.ts`
3. `syncManager.ts` persists to SQLite queue through preload/main if offline, or posts to `/submissions` if online
4. Server validates via `submissionService.ts`, persists through Drizzle queries, and emits `shape_added`
5. `websocketClient.ts` receives event and `useAquariumStore` updates `AquariumView.tsx`
6. `cycleEngine.ts` emits `cycle_reset` at server-authoritative boundary; client stores reconcile and clear stale local state

### File Organization Patterns

**Configuration Files:**
- Workspace-level shared lint/TS/Prettier config in `packages/config/`
- App-local runtime env files in each app root
- Release/build configs live alongside the owning app

**Source Organization:**
- Feature-first in renderer components
- Layered backend: routes → services → db queries
- Shared contracts only in `packages/shared/`; no duplicated DTOs between client and server

**Test Organization:**
- Co-located unit tests near implementation
- App-level integration tests under each app's `tests/integration/`
- Cross-app contract/smoke tests under root `tests/`

**Asset Organization:**
- Desktop-only assets under `apps/desktop/resources/`
- No server-served public asset tree needed in MVP beyond operational docs

### Development Workflow Integration

**Development Server Structure:**
- Run desktop and server concurrently from workspace root
- `packages/shared/` is consumed by both apps for contract safety

**Build Process Structure:**
- Server builds independently for Railway deploy
- Desktop builds Electron artifacts through `electron-vite` and `electron-builder`
- Shared package builds first in CI to validate contracts

**Deployment Structure:**
- Railway deploys `apps/server/`
- GitHub Actions packages `apps/desktop/` and publishes releases for auto-update channels

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
- Electron + electron-vite + React + TypeScript fit cleanly together for the desktop client
- Fastify + Drizzle + PostgreSQL support the real-time, team-scoped backend model without stack conflicts
- SQLite on the client complements PostgreSQL as the server source of truth for offline queue durability
- GitHub Releases + `electron-updater` aligns with the silent-update requirement
- No contradictory architectural decisions were identified

**Pattern Consistency:**
- Naming conventions are internally consistent across DB, API, and TypeScript layers
- Communication patterns align with the selected stack: IPC for renderer/main, REST for writes and initial reads, WebSocket for live updates
- Process patterns support offline durability, server-authoritative cycles, and anonymized aquarium payloads

**Structure Alignment:**
- The monorepo structure cleanly supports `apps/desktop`, `apps/server`, `packages/shared`, and `packages/config`
- Boundaries are explicit across renderer, preload, main, routes, services, and DB query layers
- Shared contracts are centralized to minimize client/server drift

### Requirements Coverage Validation

**Feature Coverage:**
- All PRD functional requirement categories have explicit architectural homes and owning modules
- Cross-cutting concerns such as demo mode, anonymization, sync, update distribution, and accessibility are mapped to specific files and services

**Functional Requirements Coverage:**
- Submission flow, duplicate prevention, cycle rules, offline sync, shared aquarium display, team scoping, demo mode, and self-serve clarity all have concrete architectural support
- No functional capability from the PRD is currently unmapped

**Non-Functional Requirements Coverage:**
- Performance is addressed through WebSocket push, a lightweight client runtime, React Three Fiber, and SQLite-backed local queueing
- Reliability is addressed through durable queue persistence, sync lifecycle rules, rollback-capable updates, and server-authoritative reset logic
- Security and privacy are addressed through TLS, managed encrypted storage, anonymized payloads, and team-scoped access control
- Scalability is addressed for pilot-to-multi-team growth within one company
- Accessibility is covered through keyboard navigation, reduced-motion handling, clear status messaging, and non-color-only shape labeling
- Operations are covered through health endpoints, structured logs, Railway deployment, and GitHub Releases-based update flow

### Implementation Readiness Validation

**Decision Completeness:**
- Critical architectural decisions are documented
- The stack, runtime roles, data stores, transport layers, and deployment channels are specified
- The first implementation priority is clear: scaffold the client and server workspaces from the selected starter approach

**Structure Completeness:**
- The project tree is concrete rather than placeholder-level
- Ownership lines and integration seams are clear enough for multiple AI agents to work in parallel

**Pattern Completeness:**
- Major conflict points are covered: naming, structure, response envelopes, IPC contracts, queue lifecycle, and demo-mode isolation
- The consistency rules are specific enough to guide implementation reliably

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps:** None that block implementation.

**Nice-to-Have Gaps:**
- Release signing and notarization details for Windows and macOS are not yet specified
- A fuller operational policy for long-term data retention can be added later
- CI quality gates and test-matrix specifics are not yet designed in detail
- Future web companion contracts are intentionally deferred

### Validation Issues Addressed

- The earlier partial-readiness concern is resolved: architecture now exists and covers the PRD comprehensively
- No contradictions were found between the chosen stack, implementation patterns, and repository structure
- Remaining unspecified areas are intentional post-MVP or delivery-pipeline refinements

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented
- [x] Technology stack specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements-to-structure mapping completed

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clear split between desktop client, backend service, and shared contracts
- Strong alignment between PRD requirements and architecture
- Good handling of the hardest constraints: offline sync, anonymization, cycle authority, and real-time updates
- Explicit implementation rules that should reduce agent drift

**Areas for Future Enhancement:**
- Release-signing and notarization details
- CI and test pipeline specifics
- Post-MVP web companion contracts
- Expanded observability and retention policies

### Implementation Handoff

**AI Agent Guidelines:**
- Follow the architecture document as the source of truth for boundaries and patterns
- Use shared contracts rather than redefining DTOs between apps
- Keep server time authoritative and keep renderer access to Node APIs behind preload
- Preserve demo/live isolation and payload anonymization

**First Implementation Priority:**
- Scaffold the workspace from the selected starter approach
- Desktop: `npm create @quick-start/electron@latest ... -- --template react-ts`
- Server: Fastify + TypeScript + Drizzle + PostgreSQL workspace setup
