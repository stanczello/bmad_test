# Story 3.5: Own-Shape Visibility Without Attribution Leakage

Status: done

## Story

As a participant,
I want to perceive my contribution in the collective aquarium,
so that I feel included without identity exposure.

## Acceptance Criteria

1. Given a participant has a synchronized submission, when they view the aquarium, then their own shape is present in the collective field.
2. No user-attribution markers are exposed for any shape.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added device-scoped snapshot query support so server can compute own-shape visibility for requesting participant.
- Returned `ownShape` and `ownContributionVisible` without exposing direct identifiers in snapshot payload.
- Added UI contribution-visibility section showing participant-only own-shape confirmation in plain language.

### File List

- emotional-aquarium-server/src/routes/aquarium.ts
- emotional-aquarium-server/src/services/aquariumSnapshotService.ts
- emotional-aquarium-server/tests/api/aquarium.spec.ts
- emotional-aquarium-client/src/renderer/src/services/aquariumService.ts
- emotional-aquarium-client/src/renderer/src/App.tsx
