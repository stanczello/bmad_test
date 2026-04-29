# emotional-aquarium-server

Fastify + TypeScript backend scaffold for Emotional Aquarium.

## Prerequisites

- Node.js 20+
- npm 10+

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
```

## Health Endpoint

```bash
GET /health
```

Response format:

```json
{ "success": true, "data": { "status": "ok" } }
```

## Environment

Copy `.env.example` to `.env` and adjust local values.
