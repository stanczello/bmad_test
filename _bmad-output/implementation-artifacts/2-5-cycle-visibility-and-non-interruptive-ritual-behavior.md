# Story 2.5: Cycle Visibility and Non-Interruptive Ritual Behavior

Status: done

## Story

As a participant,
I want to understand which cycle is active without being interrupted,
so that the ritual stays calm and low-pressure.

## Acceptance Criteria

1. Given the participant is in the submission experience, when cycle context is displayed, then morning/afternoon active cycle is clearly indicated.
2. No notification/reminder prompt is required to complete the ritual.

## Tasks / Subtasks

- [x] Added active cycle endpoint and UI rendering of current cycle context.
- [x] Added calm passive copy and no reminder/notification prompts in ritual UX.
- [x] Covered cycle context rendering with component tests.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added `GET /ritual/cycle/current` endpoint.
- Displayed active cycle label directly in ritual panel.
- Kept ritual flow non-interruptive with passive state copy.

### File List

- emotional-aquarium-server/src/routes/ritual.ts
- emotional-aquarium-server/src/services/ritualService.ts
- emotional-aquarium-client/src/renderer/src/components/submission/AffirmationRitualPanel.tsx
- emotional-aquarium-client/src/renderer/src/App.tsx
- emotional-aquarium-client/tests/components/AffirmationRitualPanel.spec.tsx
