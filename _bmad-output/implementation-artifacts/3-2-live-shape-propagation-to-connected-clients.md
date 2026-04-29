# Story 3.2: Live Shape Propagation to Connected Clients

Status: done

## Story

As a connected participant,
I want new submissions to appear quickly in the aquarium,
so that the shared experience feels alive.

## Acceptance Criteria

1. Given multiple connected clients in one team scope, when a new valid submission is synchronized, then the new shape appears on other connected clients via live update.
2. Propagation timing meets normal-condition expectations.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added websocket live channel `GET /aquarium/live` with team-scoped authorization.
- Added team live socket registry and snapshot broadcast on ritual submission and demo-mode toggle.
- Added client websocket subscription in app shell and live snapshot hydration.

### File List

- emotional-aquarium-server/src/services/aquariumLiveService.ts
- emotional-aquarium-server/src/routes/aquarium.ts
- emotional-aquarium-server/src/routes/ritual.ts
- emotional-aquarium-client/src/renderer/src/App.tsx
