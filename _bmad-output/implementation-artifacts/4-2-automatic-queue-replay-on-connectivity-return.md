# Story 4.2: Automatic Queue Replay on Connectivity Return

Status: done

## Story

As a participant returning online,
I want queued submissions to sync automatically,
so that I do not need manual recovery steps.

## Acceptance Criteria

1. Given queued offline submissions exist, when connectivity is restored, then sync retry runs automatically without user intervention.
2. Sync state updates are visible in plain language.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added reconnect listener-based replay to automatically process queued ritual submissions on `online` events.
- Added startup replay attempt so queued submissions sync when the app opens with connection available.
- Added plain-language replay progress and completion guidance in ritual sync status UI.

### File List

- emotional-aquarium-client/src/renderer/src/components/submission/AffirmationRitualPanel.tsx
- emotional-aquarium-client/src/renderer/src/services/ritualService.ts
- emotional-aquarium-client/src/renderer/src/stores/useRitualStore.ts
- emotional-aquarium-client/tests/components/AffirmationRitualPanel.spec.tsx
