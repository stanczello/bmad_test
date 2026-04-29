---
stepsCompleted:
  - step-01-validate-prerequisites.md
  - step-02-design-epics.md
  - step-03-create-stories.md
  - step-04-final-validation.md
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: create-epics-and-stories
status: complete
completedAt: 2026-04-28T14:45:00Z
---

# bmad_test - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for bmad_test, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can select one positive affirmation for the current active cycle.
FR2: User can submit exactly one affirmation shape per cycle.
FR3: User can view available affirmations with clear label-to-shape mapping.
FR4: User can confirm their submission for the active cycle.
FR5: User can see whether a submission is pending synchronization.
FR6: User can update their selection until final submission in the current cycle.
FR7: System can prevent duplicate submissions for the same user in the same cycle.
FR8: System can enforce cycle boundaries for morning and afternoon participation.
FR9: User can view a shared aquarium containing submitted affirmation shapes from their company/team context.
FR10: System can display new synchronized shapes in the aquarium during the active cycle.
FR11: System can clear the aquarium at noon according to configured cycle rules.
FR12: User can see their own submitted shape represented in the aquarium when synchronized.
FR13: User can observe aquarium activity without interacting with controls.
FR14: System can preserve a passive viewing experience without user interruption prompts.
FR15: System can provide a demo aquarium mode that simulates multi-user participation.
FR16: Enthusiastic employee can run demo mode to showcase expected populated behavior.
FR17: User can participate without exposing personal identity in aquarium view.
FR18: System can display collective affirmations without user attribution markers.
FR19: System can restrict selectable affirmations to a curated positive vocabulary.
FR20: System can prevent negative or neutral mood categories in the core ritual flow.
FR21: Team lead can use the same passive aquarium experience as other users.
FR22: System can avoid manager-specific surveillance views in the core release.
FR23: User can experience the product without receiving notifications or reminders.
FR24: Enthusiastic employee can initiate setup for an internal team context.
FR25: System can associate users and submissions with a team/company scope.
FR26: System can support rollout from an initial team to additional teams in the same company.
FR27: System can preserve team-scoped visibility boundaries for shared aquarium data.
FR28: User can join the configured team experience and begin participation with minimal onboarding.
FR29: Rollout owner can validate baseline team readiness using demo mode.
FR30: System can maintain participation continuity during staged internal rollout.
FR31: User can submit an affirmation while offline.
FR32: System can store offline submissions locally until connectivity is restored.
FR33: System can synchronize queued submissions automatically when connectivity returns.
FR34: System can reconcile queued submissions with cycle rules during delayed sync.
FR35: User can understand when a submission has not yet synchronized.
FR36: System can preserve submitted user intent through temporary network loss.
FR37: System can avoid requiring active connectivity to complete the core submission action.
FR38: User can access the core submission and aquarium experience on macOS.
FR39: User can access the core submission and aquarium experience on Windows.
FR40: System can provide consistent core behavior across macOS and Windows.
FR41: System can run as an independent lightweight desktop application runtime.
FR42: System can apply silent client updates without requiring routine user intervention.
FR43: System can continue functioning after update application without workflow reconfiguration.
FR44: Product team can stage updates to reduce rollout risk across teams.
FR45: System can define active submission windows for daily participation cycles.
FR46: System can trigger noon reset behavior consistently for all users in scope.
FR47: User can submit once in morning cycle and once in afternoon cycle.
FR48: System can reject out-of-cycle duplicate submissions while preserving valid entries.
FR49: User can understand which cycle is currently active.
FR50: System can apply cycle reset behavior predictably even when some clients were offline.
FR51: User can see clear submission state after action completion.
FR52: User can understand why the aquarium is empty when reset has occurred.
FR53: User can understand expected behavior when synchronization is delayed.
FR54: User can recover from common participation issues without formal support channels.
FR55: System can present core troubleshooting cues in plain language.
FR56: Team participant can confirm that their action was captured for later sync.
FR57: Product can minimize support burden through self-explanatory interaction states.

### NonFunctional Requirements

NFR1: Affirmation submission confirmation should be visible to the user within 1 second in normal connectivity conditions.
NFR2: Aquarium view should become interactive within 2 seconds on average workplace laptops after app open or wake.
NFR3: Real-time shape propagation should appear on connected clients within 5 seconds of successful submission in normal network conditions.
NFR4: Animation should remain visually smooth on representative mid-tier workplace hardware during normal team-scale load.
NFR5: Noon reset processing should complete and present an empty-cycle state within 10 seconds of reset trigger.
NFR6: Performance degradation under load should fail gracefully (reduced visual complexity before interaction failure).
NFR7: Submission operations should be durable: once user receives submission confirmation, intent must not be lost.
NFR8: Offline submissions should persist locally and survive app restart or temporary device/network interruption.
NFR9: Sync retry should occur automatically without requiring manual user intervention when connectivity returns.
NFR10: Cycle-state logic (morning/afternoon/reset) should be deterministic and consistent across clients for the same team scope.
NFR11: Update operations should preserve prior stable behavior if an update fails or is interrupted.
NFR12: System should provide clear state transitions for pending, synced, and reset outcomes to reduce ambiguity.
NFR13: Data in transit must be encrypted between client and backend services.
NFR14: Stored submission and team-scope data must be protected at rest in backend systems.
NFR15: Aquarium display payloads must not include direct personal identifiers in user-facing views.
NFR16: Access to team-scoped data must be restricted so users only receive data for their authorized company/team context.
NFR17: The system should minimize retained personal data and collect only what is necessary for participation and synchronization.
NFR18: Administrative and operational actions affecting team visibility or scope should be auditable.
NFR19: Architecture should support expansion from a single pilot team to multiple teams within one company without redesign of core flows.
NFR20: Team-level growth should not materially degrade submission and aquarium responsiveness at expected rollout scale.
NFR21: System should support staged rollout cohorts and controlled capacity expansion.
NFR22: Data model should support future web companion and broader rollout without breaking desktop client contracts.
NFR23: Core submission flow should be operable using keyboard navigation on supported desktop platforms.
NFR24: Core content and interaction states should provide sufficient visual contrast and readable text.
NFR25: Shape selection must not rely on color alone; labels and/or symbolic identifiers must be available.
NFR26: Essential state messages (submitted, pending sync, synced, reset) should be understandable in plain language.
NFR27: Motion presentation should avoid disorienting effects and support reduced-motion preference where feasible.
NFR28: Desktop clients should support silent background update checks and controlled release rollout.
NFR29: The system should expose health and operational signals sufficient to diagnose sync/reset anomalies.
NFR30: Time-zone and clock-handling strategy should ensure noon reset behavior is consistent with defined team policy.
NFR31: Demo mode should be operationally isolated from live team submission data.
NFR32: Configuration required for team initialization should be lightweight and repeatable for internal rollout owners.

### Additional Requirements

- Starter template is required for Epic 1 Story 1: create @quick-start/electron using react-ts with Electron updater plugin enabled.
- Backend service must be Node.js TypeScript with Fastify and PostgreSQL via Drizzle ORM.
- Client must persist offline queue and local state in SQLite and replay queued submissions on reconnect.
- Server must be cycle authority for morning/afternoon windows and noon reset with team timezone policy.
- Submission and aquarium APIs must include REST for submit/load and WebSocket for live propagation/reset events.
- Team onboarding must use team join token plus anonymous device identity for dedupe without exposing identity in display payloads.
- Demo mode must be isolated from live submission data path.
- Silent update flow must support staged rollout and rollback-safe behavior.
- Health and operational diagnostics for sync/reset anomalies are required.
- Data retention must be minimal and privacy-preserving, with team-scoped data isolation and auditability.

### UX Design Requirements

UX-DR1: Implement a single-click five-option shape selector flow with under-30-second completion target.
UX-DR2: Implement visual label-to-shape mapping that is legible without tooltips.
UX-DR3: Implement passive aquarium display with zero chrome and no interruptive prompts during viewing.
UX-DR4: Implement calm synchronization states, including a neutral joining state and non-alarm error handling.
UX-DR5: Implement noon reset interaction copy and state behavior framed as a new cycle, never as missed action.
UX-DR6: Implement first-run demo-populated aquarium behavior for onboarding and internal champion demos.
UX-DR7: Implement design token system for color, typography, spacing, motion, and depth with no hardcoded component values.
UX-DR8: Implement affirmation accent palette with five distinct color families and shape-based distinguishability.
UX-DR9: Implement typography scale with readable minimum sizes and high-contrast text defaults.
UX-DR10: Implement 8px spacing grid and constrained centered submission overlay layout rules.
UX-DR11: Implement reduced-motion support across submission transitions and aquarium animation loops.
UX-DR12: Implement keyboard-complete submission and setup flows with visible focus indicators.
UX-DR13: Implement custom component set: Shape Selector Card, Aquarium Canvas View, Submission Confirmation Pulse, Cycle Reset Notice, Champion Setup Panel, System Status Indicator.
UX-DR14: Implement anti-gamification constraints in UI (no streaks, rankings, counters, or contribution leaderboards).
UX-DR15: Implement anonymity-safe display behavior with no per-user attribution in collective views.
UX-DR16: Implement responsive behavior for compact desktop/large tablet, standard desktop, and large desktop breakpoints.
UX-DR17: Implement WCAG 2.1 AA compliance for interactive surfaces including contrast, keyboard, and screen reader support.
UX-DR18: Implement responsive and accessibility test coverage: scaling modes, NVDA/VoiceOver smoke tests, color-vision and reduced-motion checks.

### FR Coverage Map

FR1: Epic 2 - Daily affirmation selection and submission flow.
FR2: Epic 2 - One submission per cycle behavior.
FR3: Epic 2 - Clear affirmation-to-shape selection UI.
FR4: Epic 2 - Final confirmation of active-cycle submission.
FR5: Epic 2 - Submission pending sync visibility.
FR6: Epic 2 - In-cycle submission update before finalization.
FR7: Epic 2 - Duplicate prevention in same cycle.
FR8: Epic 2 - Morning/afternoon cycle boundary enforcement.
FR9: Epic 3 - Shared aquarium viewing for team context.
FR10: Epic 3 - Live synchronized shape display updates.
FR11: Epic 3 - Noon reset clear behavior in aquarium view.
FR12: Epic 3 - User sees own synchronized contribution.
FR13: Epic 3 - Passive observation without required interaction.
FR14: Epic 3 - Non-interruptive passive viewing mode.
FR15: Epic 3 - Demo mode with simulated participation.
FR16: Epic 3 - Champion-run demo for expected populated state.
FR17: Epic 1 - Anonymous participation without personal exposure.
FR18: Epic 1 - No attribution markers in collective display.
FR19: Epic 2 - Curated positive vocabulary enforcement.
FR20: Epic 2 - Exclusion of negative/neutral categories in ritual.
FR21: Epic 1 - Team lead receives same passive experience.
FR22: Epic 1 - Exclusion of manager surveillance views.
FR23: Epic 2 - No notifications/reminders in core experience.
FR24: Epic 1 - Internal champion initiates team setup.
FR25: Epic 1 - Team/company scoped identity and submissions.
FR26: Epic 1 - Multi-team expansion support within company.
FR27: Epic 1 - Team-scoped data visibility boundaries.
FR28: Epic 1 - Minimal-onboarding team join flow.
FR29: Epic 1 - Champion validation of readiness via demo.
FR30: Epic 1 - Participation continuity during staged rollout.
FR31: Epic 4 - Offline submission capability.
FR32: Epic 4 - Local offline queue persistence.
FR33: Epic 4 - Automatic sync replay on reconnect.
FR34: Epic 4 - Delayed sync reconciliation with cycle rules.
FR35: Epic 4 - Clear unsynced state understanding.
FR36: Epic 4 - Intent preservation through network interruptions.
FR37: Epic 4 - Core submission without active connectivity.
FR38: Epic 1 - macOS access to core experience.
FR39: Epic 1 - Windows access to core experience.
FR40: Epic 1 - Cross-platform behavior consistency.
FR41: Epic 1 - Lightweight independent desktop runtime.
FR42: Epic 5 - Silent client update capability.
FR43: Epic 5 - Post-update continuity without reconfiguration.
FR44: Epic 5 - Staged update rollout control.
FR45: Epic 2 - Defined daily submission windows.
FR46: Epic 4 - Consistent noon reset triggering.
FR47: Epic 2 - One morning and one afternoon submission.
FR48: Epic 2 - Out-of-cycle duplicate rejection handling.
FR49: Epic 2 - Active cycle clarity in UX.
FR50: Epic 4 - Predictable reset behavior for offline-returning clients.
FR51: Epic 2 - Clear post-submission state.
FR52: Epic 3 - Empty aquarium comprehension after reset.
FR53: Epic 4 - Delayed sync behavior clarity.
FR54: Epic 4 - Self-serve recovery from common issues.
FR55: Epic 5 - Plain-language troubleshooting cues.
FR56: Epic 2 - Confirmation that action is captured for later sync.
FR57: Epic 5 - Reduced support burden via self-explanatory states.

## Epic List

### Epic 1: Team Onboarding, Privacy, and Cross-Platform Foundation
Users can install the desktop app, join team scope with minimal onboarding, and safely participate in an anonymity-preserving environment on macOS and Windows.
**FRs covered:** FR17, FR18, FR21, FR22, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR38, FR39, FR40, FR41.

### Epic 2: Daily Affirmation Submission Ritual
Users can complete a clear, positive, one-per-cycle affirmation flow with cycle-aware validation and understandable submission state.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR19, FR20, FR23, FR45, FR47, FR48, FR49, FR51, FR56.

### Epic 3: Shared Aquarium Experience and Demo Value
Users can passively view the shared aquarium, see synchronized participation, and champions can demonstrate value through demo mode.
**FRs covered:** FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR52.

### Epic 4: Offline Participation and Sync Recovery
Users can submit while offline, preserve intent, and recover reliably through automatic synchronization and cycle reconciliation.
**FRs covered:** FR31, FR32, FR33, FR34, FR35, FR36, FR37, FR46, FR50, FR53, FR54.

### Epic 5: Safe Delivery, Updates, and Self-Serve Operational Clarity
Teams can receive safe staged updates while users get clear troubleshooting cues and low support burden behavior.
**FRs covered:** FR42, FR43, FR44, FR55, FR57.

## Epic 1: Team Onboarding, Privacy, and Cross-Platform Foundation

Users can install the desktop app, join team scope with minimal onboarding, and safely participate in an anonymity-preserving environment on macOS and Windows.

### Story 1.1: Initialize Client and Service Foundations

As a product engineer,
I want a working client and backend scaffold with shared project conventions,
So that subsequent feature stories can be built consistently and quickly.

**Acceptance Criteria:**

**Given** a fresh repository state
**When** the starter client and backend are initialized using the approved stack
**Then** both projects start successfully in local development mode
**And** baseline lint/test/build commands succeed for each project.

### Story 1.2: Team Join and Scope Initialization

As a team participant,
I want to join my configured team context with minimal onboarding,
So that I can start participating without account-heavy setup.

**Acceptance Criteria:**

**Given** a valid team join token
**When** a participant enters token-based onboarding
**Then** the client is associated to the correct team scope
**And** invalid or expired tokens are rejected with clear recovery guidance.

### Story 1.3: Anonymous Device Identity and Privacy Baseline

As a participant,
I want my participation identity to remain anonymous in the shared view,
So that I can contribute safely without personal exposure.

**Acceptance Criteria:**

**Given** a first-time install in a team scope
**When** the app provisions participation identity
**Then** an anonymous device identifier is generated and stored locally for dedupe only
**And** no direct personal identifier is included in aquarium display payloads.

### Story 1.4: Team-Scoped Data Isolation and Non-Surveillance Access

As a team member,
I want aquarium data isolated to my team and free of manager-surveillance views,
So that the experience remains safe and collective.

**Acceptance Criteria:**

**Given** multiple team scopes in the system
**When** a participant requests aquarium data
**Then** only authorized team-scoped data is returned
**And** manager-only surveillance interfaces are absent from the release.

### Story 1.5: Cross-Platform Packaging and Parity Baseline

As a product team,
I want a parity-verified macOS and Windows baseline package,
So that both target platforms support the same core behavior.

**Acceptance Criteria:**

**Given** the client baseline implementation
**When** packaging and smoke validation run on macOS and Windows
**Then** core startup and onboarding behavior is consistent across both platforms
**And** runtime remains lightweight with no mandatory heavy external dependency.

## Epic 2: Daily Affirmation Submission Ritual

Users can complete a clear, positive, one-per-cycle affirmation flow with cycle-aware validation and understandable submission state.

### Story 2.1: Affirmation Catalog and Shape Selection UI

As a participant,
I want to choose one clear positive affirmation mapped to a shape,
So that I can express intent quickly and confidently.

**Acceptance Criteria:**

**Given** an active cycle and available affirmations
**When** the selection UI opens
**Then** the participant can view a curated positive-only list with clear label-to-shape mapping
**And** negative or neutral categories are not selectable.

### Story 2.2: Cycle-Aware Submission with One-Per-Cycle Rules

As a participant,
I want submission rules enforced by cycle,
So that participation remains fair and predictable.

**Acceptance Criteria:**

**Given** a participant attempts to submit in a cycle
**When** submission is validated server-side
**Then** exactly one submission is accepted per participant for that cycle
**And** out-of-cycle or duplicate attempts are rejected with an explanatory state.

### Story 2.3: Submission Confirmation and Sync Status States

As a participant,
I want clear immediate feedback for my submission and sync state,
So that I know my action was captured.

**Acceptance Criteria:**

**Given** a participant submits an affirmation
**When** the client processes the action
**Then** the UI shows clear submitted/pending/synced states in plain language
**And** the participant can confirm the action is captured for eventual synchronization.

### Story 2.4: In-Cycle Submission Update Before Finalization

As a participant,
I want to update my selection before final submission lock,
So that I can correct my choice during the active cycle.

**Acceptance Criteria:**

**Given** a participant has an editable in-cycle selection
**When** they change to another valid affirmation before finalization
**Then** the latest selection replaces the prior pending choice
**And** finalization behavior still enforces one final submission outcome per cycle.

### Story 2.5: Cycle Visibility and Non-Interruptive Ritual Behavior

As a participant,
I want to understand which cycle is active without being interrupted,
So that the ritual stays calm and low-pressure.

**Acceptance Criteria:**

**Given** the participant is in the submission experience
**When** cycle context is displayed
**Then** morning/afternoon active cycle is clearly indicated
**And** no notification/reminder prompt is required to complete the ritual.

## Epic 3: Shared Aquarium Experience and Demo Value

Users can passively view the shared aquarium, see synchronized participation, and champions can demonstrate value through demo mode.

### Story 3.1: Passive Shared Aquarium Canvas

As a participant,
I want to passively view the shared aquarium for my team,
So that I can experience collective presence without extra effort.

**Acceptance Criteria:**

**Given** synchronized team submissions exist
**When** the aquarium view is active
**Then** team-scoped shapes are displayed in a passive, non-interruptive experience
**And** interaction controls are not required for normal viewing.

### Story 3.2: Live Shape Propagation to Connected Clients

As a connected participant,
I want new submissions to appear quickly in the aquarium,
So that the shared experience feels alive.

**Acceptance Criteria:**

**Given** multiple connected clients in one team scope
**When** a new valid submission is synchronized
**Then** the new shape appears on other connected clients via live update
**And** propagation timing meets the defined normal-condition SLA.

### Story 3.3: Noon Reset and Empty-State Clarity

As a participant,
I want noon reset behavior to be predictable and understandable,
So that an empty aquarium never feels broken.

**Acceptance Criteria:**

**Given** noon reset occurs for a team policy window
**When** the aquarium transitions to the new cycle
**Then** prior-cycle shapes are cleared as defined
**And** users receive clear, plain-language empty-state meaning for the reset.

### Story 3.4: Demo Mode for Champion-Led Rollout

As an enthusiastic employee champion,
I want to run a realistic demo mode,
So that I can showcase expected value before full organic adoption.

**Acceptance Criteria:**

**Given** a champion enables demo mode
**When** the aquarium renders demo participation
**Then** the display simulates multi-user population convincingly
**And** demo data is isolated from live team submission data.

### Story 3.5: Own-Shape Visibility Without Attribution Leakage

As a participant,
I want to perceive my contribution in the collective aquarium,
So that I feel included without identity exposure.

**Acceptance Criteria:**

**Given** a participant has a synchronized submission
**When** they view the aquarium
**Then** their own shape is present in the collective field
**And** no user-attribution markers are exposed for any shape.

## Epic 4: Offline Participation and Sync Recovery

Users can submit while offline, preserve intent, and recover reliably through automatic synchronization and cycle reconciliation.

### Story 4.1: Offline Submission Queue and Durable Local Storage

As a participant with poor connectivity,
I want to submit while offline,
So that I can complete the core ritual without network dependency.

**Acceptance Criteria:**

**Given** the client is offline
**When** a participant submits an affirmation
**Then** submission intent is stored durably in the local queue
**And** queued data survives app restart and temporary interruption.

### Story 4.2: Automatic Queue Replay on Connectivity Return

As a participant returning online,
I want queued submissions to sync automatically,
So that I do not need manual recovery steps.

**Acceptance Criteria:**

**Given** queued offline submissions exist
**When** connectivity is restored
**Then** sync retry runs automatically without user intervention
**And** sync state updates are visible in plain language.

### Story 4.3: Cycle Reconciliation for Delayed Sync

As a participant with delayed connectivity,
I want late synchronization reconciled against cycle rules,
So that valid intent is preserved without violating cycle constraints.

**Acceptance Criteria:**

**Given** a queued submission crosses a cycle boundary before sync
**When** replay reaches server reconciliation
**Then** the system applies deterministic cycle rules for acceptance/rejection
**And** the resulting state is clearly communicated to the user.

### Story 4.4: Offline and Delayed-Sync Recovery UX

As a participant,
I want understandable recovery cues when sync is delayed,
So that I can self-serve common issues without support tickets.

**Acceptance Criteria:**

**Given** sync cannot complete immediately
**When** the participant checks submission status
**Then** the UI explains pending/delayed behavior with actionable guidance
**And** recovery does not require formal support channels for common cases.

### Story 4.5: Offline Client Reset Consistency

As a participant who was offline during reset,
I want cycle reset behavior applied predictably on reconnect,
So that my app state aligns with team reality.

**Acceptance Criteria:**

**Given** a client missed noon reset while offline
**When** the client reconnects and resynchronizes
**Then** local and server cycle state reconcile deterministically
**And** the participant sees consistent active-cycle context afterward.

## Epic 5: Safe Delivery, Updates, and Self-Serve Operational Clarity

Teams can receive safe staged updates while users get clear troubleshooting cues and low support burden behavior.

### Story 5.1: Silent Update Check, Apply, and Safe Fallback

As a product team,
I want silent client updates with safe failure handling,
So that users stay current without disruption.

**Acceptance Criteria:**

**Given** a new client release is available
**When** the desktop app performs background update checks
**Then** updates download/apply without routine intervention
**And** prior stable behavior is preserved if update application fails.

### Story 5.2: Staged Rollout Controls for Desktop Releases

As a release owner,
I want staged rollout control across cohorts,
So that update risk is reduced during deployment.

**Acceptance Criteria:**

**Given** a release candidate is prepared
**When** rollout configuration is applied
**Then** release progression can be staged by cohort/channel
**And** rollout can be paused/adjusted if quality signals regress.

### Story 5.3: Plain-Language Troubleshooting States

As a participant,
I want plain-language troubleshooting cues,
So that I can understand and recover from issues quickly.

**Acceptance Criteria:**

**Given** submission, sync, or reset anomalies occur
**When** user-facing state is displayed
**Then** troubleshooting cues are written in clear, non-technical language
**And** core issue categories are understandable without support escalation.

### Story 5.4: Operational Health Signals for Sync/Reset Diagnostics

As an operator,
I want actionable health signals around sync/reset,
So that anomalies can be detected and diagnosed quickly.

**Acceptance Criteria:**

**Given** the system processes submission, sync, and reset events
**When** operational telemetry is emitted
**Then** health signals support diagnosis of sync/reset anomalies
**And** events relevant to team visibility and scope remain auditable.

### Story 5.5: Self-Explanatory Interaction States to Reduce Support Burden

As a product owner,
I want interaction states to be self-explanatory,
So that support burden remains low as adoption scales.

**Acceptance Criteria:**

**Given** typical participant workflows and edge states
**When** users complete daily ritual and recovery paths
**Then** state transitions are understandable without external documentation
**And** overall support demand is reduced through clearer in-product guidance.
