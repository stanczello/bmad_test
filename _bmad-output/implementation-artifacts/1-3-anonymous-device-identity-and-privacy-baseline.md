# Story 1.3: Anonymous Device Identity and Privacy Baseline

Status: done

## Story

As a participant,
I want my participation identity to remain anonymous in the shared view,
so that I can contribute safely without personal exposure.

## Acceptance Criteria

1. Given a first-time install in a team scope, when the app provisions participation identity, then an anonymous device identifier is generated and stored locally for dedupe only.
2. Given a provisioned identity, when the client requests identity, then the same anonymous identifier is reused from local storage.
3. Given onboarding and team scope API responses, then no direct personal identifiers are present in response payloads.

## Tasks / Subtasks

- [x] Task 1: Add anonymous device identity persistence in local client storage (AC: 1, 2)
  - [x] Create/ensure local `device_identity` table in SQLite
  - [x] Generate ID format `anon_<uuid-no-dashes>` on first create
  - [x] Reuse existing ID on subsequent lookups

- [x] Task 2: Wire identity provisioning into app lifecycle and IPC (AC: 1, 2)
  - [x] Provision identity during app startup
  - [x] Expose `app:getDeviceId` IPC to return persistent anonymous identifier

- [x] Task 3: Provision identity on successful team onboarding path (AC: 1)
  - [x] Invoke `window.api.getDeviceId()` after successful token join

- [x] Task 4: Add privacy guard assertions in API tests (AC: 3)
  - [x] Assert no `deviceId`, `email`, or `userId` in team join response payloads

- [x] Task 5: Add/update tests for identity provisioning side effect (AC: 1, 2)
  - [x] Update TeamJoinForm component test to mock and verify `getDeviceId` invocation on success

## Dev Notes

### Architecture Alignment

- Anonymous device identity is generated locally and persisted client-side.
- Identity is for dedupe only and is not surfaced in server response payloads.
- Team join onboarding remains account-less and token-based.

### References

- _bmad-output/planning-artifacts/epics.md (Story 1.3)
- _bmad-output/planning-artifacts/architecture.md (anonymous device ID, payload anonymization)

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Client and server checks executed after implementation.
- Team join payload privacy assertions validated in server tests.

### Completion Notes List

- Implemented persistent anonymous device ID generation in Electron main SQLite path.
- Replaced stub device ID IPC with deterministic get-or-create identity behavior.
- Triggered identity provisioning on successful team join.
- Added privacy leakage assertions and updated onboarding tests for identity provisioning side effect.

### Senior Developer Review (AI)

- Outcome: Approve
- Date: 2026-04-29
- Scope reviewed: Story 1.3 implementation and tests for AC1-AC3
- Findings: No blocking issues. Device identity is anonymous, persisted locally for dedupe, and not leaked in onboarding payloads.
- Follow-up recommendation: Add explicit device identity migration/rotation policy in a future hardening story.

### File List

- _bmad-output/implementation-artifacts/1-3-anonymous-device-identity-and-privacy-baseline.md
- emotional-aquarium-client/src/main/db/initDb.ts
- emotional-aquarium-client/src/main/index.ts
- emotional-aquarium-client/src/renderer/src/components/submission/TeamJoinForm.tsx
- emotional-aquarium-client/tests/components/TeamJoinForm.spec.tsx
- emotional-aquarium-server/tests/api/teamJoin.spec.ts
