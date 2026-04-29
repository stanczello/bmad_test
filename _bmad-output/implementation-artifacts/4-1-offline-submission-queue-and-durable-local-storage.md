# Story 4.1: Offline Submission Queue and Durable Local Storage

Status: done

## Story

As a participant with poor connectivity,
I want to submit while offline,
so that I can complete the core ritual without network dependency.

## Acceptance Criteria

1. Given the client is offline, when a participant submits an affirmation, then submission intent is stored durably in the local queue.
2. Queued data survives app restart and temporary interruption.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added a persistent ritual offline queue in local storage (`emotional-aquarium:ritual-offline-queue`).
- Implemented queue upsert semantics keyed by team/device/cycle to preserve latest ritual intent without duplicate drift.
- Added offline finalization handling that stores queued intent and surfaces plain-language status to the participant.

### File List

- emotional-aquarium-client/src/renderer/src/stores/useRitualStore.ts
- emotional-aquarium-client/src/renderer/src/types/ritual.ts
- emotional-aquarium-client/src/renderer/src/components/submission/AffirmationRitualPanel.tsx
- emotional-aquarium-client/tests/components/AffirmationRitualPanel.spec.tsx
