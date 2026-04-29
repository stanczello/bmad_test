# Story 4.4: Offline and Delayed-Sync Recovery UX

Status: done

## Story

As a participant,
I want understandable recovery cues when sync is delayed,
so that I can self-serve common issues without support tickets.

## Acceptance Criteria

1. Given sync cannot complete immediately, when the participant checks submission status, then the UI explains pending/delayed behavior with actionable guidance.
2. Recovery does not require formal support channels for common cases.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added plain-language sync and recovery guidance states for offline queueing, replay in progress, replay success, and replay delay.
- Added explicit user-facing guidance for common recovery paths (wait for reconnect, keep app open, resubmit in active cycle).
- Extended sync status panel to show queued submission count and replay state without intrusive prompts.

### File List

- emotional-aquarium-client/src/renderer/src/components/submission/AffirmationRitualPanel.tsx
- emotional-aquarium-client/src/renderer/src/stores/useRitualStore.ts
- emotional-aquarium-client/tests/components/AffirmationRitualPanel.spec.tsx
