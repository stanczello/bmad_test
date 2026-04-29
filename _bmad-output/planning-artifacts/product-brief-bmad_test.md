---
title: "Product Brief: Emotional Aquarium"
status: "complete"
created: "2026-04-27"
updated: "2026-04-27"
inputs: ["brainstorming-session-20260427-001.md", "user conversation"]
---

# Product Brief: Emotional Aquarium

## Executive Summary

Every day, millions of people sit down at their desks and answer "How are you?" with "I'm fine, thanks." It is a social reflex — safe, frictionless, and completely dishonest. Emotional Aquarium breaks this silence without forcing anyone to speak.

It is a screensaver application for teams. Once a day, when you start your computer, you choose a 3D shape representing a positive affirmation for the day — *hope*, *curiosity*, *happiness*, *love*, *luck*. That shape joins a shared, gently animated aquarium floating across the screens of your teammates in real time. No names. No explanation required. Just a beautiful, living picture of how your team chooses to show up today.

The result is something that has never existed before: ambient emotional presence — a way to feel connected to the people you work with without a meeting, a message, or a mask.

---

## The Problem

Modern workplace culture has created a peculiar contradiction: we spend more time with our colleagues than almost anyone in our lives, yet we rarely know how they truly feel. Remote and hybrid work has amplified this disconnect. Slack and email flatten emotion. Video calls are performative. The casual corridor check-in has largely disappeared.

People hide real feelings — stress, grief, excitement, loneliness — behind professional composure, not because they are cold, but because there is no safe, low-friction channel to do otherwise. Expressing vulnerability at work carries social and professional risk. The result is teams that function on the surface while simmering with unspoken tension, unrecognised burnout, or quiet joy that never gets shared.

There is no lightweight, non-intrusive tool that lets people say *"I am struggling today"* or *"I am full of energy"* without committing to a conversation, booking a meeting, or filling out a wellness survey that feels clinical and surveilled.

---

## The Solution

Emotional Aquarium is a cross-platform application (macOS, Windows, web) that transforms the idle screensaver into a shared emotional canvas.

**How it works:**

1. **Daily affirmation check-in:** Once per cycle, when the screensaver activates or the user opens the app, they are invited to select a 3D shape representing a positive affirmation for the day — *hope*, *curiosity*, *happiness*, *love*, *luck*, *calm*, *energy*, *gratitude*, and others. Colour and geometry make each affirmation visually distinct and immediately recognisable. The vocabulary is intentionally uplifting: this is not an emotional dashboard but a daily act of choosing how you want to show up.

2. **The aquarium:** The screensaver becomes a gently animated 3D environment — minimal, beautiful, retro-aesthetic — where shapes accumulate in real time throughout each half-day as colleagues submit theirs. They move with soft physics, occasionally drifting close together, then apart. There are no names. There is no timeline. Just affirmations, coexisting.

3. **Daily rhythm — the noon reset:** At noon each day, the aquarium empties completely and the slate is clean. Users submit one shape per half-day cycle (morning and afternoon). This creates two natural emotional moments in a working day — a morning intention and an afternoon renewal — while keeping the collective display fresh and meaningful.

4. **Affirmation vocabulary:** The app ships with a curated set of positive affirmations — *hope*, *curiosity*, *happiness*, *love*, *luck*, *calm*, *energy*, *gratitude*, and more — each mapped to a distinct 3D shape and colour palette. Teams can expand the vocabulary over time.

**Design language:** Minimalist with a warm retro quality — think early CGI aesthetics, glowing wireframes, soft bloom lighting — beautiful to look at, ambient in character, never demanding attention.

**The empty aquarium:** If a user hasn't submitted their shape, the aquarium shows visibly sparse — a quiet, passive signal that their presence is missing. No push notifications, no reminders, no guilt — just a gentle visual invitation when the screensaver appears. The product is strictly passive: it never interrupts.

---

## What Makes This Different

**Positive-only by design.** Emotional Aquarium is built entirely around affirmations. Users choose from a vocabulary of uplifting intentions — *hope*, *curiosity*, *love*, *luck* — making the aquarium a daily act of collective optimism. There are no negative or neutral options; the shared space is always psychologically safe and inviting. Anonymity is preserved — no names, no attribution — but the emotional register is always upward-facing.

**Not a wellness app — psychological safety infrastructure.** Emotional Aquarium is not a survey, a pulse check, or a therapy tool. It is ambient infrastructure — always present, never clinical, never demanding. Unlike wellness check-in apps, surveys, or pulse tools, Emotional Aquarium requires nothing but a screensaver. It does not ask you to open an app, fill in a form, or measure your wellbeing on a scale of 1-5. It lives in the background — always there, never intrusive.

**Collective, not individual.** The value is not in your shape alone — it is in the aquarium. Watching the collective emotional state of your team float gently across your screen is an experience that no existing tool provides. It creates a sense of shared humanity that transcends the transactional nature of work communication.

**Aesthetic delight.** Most workplace tools are functional and forgettable. Emotional Aquarium aims to be genuinely beautiful — something people look forward to seeing, that adds visual and emotional texture to the working day.

---

## Who This Serves

**Primary users: knowledge workers in team-based environments**
People who work on computers as part of a team — developers, designers, writers, managers — who value psychological safety and human connection but are fatigued by performative wellness culture. They don't want therapy; they want acknowledgment. They want to feel less alone.

**Secondary users: team leads and managers**
Not to manage or surveil, but to sense collective team energy. A manager who sees the aquarium full of *hope* and *energy* shapes on a Monday morning knows the team is in a good place — a gentle, ambient signal before the week begins.

**Deployment context:** Companies of 10–500 people. Initially B2B/team-licensed; potentially expandable to larger networks or communities.

---

## Success Criteria

- **Adoption:** ≥70% of team members complete a daily check-in within the first two weeks of deployment
- **Retention:** ≥60% of users still completing check-ins at 60 days
- **Emotional signal:** Users report feeling more connected to their team (qualitative survey, 30-day mark)
- **Delight:** Users describe the screensaver as "beautiful" or "calming" in qualitative feedback
- **Low friction:** Median daily check-in time ≤ 30 seconds

---

## Scope (Version 1)

**In scope:**
- Cross-platform application: macOS, Windows, web (Electron or web-based)
- Daily affirmation selection interface — labelled affirmation picker (*hope*, *curiosity*, *happiness*, *love*, *luck*, *calm*, *energy*, *gratitude*, and more) each with a distinct shape + colour
- Shared 3D aquarium screensaver view, team-scoped, real-time feed
- Anonymised shape submission — no user attribution in the display
- Noon reset: aquarium clears at 12:00 local time daily; one shape per user per half-day cycle
- Backend to collect and synchronise shapes in real-time across team members
- Strictly passive UX — no push notifications, no reminders of any kind
- Demo mode: first-class feature to simulate multiple users adding shapes in real-time — designed to be shown live in meetings and onboarding sessions as a primary word-of-mouth growth driver
- Minimal, retro-aesthetic 3D rendering

**Out of scope (v1):**
- Historical emotional tracking or analytics dashboards
- Named attribution or individual shape identification
- Public/open communities (team-only for v1)
- Mobile app
- Integrations with Slack, Teams, or calendar tools
- Custom shape creation or upload

---

## Vision

If Emotional Aquarium succeeds, it becomes the ambient layer of team emotional intelligence — the thing that's always quietly running, quietly connecting, quietly saying: *we are all here, and none of us are just fine*.

In 2-3 years: multi-team and cross-company networks; seasonal and event-driven aquarium themes; integrations with calendar and meeting tools that surface collective mood before a critical meeting; an API that lets other tools read the emotional climate of a team. Potentially: a consumer version for friend groups, families, or distributed communities who want to stay emotionally present without the pressure of constant communication.

The long-term vision is a new kind of social layer — one built on presence and feeling rather than content and reaction.
