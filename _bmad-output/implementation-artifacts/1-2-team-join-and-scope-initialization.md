# Story 1.2: Team Join and Scope Initialization

Status: done

## Story

As a team participant,
I want to join my configured team context with minimal onboarding,
so that I can start participating without account-heavy setup.

## Acceptance Criteria

1. Given a valid team join token, when a participant enters token-based onboarding, then the client is associated to the correct team scope.
2. Given an invalid, expired, or malformed team join token, when onboarding validation runs, then the attempt is rejected with clear recovery guidance.
3. Team onboarding flow does not require account creation, email, or password.
4. On successful join, the app persists team scope locally for subsequent sessions.
5. Client and server exchange uses standard API envelope shape:
   - success: { "success": true, "data": { ... } }
   - error: { "success": false, "error": { "code": "...", "message": "..." } }

## Tasks / Subtasks

- [x] Task 1: Implement server token validation endpoint (AC: 1, 2, 5)
  - [x] Add `POST /teams/join` route in server with payload `{ teamJoinToken: string }`
  - [x] Validate token presence and format; reject malformed input
  - [x] Resolve valid token to team scope (stub/in-memory mapping allowed for Story 1.2)
  - [x] Return typed success/error response envelope

- [x] Task 2: Implement client onboarding UI flow (AC: 1, 2, 3)
  - [x] Add join form in renderer for token entry (single field + submit)
  - [x] Show plain-language error states for invalid/expired tokens
  - [x] Avoid introducing account/auth fields in UI

- [x] Task 3: Persist team scope locally (AC: 4)
  - [x] Save successful join result to local storage/state (safe local persistence)
  - [x] Load stored team scope on app startup and expose it in onboarding status UI

- [x] Task 4: Integration wiring + validation (AC: 1, 2, 5)
  - [x] Call `POST /teams/join` from client service layer
  - [x] Handle success and error envelopes consistently
  - [x] Add/update tests for join success and failure scenarios

## Dev Notes

### Source Story Context

- Story source: Epic 1, Story 1.2 in epics planning artifact.
- Business intent: minimal-friction team onboarding without account-heavy setup.

### Architecture Guardrails

- Team onboarding identity must use pre-shared team join token.
- Do not introduce login credentials in this story.
- Preserve team-scoped boundaries conceptually from first join operation.
- Keep API response formats consistent with project envelope conventions.

### Suggested File Targets

Server:
- emotional-aquarium-server/src/routes/teams.ts
- emotional-aquarium-server/src/services/teamJoinService.ts
- emotional-aquarium-server/src/types/team.ts

Client:
- emotional-aquarium-client/src/renderer/src/components/submission/TeamJoinForm.tsx
- emotional-aquarium-client/src/renderer/src/services/teamJoinService.ts
- emotional-aquarium-client/src/renderer/src/stores/useTeamStore.ts
- emotional-aquarium-client/src/renderer/src/App.tsx

### Testing Guidance

- Server tests:
  - valid token returns 200 with team scope payload
  - invalid/expired token returns error envelope with explanatory message
- Client tests:
  - join form submits token and handles success state
  - invalid token path renders recovery guidance
  - persisted team scope is loaded on app boot

### References

- _bmad-output/planning-artifacts/epics.md (Story 1.2)
- _bmad-output/planning-artifacts/architecture.md (Team join token, API envelope, team-scoped constraints)

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Server checks passed: `npm run typecheck`, `npm run lint`, and `npm test` in `emotional-aquarium-server`.
- Client checks passed: `npm run typecheck`, `npm run lint`, and `npm test` in `emotional-aquarium-client`.
- Team join endpoint validated with success and invalid-token API tests.

### Completion Notes List

- Implemented `POST /teams/join` token onboarding endpoint with typed success/error envelopes.
- Added server-side token format validation and in-memory team resolution for Story 1.2 scope.
- Added client team join form with plain-language recovery guidance for invalid/expired tokens.
- Added local team scope persistence with load-on-start behavior via Zustand store + localStorage.
- Integrated onboarding status into main app view and provided reset action for local scope.
- Added/updated tests for server team join behavior, client join form behavior, and persistence lifecycle.

### Senior Developer Review (AI)

- Outcome: Approve
- Date: 2026-04-29
- Scope reviewed: Story 1.2 implementation and tests for AC1-AC5
- Findings: No blocking issues. Team join token flow, plain-language failure guidance, and local scope persistence meet story requirements.
- Follow-up recommendation: Consider token normalization UX (e.g., uppercase transform) in a future polish pass.

### File List

- _bmad-output/implementation-artifacts/1-2-team-join-and-scope-initialization.md
- emotional-aquarium-server/src/app.ts
- emotional-aquarium-server/src/routes/teams.ts
- emotional-aquarium-server/src/services/teamJoinService.ts
- emotional-aquarium-server/src/types/team.ts
- emotional-aquarium-server/tests/api/teamJoin.spec.ts
- emotional-aquarium-client/src/renderer/src/App.tsx
- emotional-aquarium-client/src/renderer/src/components/submission/TeamJoinForm.tsx
- emotional-aquarium-client/src/renderer/src/services/teamJoinService.ts
- emotional-aquarium-client/src/renderer/src/stores/useTeamStore.ts
- emotional-aquarium-client/src/renderer/src/types/team.ts
- emotional-aquarium-client/tests/components/TeamJoinForm.spec.tsx
- emotional-aquarium-client/tests/unit/useTeamStore.spec.ts
