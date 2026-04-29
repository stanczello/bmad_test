# Story 4.3: Cycle Reconciliation for Delayed Sync

Status: done

## Story

As a participant with delayed connectivity,
I want late synchronization reconciled against cycle rules,
so that valid intent is preserved without violating cycle constraints.

## Acceptance Criteria

1. Given a queued submission crosses a cycle boundary before sync, when replay reaches server reconciliation, then deterministic cycle rules are applied for acceptance/rejection.
2. The resulting state is clearly communicated to the user.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Reused server deterministic reconciliation (`OUT_OF_CYCLE`) during replay rather than introducing divergent client logic.
- Added client replay handling that removes out-of-cycle queued entries and updates status with explicit reconciliation messaging.
- Added test coverage verifying delayed queued submission reconciliation after reconnect.

### File List

- emotional-aquarium-client/src/renderer/src/components/submission/AffirmationRitualPanel.tsx
- emotional-aquarium-client/src/renderer/src/services/ritualService.ts
- emotional-aquarium-client/tests/components/AffirmationRitualPanel.spec.tsx
- emotional-aquarium-server/src/services/ritualService.ts
