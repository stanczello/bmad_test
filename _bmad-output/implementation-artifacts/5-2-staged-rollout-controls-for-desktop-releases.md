# Story 5.2: Staged Rollout Controls for Desktop Releases

Status: done

## Story

As a release owner,
I want staged rollout control across cohorts,
so that update risk is reduced during deployment.

## Acceptance Criteria

1. Given a release candidate is prepared, when rollout configuration is applied, then release progression can be staged by cohort/channel.
2. Rollout can be paused/adjusted if quality signals regress.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added `RELEASE_CHANNEL` env var support in the main process (`stable` / `beta` / `alpha`).
- `autoUpdater.channel` is set from this env var so staged rollout feeds can be targeted per cohort.
- Channel value is surfaced on `/health/diagnostics` for operator visibility and on the update status banner for channel-aware users.
- Exposed `getReleaseChannel` via preload so the renderer can display active channel in the update banner.

### File List

- emotional-aquarium-client/src/main/index.ts
- emotional-aquarium-client/src/preload/index.ts
- emotional-aquarium-client/src/renderer/src/components/shell/UpdateStatusBanner.tsx
- emotional-aquarium-server/src/app.ts
