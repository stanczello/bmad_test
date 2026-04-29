# Story 5.3: Plain-Language Troubleshooting States

Status: done

## Story

As a participant,
I want plain-language troubleshooting cues,
so that I can understand and recover from issues quickly.

## Acceptance Criteria

1. Given submission, sync, or reset anomalies occur, when user-facing state is displayed, then troubleshooting cues are written in clear, non-technical language.
2. Core issue categories are understandable without support escalation.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- All update error messages rewritten in plain language (network failure, general failure) without surfacing technical codes.
- Update status banner surfaces phase-appropriate copy across all update lifecycle states.
- Existing error messages in ritual/aquarium services already use plain-language patterns; verified no regression.

### File List

- emotional-aquarium-client/src/main/index.ts
- emotional-aquarium-client/src/renderer/src/components/shell/UpdateStatusBanner.tsx
