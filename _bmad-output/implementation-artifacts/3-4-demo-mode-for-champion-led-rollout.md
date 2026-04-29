# Story 3.4: Demo Mode for Champion-Led Rollout

Status: done

## Story

As an enthusiastic employee champion,
I want to run a realistic demo mode,
so that I can showcase expected value before full organic adoption.

## Acceptance Criteria

1. Given a champion enables demo mode, when the aquarium renders demo participation, then the display simulates multi-user population convincingly.
2. Demo data is isolated from live team submission data.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added team-scoped demo-mode toggle endpoint and snapshot mode flag.
- Implemented synthetic demo population shapes (`demo-glow`) isolated from live ritual submission records.
- Added client champion toggle control and explanatory copy indicating isolation from live data.

### File List

- emotional-aquarium-server/src/services/aquariumSnapshotService.ts
- emotional-aquarium-server/src/routes/aquarium.ts
- emotional-aquarium-server/tests/api/aquarium.spec.ts
- emotional-aquarium-client/src/renderer/src/services/aquariumService.ts
- emotional-aquarium-client/src/renderer/src/App.tsx
