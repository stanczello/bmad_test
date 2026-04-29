# emotional-aquarium-client

Electron desktop client scaffold for Emotional Aquarium.

## Prerequisites

- Node.js 20+
- npm 10+
- Windows or macOS development machine

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Quality Checks

```bash
npm run typecheck
npm run lint
npm test
```

## Packaging

```bash
npm run build:win
npm run build:mac
```

## Parity Smoke

Run the packaged baseline smoke checks on the matching OS:

```bash
npm run parity:win
npm run parity:mac
```

These commands build an unpacked desktop artifact, launch it with `--smoke-test`, and verify that startup, preload wiring, and the token onboarding shell are available before exit.

## Environment

Copy `.env.example` to `.env` and adjust values for local development.

## Notes

- Tailwind CSS v4 is configured through `electron.vite.config.ts` using `@tailwindcss/vite`.
- SQLite initialization runs in the Electron main process via `src/main/db/initDb.ts`.
- Cross-platform release validation is automated in `.github/workflows/release-desktop.yml` for Windows and macOS parity checks.
