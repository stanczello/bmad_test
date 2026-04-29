# Story 5.4: Operational Health Signals for Sync/Reset Diagnostics

Status: done

## Story

As an operator,
I want actionable health signals around sync/reset,
so that anomalies can be detected and diagnosed quickly.

## Acceptance Criteria

1. Given the system processes submission, sync, and reset events, when operational telemetry is emitted, then health signals support diagnosis of sync/reset anomalies.
2. Events relevant to team visibility and scope remain auditable.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Created `healthService.ts` with lightweight in-process event counters for key lifecycle events: submission saved/finalized/out-of-cycle/duplicate, aquarium snapshot served/live-pushed, cycle reset detected, team join success/failure.
- Instrumented ritual and team join routes with `recordHealthEvent` calls.
- Added `/health/diagnostics` endpoint surfacing uptime, release channel, and all event counters with last-seen timestamps.

### File List

- emotional-aquarium-server/src/services/healthService.ts
- emotional-aquarium-server/src/app.ts
- emotional-aquarium-server/src/routes/ritual.ts
- emotional-aquarium-server/src/routes/teams.ts
