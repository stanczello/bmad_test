# Story 2.2: Cycle-Aware Submission with One-Per-Cycle Rules

Status: done

## Story

As a participant,
I want submission rules enforced by cycle,
so that participation remains fair and predictable.

## Acceptance Criteria

1. Given a participant attempts to submit in a cycle, when submission is validated server-side, then exactly one submission is accepted per participant for that cycle.
2. Out-of-cycle or duplicate attempts are rejected with an explanatory state.

## Tasks / Subtasks

- [x] Added current-cycle server model (`morning`/`afternoon`) and cycle id generation.
- [x] Added cycle-aware submission validation endpoint.
- [x] Enforced duplicate final-submission rejection per participant/device/cycle.
- [x] Added API tests for in-cycle success, duplicate rejection, and out-of-cycle rejection.

## Dev Agent Record

### Agent Model Used

GPT-5.3-Codex

### Completion Notes List

- Added `POST /ritual/submission` with cycle, device, affirmation, action validation.
- Enforced `DUPLICATE_CYCLE_SUBMISSION` and `OUT_OF_CYCLE` responses.
- Added server integration tests covering one-per-cycle behavior.

### File List

- emotional-aquarium-server/src/routes/ritual.ts
- emotional-aquarium-server/src/services/ritualService.ts
- emotional-aquarium-server/src/types/ritual.ts
- emotional-aquarium-server/tests/api/ritual.spec.ts
