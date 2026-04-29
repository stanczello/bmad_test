---
stepsCompleted:
  - step-01-init.md
  - edit-organic-physics-fr58-fr62-nfr33-nfr34
  - step-02-discovery.md
  - step-02b-vision.md
  - step-02c-executive-summary.md
  - step-03-success.md
  - step-04-journeys.md
  - step-05-domain.md
  - step-06-innovation.md
  - step-07-project-type.md
  - step-08-scoping.md
  - step-09-functional.md
  - step-10-nonfunctional.md
  - step-11-polish.md
  - step-12-complete.md
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-bmad_test.md
  - _bmad-output/brainstorming/brainstorming-session-20260427-001.md
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 1
  projectDocsCount: 0
workflowType: prd
classification:
  projectType: desktop_app
  domain: general
  complexity: low
  projectContext: greenfield
releaseMode: single-release
---

# Product Requirements Document - bmad_test

**Author:** astan
**Date:** 2026-04-27

## Executive Summary

Emotional Aquarium is a greenfield desktop application with cross-platform support requirements for Windows and macOS, with a possible web-based implementation path for broader compatibility. It is designed for teams inside a single company and transforms the idle screensaver into a passive shared experience that strengthens psychological safety and belonging.

The product addresses a workplace problem that is easy to recognize but poorly served by existing tools: people often hide their real emotional state behind socially safe answers, while modern work moves too quickly to create meaningful moments of emotional presence. Existing alternatives such as wellness surveys, pulse tools, and status indicators either feel clinical, interruptive, or overly focused on measurement. Emotional Aquarium takes the opposite approach. It creates a small, ambient ritual that allows people to anonymously contribute a positive affirmation through a 3D shape, then observe those affirmations floating together in a shared aquarium-like environment.

The core user value is not tracking or diagnosis. It is the feeling of being part of something larger while remaining safe, anonymous, and unpressured. Users should experience the product as a quiet reminder that they are surrounded by real people with energy, hopes, and intentions of their own. The intended emotional outcome is simple and specific: "I am not alone."

### What Makes This Special

Emotional Aquarium is differentiated by being passive, aesthetic, and collective. It does not ask users to report for management oversight, complete a survey, or respond to alerts. Instead, it offers a minimal, beautiful, retro-inspired visual system where affirmations accumulate in real time and reset at noon, creating two natural moments of shared renewal during the workday.

Its core insight is that psychological safety can be supported not only through conversation and policy, but also through ambient design. By shifting from mood measurement to anonymous positive affirmation, the product avoids the tone of concern or surveillance and instead creates a shared emotional atmosphere. The aquarium is not a dashboard. It is a living visual expression of team presence.

This makes the product meaningfully different from workplace wellness tools, chat statuses, or decorative screensavers. Users choose it not because it measures them, but because it helps make the workday feel warmer, more human, and more connected.

## Project Classification

- Project Type: desktop application
- Domain: general workplace/team experience tooling
- Complexity: low
- Project Context: greenfield

## Success Criteria

### User Success

Users should experience Emotional Aquarium as a small but meaningful positive moment in the workday. The clearest user-success signal is simple: "I smile when I see the aquarium." The product should make users feel less alone, more connected to their coworkers, and more aware of shared human presence without requiring conversation or disclosure.

A successful daily interaction is one where a user can submit a shape quickly, with no friction or confusion, and later see their affirmation reflected as part of a larger collective display. The experience should feel safe, passive, and aesthetically rewarding rather than performative or measured.

### Business Success

The initial business success signal is adoption within one team, followed by rollout to multiple teams within the same company. Success is not defined primarily by raw account count, but by whether the product proves it can become a repeatable team ritual and generate enough perceived value that other teams want it.

At the organizational level, success means the product is seen as a lightweight way to improve team atmosphere and psychological safety without introducing another survey or management dashboard. A strong business outcome would be internal advocates actively requesting expansion beyond the pilot group.

### Technical Success

The v1 product must deliver smooth animation on average work laptops, especially on macOS and Windows devices typically used in office environments. Performance is part of the product value: if the aquarium stutters, lags, or feels visually cheap, it undermines the intended emotional effect.

The product must also support simple daily shape submission with minimal interaction cost. The submission flow should be fast, reliable, and understandable on first use. Cross-platform support for both macOS and Windows is required for MVP, so technical success includes a consistent experience across both environments.

### Measurable Outcomes

- At least 70% of users in a pilot team complete a daily affirmation submission within the first two weeks
- At least 60% of pilot users still participate after 60 days
- Users can complete daily shape submission in 30 seconds or less
- Qualitative feedback includes repeated signals such as "beautiful," "calming," "pleasant," or "it made me smile"
- At least one additional team requests rollout after the initial pilot
- Animation remains smooth on average company laptops used in the pilot environment

## Product Scope

### MVP - Minimum Viable Product

- macOS support
- Windows support
- simple daily shape submission
- shared aquarium display for a single company/team context
- curated affirmation-to-shape vocabulary
- passive experience with no notifications
- retro-inspired minimal visual style
- stable animation performance on average work laptops

### Growth Features (Post-MVP)

- rollout tooling for multiple teams
- richer company/team setup flows
- expanded affirmation libraries
- improved administration and configuration options
- web-based fallback or companion experience
- stronger rollout support for internal champions and demos

### Vision (Future)

- multi-team ecosystems inside a company
- richer ambient social presence across larger communities
- more expressive visual behaviors, organic physics, and seasonal aquarium themes
- optional integrations that preserve the passive nature of the experience
- a broader platform for shared psychological-safety rituals at work

## User Journeys

### Journey 1: Primary User, Core Success Path

Maya is a mixed knowledge worker in a company that spends most of the day in documents, meetings, chat, and browser tabs. Her work is fast, fragmented, and emotionally flattened by routine professional interactions. She often feels connected to her team operationally, but not humanly.

On Monday morning, her computer starts up and Emotional Aquarium appears. She is invited to choose one affirmation for the first half of the day. The interaction is simple and low-pressure. She selects "curiosity," represented by a bright geometric shape, in seconds.

Later, when her screen idles, she sees the aquarium. Her shape is floating alongside many others from colleagues she cannot identify individually. The movement is calm, the visual style is minimal and retro, and the collective effect feels alive. The key emotional moment is not submission, but recognition: this is not just my day, it is our day. She smiles because the aquarium makes the workplace feel warmer and more human without demanding anything from her.

By the end of the experience, the product has succeeded if Maya feels a subtle but meaningful lift in mood, remembers the product positively, and wants to repeat the ritual tomorrow.

### Journey 2: Primary User, Edge Case / Recovery Path

Jonas opens the app late in the morning after a rushed start to the day. He is distracted and only half-engaged. He wants to contribute, but only if it is effortless. If the product is confusing, slow, or overly expressive, he will abandon it.

He opens the shape selection flow and expects it to be obvious on first use. He can immediately understand what each affirmation represents and how to make a choice. If the sync is delayed or the aquarium looks temporarily sparse, the product still feels graceful rather than broken. If he misses the morning cycle and returns after noon, the reset behavior is understandable and he is simply offered the afternoon submission instead.

The critical recovery requirement in this journey is that the product never creates anxiety when something is missed or slightly delayed. Failure states must feel calm and self-explanatory, not technical or alarming. Success means Jonas still completes his submission and feels included, even after a messy start.

### Journey 3: Team Lead, Passive Shared Experience

Elena leads a small team, but she does not want another dashboard, sentiment tool, or reporting surface. She dislikes products that turn emotional life into management instrumentation. She uses Emotional Aquarium in the same way as everyone else: passively.

She contributes her own affirmation, then later sees the aquarium as part of the working day. She notices its overall tone and density, not as a management signal to act on immediately, but as a gentle sense of collective atmosphere. The product works for her because it gives her a sense of shared presence without converting people into data points.

The important value in this journey is restraint. Elena should never feel that the product is inviting her to inspect, interpret, or monitor individual people. It succeeds when it helps her feel part of the same human environment as her team, rather than elevated above it.

### Journey 4: Enthusiastic Employee, Introduction and Rollout

Nina discovers Emotional Aquarium and becomes the internal champion for it. She is not an administrator in the formal IT sense. She is simply someone who sees that the product could make the team’s day better and wants to introduce it.

Her journey begins with setting up the product for one team in a lightweight way. She needs just enough configuration to get the aquarium running, invite coworkers, and demonstrate the experience. Demo mode is especially important here: she wants to show what the aquarium looks like when populated, without waiting for a full day of organic participation.

The product succeeds for Nina if setup feels achievable without technical expertise, the demo is compelling enough to make coworkers curious, and the initial rollout does not require heavy coordination. This journey reveals the need for simple onboarding, lightweight team setup, and a polished demo experience that sells the concept quickly.

### Journey 5: Self-Serve Support and Troubleshooting

Aron is not formal support staff, but he is the person coworkers ask when something behaves unexpectedly. Someone says the aquarium looks empty, another says their shape did not seem to appear, and someone else is unsure why the aquarium cleared at midday.

The product should support this lightweight troubleshooting model without requiring a full support system. Core recovery flows must be easy to understand: shape submission confirmation should be clear, noon reset behavior should be visible and expected, and any temporary sync delay should be explained in plain language. If something goes wrong, the user should be able to recover through simple self-serve guidance rather than tickets or escalation.

Success in this journey means support overhead stays low because the product explains itself well. The product should minimize ambiguity, reduce the number of "is this broken?" moments, and make expected system behavior feel intentional.

### Journey Requirements Summary

These journeys reveal the following capability needs:

- extremely simple daily affirmation submission with near-zero learning curve
- passive, calming aquarium display that delivers emotional value without interruption
- clear morning and afternoon cycle behavior, including understandable noon reset
- graceful handling of missed submissions and delayed participation
- strict avoidance of surveillance or analytics-like patterns in the core user experience
- lightweight team setup suitable for an enthusiastic internal champion, not just IT
- demo mode that can simulate a populated aquarium for rollout and advocacy
- self-serve troubleshooting cues for sync visibility, submission confirmation, and reset behavior
- consistent cross-platform experience for mixed workplace environments

## Innovation & Novel Patterns

### Detected Innovation Areas

Emotional Aquarium challenges the assumption that understanding shared team energy requires explicit measurement tools such as surveys, pulse checks, or status reporting. Instead of asking people to report feelings in a formal way, it introduces a passive ritual where users submit anonymous affirmation shapes and then observe a shared visual field of collective intention.

The primary novelty is not a single feature but a combination: positivity-first expression, anonymity, and ambient community presence. The product is intentionally designed to create a sense of belonging without requiring conversation, disclosure, or performance. This positions the experience closer to a shared emotional atmosphere than to a workplace analytics product.

### Market Context & Competitive Landscape

Most workplace emotional tools are structured around prompts, forms, sentiment capture, or manager-facing summaries. Their interaction model is explicit and evaluative. Emotional Aquarium uses an opposite interaction model: passive, aesthetic, and non-diagnostic.

Its differentiator is seeing a collective pattern of affirmations rather than quantifying individual states. The product’s emotional contract is "presence without pressure," uncommon in existing workplace software categories.

These innovation choices drive the platform requirements in the next section.

### Validation Approach

Innovation success will be validated through behavior and ritual uptake, not only opinion:

- morning submission behavior: users submit their affirmation shapes in the morning cycle
- repeat participation across days and weeks
- user-reported emotional effect, especially smile response and reduced sense of isolation
- observable expansion from one team pilot to additional teams

The strongest early signal is consistent morning contribution combined with positive emotional feedback about the aquarium experience.

### Risk Mitigation

The key risk is weak participation: if users do not submit affirmation shapes regularly, the shared value drops and the aquarium may feel empty.

Primary mitigation:

- keep submission interaction extremely simple and fast
- preserve passive, non-intrusive product behavior
- use internal champion-led rollout and demo mode to seed early engagement
- ensure visual delight is high enough that people want to return

Fallback position:

- even if deep psychological impact is weaker than expected, the product can still deliver value as a beautiful, calming, shared workplace ritual; an empty aquarium becomes a clear indicator that onboarding and engagement mechanics need improvement rather than a full product failure

## Desktop App Specific Requirements

### Project-Type Overview

Emotional Aquarium is a desktop-first product with MVP support for macOS and Windows. A web companion is intentionally deferred to post-MVP to keep initial delivery focused on the core desktop ritual and performance quality.

The product should run as a lightweight, independent desktop application rather than requiring deep operating-system coupling in v1. This reduces implementation risk while preserving the core user experience of passive ambient presence and daily affirmation submission.

### Technical Architecture Considerations

The desktop clients must support a real-time shared aquarium experience when connected, while preserving usability during connectivity interruptions. The architecture should separate local interaction continuity from network synchronization so users can always complete the daily ritual.

Client updates should occur silently in the background to minimize friction and avoid introducing maintenance burden for users. Update mechanisms must preserve reliability and avoid interrupting the passive nature of the product experience.

The app should be architected as an independent runtime with a thin integration surface to host OS behavior (startup and idle entry points) without requiring deep native embedding in the MVP phase.

### Platform Support Requirements

- MVP platform targets: macOS and Windows
- Web companion: explicitly out of MVP, planned for a later phase
- Experience parity: core submission and aquarium experience must be consistent across both desktop platforms
- Performance baseline: smooth animation on average workplace laptops running either supported OS

### Update & Release Strategy

- Updates should be delivered silently where possible
- User interruption should be minimized; no disruptive update prompts in normal operation
- Update failures should fail safely and preserve prior stable behavior
- Version rollout should support staged release if needed to protect pilot reliability

### Runtime & Integration Model

- Application should run independently as a lightweight desktop app
- MVP should avoid heavy OS-specific dependency chains
- OS hooks should be minimal and purpose-driven (e.g., launch behavior, idle/screen context handoff where needed)
- Product behavior should remain coherent even when native screensaver integration differs between platforms

### Offline & Sync Behavior

- Users must be able to submit affirmations while offline
- Offline submissions should be stored locally and queued for synchronization
- Sync should resume automatically when connectivity returns
- Sync state should be understandable in a self-serve manner (clear enough to avoid support tickets)
- Noon reset behavior must remain deterministic and predictable even with delayed synchronization

### Implementation Considerations

The MVP should prioritize reliability of ritual over feature breadth: fast local submission, stable passive display, resilient sync, and smooth visuals. The technical design should anticipate future expansion (web companion and broader rollout tooling) without inflating MVP scope.

Design and engineering decisions should preserve the product’s emotional contract: no interruption, no pressure, and no complexity exposed to end users.

## Project Scoping

### Strategy & Philosophy

Approach: single-release delivery focused on a complete, coherent emotional ritual experience for internal company teams. The strategy prioritizes reliability, visual calm, and low-friction participation over feature breadth and analytics complexity.

Scope philosophy: all user-specified core requirements remain in scope for this release. The release proves durable daily ritual value, not just technical feasibility. The product must ship as a full loop: submit affirmation, sync, view shared aquarium, and experience meaningful collective presence.

Resource requirements: a small cross-functional team can deliver this release if ownership is clear across desktop client engineering, backend synchronization, UX/visual design, and QA on macOS/Windows. Minimum effective capability set includes:
- Desktop app engineering (cross-platform runtime)
- Backend/API and sync logic
- Real-time/near-real-time data handling
- 3D rendering and animation tuning
- QA across average workplace hardware and both target OS environments

### Complete Feature Set

Core user journeys supported:
- Primary mixed knowledge worker completes morning affirmation submission and later sees shared aquarium
- Primary user edge-case journey supports delayed participation and recovery without anxiety
- Team lead passively participates with no surveillance affordances
- Enthusiastic employee can onboard a team and demonstrate value through demo mode
- Lightweight self-serve troubleshooting supports sync/reset/submission clarity

Must-have capabilities:
- macOS and Windows support in the same release
- Lightweight independent desktop app runtime
- Simple daily affirmation submission flow with very low interaction friction
- Curated positive affirmation vocabulary mapped to distinct shapes/colors
- Real-time shared aquarium behavior when connected
- Offline submission with local queue and delayed sync when connectivity returns
- Deterministic noon reset behavior
- Smooth animation on average workplace laptops
- Silent auto-update behavior
- Passive UX contract: no notifications, no reminders, no surveillance-style reporting
- Demo mode to simulate participation for internal rollout

Nice-to-have capabilities (still in this release if feasible after must-haves are stable):
- Enhanced visual polish variants (without changing core interaction model)
- Additional self-serve explanation layers for sync/reset states
- Expanded affirmation vocabulary options beyond initial curated baseline
- Light rollout aids for internal champions (onboarding copy/templates)

### Risk Mitigation Strategy

Technical risks:
- Risk: animation performance variance across real workplace hardware
- Mitigation: define performance baselines early, test on representative low/mid-tier devices, optimize rendering budget before visual embellishments

- Risk: cross-platform behavior differences in idle/screen lifecycle
- Mitigation: keep runtime lightweight and independent, isolate OS-specific hooks, maintain parity acceptance tests for core flows

- Risk: sync and noon reset edge cases (offline, reconnect, race conditions)
- Mitigation: explicit client state model, deterministic reset rules, queued event reconciliation on reconnect, observable but non-intrusive sync status cues

Market/adoption risks:
- Risk: weak ritual participation leads to visually empty aquarium
- Mitigation: minimize submission friction, use demo mode and champion-led introduction, ensure first-run experience clearly communicates emotional value quickly

- Risk: users misinterpret as wellness monitoring
- Mitigation: preserve positive-only, anonymous, passive design language and avoid manager-centric analytics features in release

Resource/delivery risks:
- Risk: scope breadth in single-release could delay launch quality
- Mitigation: strict must-have gating, enforce quality bar on loop completion (submit/sync/view), defer only non-core polish if schedule pressure appears

- Risk: over-investment in optional web companion too early
- Mitigation: keep web companion out of this release by explicit scope rule and revisit after release validation

## Functional Requirements

### Affirmation Submission

- FR1: User can select one positive affirmation for the current active cycle.
- FR2: User can submit exactly one affirmation shape per cycle.
- FR3: User can view available affirmations with clear label-to-shape mapping.
- FR4: User can confirm their submission for the active cycle.
- FR5: User can see whether a submission is pending synchronization.
- FR6: User can update their selection until final submission in the current cycle.
- FR7: System can prevent duplicate submissions for the same user in the same cycle.
- FR8: System can enforce cycle boundaries for morning and afternoon participation.

### Aquarium Experience

- FR9: User can view a shared aquarium containing submitted affirmation shapes from their company/team context.
- FR10: System can display new synchronized shapes in the aquarium during the active cycle.
- FR11: System can clear the aquarium at noon according to configured cycle rules.
- FR12: User can see their own submitted shape represented in the aquarium when synchronized.
- FR13: User can observe aquarium activity without interacting with controls.
- FR14: System can preserve a passive viewing experience without user interruption prompts.
- FR58: System can animate aquarium shapes with independent velocity vectors so each shape drifts freely within a defined 3D bounding box.
- FR59: System can apply soft wall repulsion so shapes curve back inward when approaching bounding box edges without teleporting or hard-snapping.
- FR60: System can apply proximity-based deflection between shapes to prevent visual overlap, using smooth re-routing rather than hard collision response.
- FR61: Aquarium physics must remain stable and performant with up to 50 simultaneous shapes.
- FR62: Shape physics must be a client-side visual effect only; no velocity or position data is shared between users or stored on the server.
- FR15: System can provide a demo aquarium mode that simulates multi-user participation.
- FR16: Enthusiastic employee can run demo mode to showcase expected populated behavior.

### Identity, Privacy, and Safety

- FR17: User can participate without exposing personal identity in aquarium view.
- FR18: System can display collective affirmations without user attribution markers.
- FR19: System can restrict selectable affirmations to a curated positive vocabulary.
- FR20: System can prevent negative or neutral mood categories in the core ritual flow.
- FR21: Team lead can use the same passive aquarium experience as other users.
- FR22: System can avoid manager-specific surveillance views in the core release.
- FR23: User can experience the product without receiving notifications or reminders.

### Team Context and Rollout

- FR24: Enthusiastic employee can initiate setup for an internal team context.
- FR25: System can associate users and submissions with a team/company scope.
- FR26: System can support rollout from an initial team to additional teams in the same company.
- FR27: System can preserve team-scoped visibility boundaries for shared aquarium data.
- FR28: User can join the configured team experience and begin participation with minimal onboarding.
- FR29: Rollout owner can validate baseline team readiness using demo mode.
- FR30: System can maintain participation continuity during staged internal rollout.

### Offline Participation and Synchronization

- FR31: User can submit an affirmation while offline.
- FR32: System can store offline submissions locally until connectivity is restored.
- FR33: System can synchronize queued submissions automatically when connectivity returns.
- FR34: System can reconcile queued submissions with cycle rules during delayed sync.
- FR35: User can understand when a submission has not yet synchronized.
- FR36: System can preserve submitted user intent through temporary network loss.
- FR37: System can avoid requiring active connectivity to complete the core submission action.

### Cross-Platform Desktop Support

- FR38: User can access the core submission and aquarium experience on macOS.
- FR39: User can access the core submission and aquarium experience on Windows.
- FR40: System can provide consistent core behavior across macOS and Windows.
- FR41: System can run as an independent lightweight desktop application runtime.
- FR42: System can apply silent client updates without requiring routine user intervention.
- FR43: System can continue functioning after update application without workflow reconfiguration.
- FR44: Product team can stage updates to reduce rollout risk across teams.

### Cycle Rules and Temporal Behavior

- FR45: System can define active submission windows for daily participation cycles.
- FR46: System can trigger noon reset behavior consistently for all users in scope.
- FR47: User can submit once in morning cycle and once in afternoon cycle.
- FR48: System can reject out-of-cycle duplicate submissions while preserving valid entries.
- FR49: User can understand which cycle is currently active.
- FR50: System can apply cycle reset behavior predictably even when some clients were offline.

### Self-Serve Support and Operational Clarity

- FR51: User can see clear submission state after action completion.
- FR52: User can understand why the aquarium is empty when reset has occurred.
- FR53: User can understand expected behavior when synchronization is delayed.
- FR54: User can recover from common participation issues without formal support channels.
- FR55: System can present core troubleshooting cues in plain language.
- FR56: Team participant can confirm that their action was captured for later sync.
- FR57: Product can minimize support burden through self-explanatory interaction states.

## Non-Functional Requirements

### Performance

- NFR1: Affirmation submission confirmation should be visible to the user within 1 second in normal connectivity conditions.
- NFR2: Aquarium view should become interactive within 2 seconds on average workplace laptops after app open or wake.
- NFR3: Real-time shape propagation should appear on connected clients within 5 seconds of successful submission in normal network conditions.
- NFR4: Animation should remain visually smooth on representative mid-tier workplace hardware during normal team-scale load.
- NFR5: Noon reset processing should complete and present an empty-cycle state within 10 seconds of reset trigger.
- NFR6: Performance degradation under load should fail gracefully (reduced visual complexity before interaction failure).

### Reliability

- NFR7: Submission operations should be durable: once user receives submission confirmation, intent must not be lost.
- NFR8: Offline submissions should persist locally and survive app restart or temporary device/network interruption.
- NFR9: Sync retry should occur automatically without requiring manual user intervention when connectivity returns.
- NFR10: Cycle-state logic (morning/afternoon/reset) should be deterministic and consistent across clients for the same team scope.
- NFR11: Update operations should preserve prior stable behavior if an update fails or is interrupted.
- NFR12: System should provide clear state transitions for pending, synced, and reset outcomes to reduce ambiguity.

### Security & Privacy

- NFR13: Data in transit must be encrypted between client and backend services.
- NFR14: Stored submission and team-scope data must be protected at rest in backend systems.
- NFR15: Aquarium display payloads must not include direct personal identifiers in user-facing views.
- NFR16: Access to team-scoped data must be restricted so users only receive data for their authorized company/team context.
- NFR17: The system should minimize retained personal data and collect only what is necessary for participation and synchronization.
- NFR18: Administrative and operational actions affecting team visibility or scope should be auditable.

### Scalability

- NFR19: Architecture should support expansion from a single pilot team to multiple teams within one company without redesign of core flows.
- NFR20: Team-level growth should not materially degrade submission and aquarium responsiveness at expected rollout scale.
- NFR21: System should support staged rollout cohorts and controlled capacity expansion.
- NFR22: Data model should support future web companion and broader rollout without breaking desktop client contracts.

### Accessibility

- NFR23: Core submission flow should be operable using keyboard navigation on supported desktop platforms.
- NFR24: Core content and interaction states should provide sufficient visual contrast and readable text.
- NFR25: Shape selection must not rely on color alone; labels and/or symbolic identifiers must be available.
- NFR26: Essential state messages (submitted, pending sync, synced, reset) should be understandable in plain language.
- NFR27: Motion presentation should avoid disorienting effects and support reduced-motion preference where feasible.
- NFR33: Aquarium physics simulation must maintain smooth animation at ≥30 fps on representative mid-tier workplace hardware with up to 50 shapes active.
- NFR34: Physics velocity changes must be gradual and damped so no shape undergoes sudden directional snapping; maximum per-frame acceleration must be bounded to preserve calm, organic visual tone.

### Integration & Operations

- NFR28: Desktop clients should support silent background update checks and controlled release rollout.
- NFR29: The system should expose health and operational signals sufficient to diagnose sync/reset anomalies.
- NFR30: Time-zone and clock-handling strategy should ensure noon reset behavior is consistent with defined team policy.
- NFR31: Demo mode should be operationally isolated from live team submission data.
- NFR32: Configuration required for team initialization should be lightweight and repeatable for internal rollout owners.
