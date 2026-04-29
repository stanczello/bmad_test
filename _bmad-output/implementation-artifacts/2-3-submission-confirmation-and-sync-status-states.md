# Story 2.3: Submission Confirmation and Sync Status States

Status: done

## Story

As a participant,
I want clear immediate feedback for my submission and sync state,
so that I know my action was captured.

## Acceptance Criteria

1. Given a participant submits an affirmation, when the client processes the action, then the UI shows clear submitted/pending/synced states in plain language.
2. The participant can confirm the action is captured for eventual synchronization.

## Tasks / Subtasks

- [x] Added client-side sync state model in ritual store.
- [x] Added plain-language state labels for pending/synced in panel UI.
- [x] Added tests that verify pending then synced transitions.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Introduced ritual store for submission state and status label lifecycle.
- Rendered explicit sync-status section in ritual panel.
- Verified status transitions with component tests.

### File List

- emotional-aquarium-client/src/renderer/src/stores/useRitualStore.ts
- emotional-aquarium-client/src/renderer/src/components/submission/AffirmationRitualPanel.tsx
- emotional-aquarium-client/src/renderer/src/services/ritualService.ts
- emotional-aquarium-client/tests/components/AffirmationRitualPanel.spec.tsx
