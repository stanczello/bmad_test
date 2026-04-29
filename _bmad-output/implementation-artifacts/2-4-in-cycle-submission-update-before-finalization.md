# Story 2.4: In-Cycle Submission Update Before Finalization

Status: done

## Story

As a participant,
I want to update my selection before final submission lock,
so that I can correct my choice during the active cycle.

## Acceptance Criteria

1. Given a participant has an editable in-cycle selection, when they change to another valid affirmation before finalization, then the latest selection replaces the prior pending choice.
2. Finalization behavior still enforces one final submission outcome per cycle.

## Tasks / Subtasks

- [x] Implemented `save` action for editable in-cycle pending selection.
- [x] Implemented `finalize` action for locked one-per-cycle final submission.
- [x] Added tests validating pending replacement before finalization.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added action-aware submission endpoint (`save` vs `finalize`).
- Added client behavior to save selection on click and allow updates until final submit.
- Confirmed pending replacement and final lock with server and client tests.

### File List

- emotional-aquarium-server/src/routes/ritual.ts
- emotional-aquarium-server/src/services/ritualService.ts
- emotional-aquarium-server/tests/api/ritual.spec.ts
- emotional-aquarium-client/src/renderer/src/components/submission/AffirmationRitualPanel.tsx
- emotional-aquarium-client/src/renderer/src/services/ritualService.ts
- emotional-aquarium-client/tests/components/AffirmationRitualPanel.spec.tsx
