# Story 1.4: Team-Scoped Data Isolation and Non-Surveillance Access

Status: done

## Story

As a team member,
I want aquarium data isolated to my team and free of manager-surveillance views,
so that the experience remains safe and collective.

## Acceptance Criteria

1. Given multiple team scopes in the system, when a participant requests aquarium data, then only authorized team-scoped data is returned.
2. Given a participant client without valid scoped access, when aquarium data is requested, then the request is rejected with a clear authorization error.
3. Given the released client baseline, then manager-only surveillance interfaces are absent and the renderer only displays aggregate team-scoped aquarium data.

## Tasks / Subtasks

- [x] Task 1: Extend team join contract with scoped aquarium access credential (AC: 1, 2)
  - [x] Return a team-scoped `teamAccessKey` alongside the joined team scope
  - [x] Keep the access credential scoped to a single team context

- [x] Task 2: Add protected aquarium snapshot endpoint (AC: 1, 2)
  - [x] Add `GET /aquarium/current` route guarded by `x-team-access-key`
  - [x] Return privacy-safe aggregate snapshot data only for the authorized team scope
  - [x] Reject missing or invalid access credentials with typed error envelopes

- [x] Task 3: Wire client snapshot retrieval to the scoped contract (AC: 1, 3)
  - [x] Persist `teamAccessKey` with the joined team scope in local client storage
  - [x] Fetch aquarium snapshot only when a valid scoped access key is present
  - [x] Fall back to a rejoin prompt for legacy sessions without scoped access data

- [x] Task 4: Keep the renderer free of surveillance-only interfaces (AC: 3)
  - [x] Render only aggregate team snapshot details in the shared view
  - [x] Avoid participant-level identifiers or manager-only panels in the client UI

- [x] Task 5: Add/update tests for team isolation behavior (AC: 1, 2, 3)
  - [x] Add server API tests for authorized, unauthorized, and cross-team aquarium access
  - [x] Add client tests for scoped snapshot loading and legacy-session rejoin behavior

## Dev Notes

### Architecture Alignment

- Aquarium reads now use a scoped server-issued access key rather than inferring access from arbitrary team identifiers.
- Shared aquarium payloads remain aggregate and privacy-safe; no participant attribution fields are returned.
- Legacy locally stored team scope is handled defensively by prompting a rejoin to refresh secure scoped access.

### References

- _bmad-output/planning-artifacts/epics.md (Story 1.4)
- _bmad-output/planning-artifacts/architecture.md (team-scoped boundaries, privacy-safe shared view)

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Server validation passed: `npm test`, `npm run typecheck`, `npm run lint` in `emotional-aquarium-server`.
- Client validation passed: `npm test`, `npm run typecheck`, `npm run lint` in `emotional-aquarium-client`.

### Completion Notes List

- Added a scoped `teamAccessKey` to the join response and persisted it client-side with team scope.
- Implemented protected `GET /aquarium/current` server route returning team-specific aggregate snapshots only.
- Added privacy-safe aquarium snapshot UI in the renderer and a rejoin recovery path for legacy sessions.
- Added server and client tests to verify authorized team access, rejection of unauthorized reads, and absence of surveillance-only UI behavior.

### Senior Developer Review (AI)

- Outcome: Approve
- Date: 2026-04-29
- Scope reviewed: Story 1.4 implementation and tests for AC1-AC3
- Findings: No blocking issues. Team-scoped aquarium access is enforced through a scoped access key, and the client only renders aggregate shared-view data.
- Follow-up recommendation: Replace the in-memory scoped access mapping with durable server persistence when team provisioning becomes dynamic.

### File List

- _bmad-output/implementation-artifacts/1-4-team-scoped-data-isolation-and-non-surveillance-access.md
- emotional-aquarium-server/src/app.ts
- emotional-aquarium-server/src/routes/aquarium.ts
- emotional-aquarium-server/src/routes/teams.ts
- emotional-aquarium-server/src/services/aquariumSnapshotService.ts
- emotional-aquarium-server/src/services/teamJoinService.ts
- emotional-aquarium-server/src/types/aquarium.ts
- emotional-aquarium-server/src/types/team.ts
- emotional-aquarium-server/tests/api/aquarium.spec.ts
- emotional-aquarium-server/tests/api/teamJoin.spec.ts
- emotional-aquarium-client/src/renderer/src/App.tsx
- emotional-aquarium-client/src/renderer/src/components/submission/TeamJoinForm.tsx
- emotional-aquarium-client/src/renderer/src/services/aquariumService.ts
- emotional-aquarium-client/src/renderer/src/stores/useTeamStore.ts
- emotional-aquarium-client/src/renderer/src/types/aquarium.ts
- emotional-aquarium-client/src/renderer/src/types/team.ts
- emotional-aquarium-client/tests/components/App.spec.tsx
- emotional-aquarium-client/tests/components/TeamJoinForm.spec.tsx
- emotional-aquarium-client/tests/unit/useTeamStore.spec.ts
