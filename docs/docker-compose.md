# Docker Compose Guide

This project includes a profile-based `docker-compose.yml` to support production-like runtime, development, and test automation.

## Environment setup

1. Copy `.env.compose.example` to `.env.compose`.
2. Adjust ports and environment values as needed.

## Services

- `backend`: Node/Fastify API container on `${BACKEND_PORT}`.
- `frontend`: Renderer preview container on `${FRONTEND_PORT}`.
- `backend-dev` (profile `dev`): bind-mounted backend development container (`npm run dev`).
- `server-tests` (profile `test`): runs server coverage tests.
- `server-e2e` (profile `test`): runs Playwright e2e tests against `backend`.

## Health checks

- Backend health endpoint: `GET /health`.
- Frontend health probe: `GET /`.
- Health state can be inspected with:

```bash
docker compose ps
```

## Logs

Container logs are available via:

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
```

## Common commands

### Production-like runtime

```bash
docker compose --env-file .env.compose up --build
```

### Development profile

```bash
docker compose --env-file .env.compose --profile dev up backend-dev
```

### Test profile

```bash
docker compose --env-file .env.compose --profile test up --build server-tests

docker compose --env-file .env.compose --profile test up --build backend server-e2e
```

### Tear down

```bash
docker compose down
```
