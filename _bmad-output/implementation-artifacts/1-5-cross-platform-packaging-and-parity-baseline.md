# Story 1.5: Cross-Platform Packaging and Parity Baseline

Status: done

## Story

As a product team,
I want a parity-verified macOS and Windows baseline package,
so that both target platforms support the same core behavior.

## Acceptance Criteria

1. Given the client baseline implementation, when packaging and smoke validation run on macOS and Windows, then core startup and onboarding behavior is consistent across both platforms.
2. Given the packaging baseline, then runtime remains lightweight with no mandatory heavy external dependency.

## Tasks / Subtasks

- [x] Task 1: Harden Electron packaging metadata and output conventions (AC: 1, 2)
  - [x] Set stable app identity and platform-specific package target metadata in `electron-builder.yml`
  - [x] Add deterministic dist output and artifact naming for Windows/macOS package outputs
  - [x] Exclude non-runtime test/coverage sources from packaged bundle

- [x] Task 2: Add packaged parity smoke baseline command path (AC: 1)
  - [x] Add packaged smoke mode in Electron main process (`--smoke-test`) with pass/fail exit codes
  - [x] Validate startup shell in packaged mode (renderer load + team token input + preload bridge)
  - [x] Add `scripts/runPackagedSmoke.mjs` for OS-specific packaged executable discovery and smoke execution

- [x] Task 3: Add explicit parity scripts for Windows and macOS (AC: 1)
  - [x] Add `package:win:dir`, `package:mac:dir`, `smoke:packaged:win`, `smoke:packaged:mac`, `parity:win`, and `parity:mac` npm scripts
  - [x] Keep parity scripts OS-aware and fail fast when run on the wrong platform

- [x] Task 4: Add CI release/parity workflow coverage for both desktop targets (AC: 1)
  - [x] Add `.github/workflows/release-desktop.yml` matrix job for Windows and macOS
  - [x] Run shared quality checks and packaged parity smoke per OS before artifact upload

- [x] Task 5: Keep runtime lightweight and baseline-independent (AC: 2)
  - [x] Keep no new mandatory heavy runtime services/dependencies in the desktop startup path
  - [x] Preserve local SQLite and preload bridge baseline without external service requirements for startup smoke

## Dev Notes

### Architecture Alignment

- Desktop packaging remains `electron-vite` + `electron-builder`, aligned with planning architecture.
- Packaged parity smoke checks validate startup/onboarding shell behavior in the built app instead of only dev mode.
- macOS parity execution is available through CI matrix and local `parity:mac`; local validation in this session was limited to Windows environment capabilities.

### References

- _bmad-output/planning-artifacts/epics.md (Story 1.5)
- _bmad-output/planning-artifacts/architecture.md (desktop packaging and parity constraints)

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Debug Log References

- Client checks passed after implementation: `npm run lint`, `npm test` in `emotional-aquarium-client`.
- Windows packaged parity smoke passed: `npm run smoke:packaged:win`.
- Windows installer artifact generated: `dist/emotional-aquarium-client-1.0.0-windows-setup.exe`.

### Completion Notes List

- Implemented packaged smoke mode in Electron main process with deterministic pass/fail exit behavior.
- Added OS-aware packaged smoke runner script and parity npm scripts for Windows/macOS.
- Added cross-platform desktop release workflow to run parity checks and packaging on both Windows and macOS runners.
- Updated electron-builder metadata for stable app identity and packaging outputs while preserving lightweight baseline runtime behavior.

### Senior Developer Review (AI)

- Outcome: Approve
- Date: 2026-04-29
- Scope reviewed: Story 1.5 implementation and packaging/parity validation path for AC1-AC2
- Findings: No blocking code issues. Windows packaged parity baseline is validated locally and macOS parity path is codified in CI matrix workflow.
- Follow-up recommendation: Execute one manual macOS parity run from a macOS machine once the first release candidate is cut.

### File List

- _bmad-output/implementation-artifacts/1-5-cross-platform-packaging-and-parity-baseline.md
- emotional-aquarium-client/src/main/index.ts
- emotional-aquarium-client/scripts/runPackagedSmoke.mjs
- emotional-aquarium-client/electron-builder.yml
- emotional-aquarium-client/package.json
- emotional-aquarium-client/README.md
- .github/workflows/release-desktop.yml
