# Story 2.1: Affirmation Catalog and Shape Selection UI

Status: done

## Story

As a participant,
I want to choose one clear positive affirmation mapped to a shape,
so that I can express intent quickly and confidently.

## Acceptance Criteria

1. Given an active cycle and available affirmations, when the selection UI opens, then the participant can view a curated positive-only list with clear label-to-shape mapping.
2. Negative or neutral categories are not selectable.

## Tasks / Subtasks

- [x] Added server-side curated positive-only affirmation catalog and endpoint.
- [x] Added client ritual panel showing label + shape mapping for each affirmation.
- [x] Added tests for catalog display and positive-only behavior.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Implemented `GET /ritual/affirmations` behind team scope authorization.
- Added `AffirmationRitualPanel` UI with mapped shape badges and selection buttons.
- Added component tests validating cycle context + positive catalog rendering.

### File List

- emotional-aquarium-server/src/routes/ritual.ts
- emotional-aquarium-server/src/services/ritualService.ts
- emotional-aquarium-server/src/types/ritual.ts
- emotional-aquarium-client/src/renderer/src/components/submission/AffirmationRitualPanel.tsx
- emotional-aquarium-client/src/renderer/src/services/ritualService.ts
- emotional-aquarium-client/src/renderer/src/types/ritual.ts
- emotional-aquarium-client/tests/components/AffirmationRitualPanel.spec.tsx
