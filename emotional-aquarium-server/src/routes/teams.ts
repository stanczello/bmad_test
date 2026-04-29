import type { FastifyPluginAsync } from 'fastify'
import { resolveTeamFromToken, validateTokenFormat } from '../services/teamJoinService.js'
import { recordHealthEvent } from '../services/healthService.js'
import type { TeamJoinRequest } from '../types/team.js'

const teamsRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: TeamJoinRequest }>('/teams/join', async (request, reply) => {
    const token = request.body?.teamJoinToken?.trim()

    if (!token || !validateTokenFormat(token)) {
      recordHealthEvent('team:join-invalid-token')
      return reply.code(400).send({
        success: false,
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Enter a valid team token in the format provided by your rollout owner.'
        }
      })
    }

    const record = resolveTeamFromToken(token)

    if (!record) {
      recordHealthEvent('team:join-invalid-token')
      return reply.code(401).send({
        success: false,
        error: {
          code: 'TEAM_TOKEN_INVALID_OR_EXPIRED',
          message: 'This team token is invalid or expired. Ask your rollout owner for a fresh token.'
        }
      })
    }

    recordHealthEvent('team:join-success')
    return reply.code(200).send({
      success: true,
      data: {
        team: record.team,
        teamAccessKey: record.teamAccessKey
      }
    })
  })
}

export default teamsRoutes
