# Story 4.5: Offline Client Reset Consistency

Status: done

## Story

As a participant who was offline during reset,
I want cycle reset behavior applied predictably on reconnect,
so that my app state aligns with team reality.

## Acceptance Criteria

1. Given a client missed noon reset while offline, when the client reconnects and resynchronizes, then local and server cycle state reconcile deterministically.
2. The participant sees consistent active-cycle context afterward.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added cycle-context refresh handling that clears stale submission state when local cycle differs from current server cycle.
- Combined cycle refresh and queue replay so reconnect behavior converges on active-cycle truth.
- Added reconciliation messaging for delayed submissions that become out-of-cycle after noon reset.

### File List

- emotional-aquarium-client/src/renderer/src/components/submission/AffirmationRitualPanel.tsx
- emotional-aquarium-client/src/renderer/src/stores/useRitualStore.ts
- emotional-aquarium-client/tests/components/AffirmationRitualPanel.spec.tsx
