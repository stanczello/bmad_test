import type { FastifyPluginAsync } from 'fastify'
import {
  getAquariumSnapshotForAccessKey,
  getDemoModeForTeam,
  setDemoModeForTeam
} from '../services/aquariumSnapshotService.js'
import { publishTeamLiveSnapshot, registerTeamLiveSocket } from '../services/aquariumLiveService.js'
import { resolveTeamFromAccessKey } from '../services/teamJoinService.js'

const aquariumRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { deviceId?: string } }>('/aquarium/current', async (request, reply) => {
    const headerValue = request.headers['x-team-access-key']
    const teamAccessKey = Array.isArray(headerValue) ? headerValue[0] : headerValue
    const deviceId = request.query.deviceId?.trim()

    if (!teamAccessKey?.trim()) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'TEAM_SCOPE_UNAUTHORIZED',
          message: 'Join your team first before requesting aquarium data.'
        }
      })
    }

    const snapshot = getAquariumSnapshotForAccessKey(teamAccessKey.trim(), deviceId)

    if (!snapshot) {
      return reply.code(403).send({
        success: false,
        error: {
          code: 'TEAM_SCOPE_UNAUTHORIZED',
          message: 'This client is not authorized to access that aquarium scope.'
        }
      })
    }

    return reply.code(200).send({
      success: true,
      data: {
        snapshot
      }
    })
  })

  app.post<{ Body: { enabled?: boolean } }>('/aquarium/demo-mode', async (request, reply) => {
    const headerValue = request.headers['x-team-access-key']
    const teamAccessKey = Array.isArray(headerValue) ? headerValue[0] : headerValue

    if (!teamAccessKey?.trim()) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'TEAM_SCOPE_UNAUTHORIZED',
          message: 'Join your team first before toggling demo mode.'
        }
      })
    }

    const teamRecord = resolveTeamFromAccessKey(teamAccessKey.trim())

    if (!teamRecord) {
      return reply.code(403).send({
        success: false,
        error: {
          code: 'TEAM_SCOPE_UNAUTHORIZED',
          message: 'This client is not authorized to change demo mode for that scope.'
        }
      })
    }

    const enabled = Boolean(request.body?.enabled)
    setDemoModeForTeam(teamRecord.team.teamId, enabled)

    const snapshot = getAquariumSnapshotForAccessKey(teamAccessKey.trim())

    if (snapshot) {
      publishTeamLiveSnapshot(teamRecord.team.teamId, {
        type: 'snapshot:update',
        snapshot
      })
    }

    return reply.code(200).send({
      success: true,
      data: {
        demoModeEnabled: getDemoModeForTeam(teamRecord.team.teamId)
      }
    })
  })

  app.get('/aquarium/live', { websocket: true }, (socket, request) => {
    const query = request.query as { teamAccessKey?: string; deviceId?: string }
    const teamAccessKey = query.teamAccessKey?.trim()

    if (!teamAccessKey) {
      socket.close()
      return
    }

    const teamRecord = resolveTeamFromAccessKey(teamAccessKey)

    if (!teamRecord) {
      socket.close()
      return
    }

    registerTeamLiveSocket(teamRecord.team.teamId, socket)

    const snapshot = getAquariumSnapshotForAccessKey(teamAccessKey, query.deviceId?.trim())

    if (!snapshot) {
      socket.close()
      return
    }

    socket.send(
      JSON.stringify({
        type: 'snapshot:update',
        snapshot
      })
    )
  })
}

export default aquariumRoutes