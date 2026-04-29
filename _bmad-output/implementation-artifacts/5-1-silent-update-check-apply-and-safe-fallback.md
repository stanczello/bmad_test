# Story 5.1: Silent Update Check, Apply, and Safe Fallback

Status: done

## Story

As a product team,
I want silent client updates with safe failure handling,
so that users stay current without disruption.

## Acceptance Criteria

1. Given a new client release is available, when the desktop app performs background update checks, then updates download/apply without routine intervention.
2. Prior stable behavior is preserved if update application fails.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Integrated `electron-updater` in the main process with silent background update check triggered 8 seconds after window ready-to-show.
- All updater events (checking, available, downloading, ready, error) emit IPC `app:updateStatus` to the renderer.
- Non-fatal error path surfaces plain-language guidance instead of crashing or alarming users.
- Exposed `getUpdateStatus`, `onUpdateStatus`, `installUpdate` via preload context bridge.

### File List

- emotional-aquarium-client/src/main/index.ts
- emotional-aquarium-client/src/preload/index.ts
- emotional-aquarium-client/src/renderer/src/stores/useAppStore.ts
- emotional-aquarium-client/src/renderer/src/components/shell/UpdateStatusBanner.tsx
- emotional-aquarium-client/src/renderer/src/App.tsx
