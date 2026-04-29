# Story 3.1: Passive Shared Aquarium Canvas

Status: done

## Story

As a participant,
I want to passively view the shared aquarium for my team,
so that I can experience collective presence without extra effort.

## Acceptance Criteria

1. Given synchronized team submissions exist, when the aquarium view is active, then team-scoped shapes are displayed in a passive, non-interruptive experience.
2. Interaction controls are not required for normal viewing.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Replaced static snapshot data with dynamic team-scoped snapshot composition from finalized ritual submissions.
- Preserved passive shared view behavior with shape-mix rendering and no required interaction controls for normal participants.

### File List

- emotional-aquarium-server/src/services/aquariumSnapshotService.ts
- emotional-aquarium-server/src/routes/aquarium.ts
- emotional-aquarium-client/src/renderer/src/App.tsx
- emotional-aquarium-client/src/renderer/src/types/aquarium.ts
