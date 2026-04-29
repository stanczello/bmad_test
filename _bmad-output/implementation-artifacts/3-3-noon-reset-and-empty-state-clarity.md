# Story 3.3: Noon Reset and Empty-State Clarity

Status: done

## Story

As a participant,
I want noon reset behavior to be predictable and understandable,
so that an empty aquarium never feels broken.

## Acceptance Criteria

1. Given noon reset occurs for a team policy window, when the aquarium transitions to the new cycle, then prior-cycle shapes are cleared as defined.
2. Users receive clear, plain-language empty-state meaning for the reset.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Implemented cycle-window-based snapshot derivation (`morning`/`afternoon`) so prior-cycle shapes do not carry over.
- Added plain-language empty-state messages including noon reset explanation for afternoon empty state.
- Added unit coverage validating noon-reset empty-state behavior.

### File List

- emotional-aquarium-server/src/services/aquariumSnapshotService.ts
- emotional-aquarium-server/tests/unit/aquariumSnapshotService.spec.ts
- emotional-aquarium-client/src/renderer/src/App.tsx
