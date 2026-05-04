# Emotional Aquarium - Developer Setup

This repository contains two applications:

- `emotional-aquarium-server`: Fastify + TypeScript backend API
- `emotional-aquarium-client`: Electron + React desktop client

## 0) First-time clone / repository hygiene

After cloning (or if any generated files were accidentally committed in the past), run the
following once to remove tracked artefacts that are now covered by `.gitignore`:

```bash
# Remove everything from the Git index that .gitignore now excludes,
# without touching your working-directory files.
git rm -r --cached .
git add .
git commit -m "chore: apply .gitignore – remove generated and secret files from tracking"
```

> **Never commit** `node_modules/`, `dist/`, `out/`, `coverage/`, `*.sqlite`, or any `.env`
> file (use the `.env.example` templates instead).

## 1) Prerequisites

- Node.js 20+
- npm 10+
- Windows or macOS for desktop client development
- Docker Desktop (optional, for containerized workflows)

## 2) Repository structure

- `emotional-aquarium-server` - backend service
- `emotional-aquarium-client` - desktop client
- `docker-compose.yml` - container orchestration
- `docs/docker-compose.md` - compose profiles and usage

## 3) Local setup (recommended for development)

### Step A: Configure environment

> `.env` files are **gitignored** and must be created locally from the provided examples.
> Never commit real `.env` files.

1. Create backend env file:
   ```bash
   cp emotional-aquarium-server/.env.example emotional-aquarium-server/.env
   ```
2. Create client env file:
   ```bash
   cp emotional-aquarium-client/.env.example emotional-aquarium-client/.env
   ```

### Step B: Install dependencies

Run in separate terminals:

Server:

```bash
cd emotional-aquarium-server
npm install
```

Client:

```bash
cd emotional-aquarium-client
npm install
```

### Step C: Run backend first

```bash
cd emotional-aquarium-server
npm run dev
```

Health check:

```bash
# expected: {"success":true,"data":{"status":"ok"}}
http://localhost:3000/health
```

### Step D: Run client

```bash
cd emotional-aquarium-client
npm run dev
```

The client expects the backend at `http://localhost:3000` (from `VITE_API_URL`).

## 4) Environment variables

### Server (`emotional-aquarium-server/.env`)

- `DATABASE_URL` (reserved for database-backed runtime/migrations)
- `PORT` (default `3000`)
- `NODE_ENV` (typically `development`)

### Client (`emotional-aquarium-client/.env`)

- `VITE_API_URL` (default `http://localhost:3000`)

## 5) Quality checks

### Client

```bash
cd emotional-aquarium-client
npm run typecheck
npm run lint
npm run test:coverage
```

### Server

```bash
cd emotional-aquarium-server
npm run typecheck
npm run lint
npm run test:coverage
```

### Server E2E (Playwright)

```bash
cd emotional-aquarium-server
npx playwright install --with-deps chromium
npm run test:e2e
```

### One-command final verification (PowerShell)

From repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\final-verification.ps1
```

## 6) Docker setup

For containerized runtime and profiles, use:

- `docker-compose.yml`
- `docs/docker-compose.md`

Quick start:

```bash
docker compose --env-file .env.compose up --build
```

## 7) Troubleshooting

- Backend not reachable:
  - confirm server is running on port `3000`
  - verify `VITE_API_URL` in `emotional-aquarium-client/.env`
- Port conflicts:
  - change `PORT` in server `.env` and update `VITE_API_URL` accordingly
- Docker env-file errors:
  - ensure `.env.compose` exists at repo root
- E2E failures due to missing browser:
  - run `npx playwright install --with-deps chromium` in `emotional-aquarium-server`

## 8) Additional docs

- Client details: `emotional-aquarium-client/README.md`
- Server details: `emotional-aquarium-server/README.md`
- Docker profiles: `docs/docker-compose.md`
- BMAD planning and delivery artifacts: `_bmad-output/planning-artifacts` and `_bmad-output/implementation-artifacts`
