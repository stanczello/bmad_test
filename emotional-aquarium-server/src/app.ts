import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import aquariumRoutes from './routes/aquarium.js'
import ritualRoutes from './routes/ritual.js'
import teamsRoutes from './routes/teams.js'
import { getOperationalDiagnostics, recordHealthEvent } from './services/healthService.js'

export { recordHealthEvent }

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true })

  app.register(cors, { origin: true })
  app.register(websocket)
  app.register(teamsRoutes)
  app.register(aquariumRoutes)
  app.register(ritualRoutes)

  app.get('/health', async () => {
    return {
      success: true,
      data: {
        status: 'ok'
      }
    }
  })

  app.get('/health/diagnostics', async () => {
    return {
      success: true,
      data: {
        status: 'ok',
        releaseChannel: process.env['RELEASE_CHANNEL'] ?? 'stable',
        diagnostics: getOperationalDiagnostics()
      }
    }
  })

  return app
}
