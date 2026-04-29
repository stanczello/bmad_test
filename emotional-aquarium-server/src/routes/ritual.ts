import type { FastifyPluginAsync } from 'fastify'
import {
  getAffirmationCatalog,
  getCurrentCycle,
  resetTeamSubmissionsForCycle,
  getSubmissionForCycle,
  upsertSubmissionForCycle
} from '../services/ritualService.js'
import { getAquariumSnapshotForAccessKey } from '../services/aquariumSnapshotService.js'
import { publishTeamLiveSnapshot } from '../services/aquariumLiveService.js'
import { resolveTeamFromAccessKey } from '../services/teamJoinService.js'
import { recordHealthEvent } from '../services/healthService.js'
import type { RitualSubmissionRequest } from '../types/ritual.js'

function getTeamAccessKey(rawHeader: string | string[] | undefined): string | null {
  const value = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader
  return value?.trim() ? value.trim() : null
}

function getAuthorizedTeam(teamAccessKey: string | null): { teamId: string } | null {
  if (!teamAccessKey) {
    return null
  }

  const record = resolveTeamFromAccessKey(teamAccessKey)

  if (!record) {
    return null
  }

  return { teamId: record.team.teamId }
}

const ritualRoutes: FastifyPluginAsync = async (app) => {
  app.get('/ritual/affirmations', async (request, reply) => {
    const teamAccessKey = getTeamAccessKey(request.headers['x-team-access-key'])
    const authorizedTeam = getAuthorizedTeam(teamAccessKey)

    if (!authorizedTeam) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'TEAM_SCOPE_UNAUTHORIZED',
          message: 'Join your team before opening affirmations.'
        }
      })
    }

    return reply.code(200).send({
      success: true,
      data: {
        affirmations: getAffirmationCatalog()
      }
    })
  })

  app.get('/ritual/cycle/current', async (request, reply) => {
    const teamAccessKey = getTeamAccessKey(request.headers['x-team-access-key'])
    const authorizedTeam = getAuthorizedTeam(teamAccessKey)

    if (!authorizedTeam) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'TEAM_SCOPE_UNAUTHORIZED',
          message: 'Join your team before requesting cycle context.'
        }
      })
    }

    return reply.code(200).send({
      success: true,
      data: {
        cycle: getCurrentCycle()
      }
    })
  })

  app.get<{ Querystring: { deviceId?: string; cycleId?: string } }>(
    '/ritual/submission',
    async (request, reply) => {
      const teamAccessKey = getTeamAccessKey(request.headers['x-team-access-key'])
      const authorizedTeam = getAuthorizedTeam(teamAccessKey)

      if (!authorizedTeam) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'TEAM_SCOPE_UNAUTHORIZED',
            message: 'Join your team before requesting submission state.'
          }
        })
      }

      const deviceId = request.query.deviceId?.trim()
      const cycleId = request.query.cycleId?.trim() ?? getCurrentCycle().cycleId

      if (!deviceId) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'DEVICE_ID_REQUIRED',
            message: 'A local anonymous device id is required to load submission state.'
          }
        })
      }

      return reply.code(200).send({
        success: true,
        data: {
          submission: getSubmissionForCycle(authorizedTeam.teamId, cycleId, deviceId)
        }
      })
    }
  )

  app.post<{ Body: RitualSubmissionRequest }>('/ritual/submission', async (request, reply) => {
    const teamAccessKey = getTeamAccessKey(request.headers['x-team-access-key'])
    const authorizedTeam = getAuthorizedTeam(teamAccessKey)

    if (!authorizedTeam) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'TEAM_SCOPE_UNAUTHORIZED',
          message: 'Join your team before submitting an affirmation.'
        }
      })
    }

    const deviceId = request.body?.deviceId?.trim()
    const cycleId = request.body?.cycleId?.trim()
    const affirmationId = request.body?.affirmationId?.trim()
    const action = request.body?.action

    if (!deviceId || !cycleId || !affirmationId || (action !== 'save' && action !== 'finalize')) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'INVALID_SUBMISSION_REQUEST',
          message: 'Provide device, cycle, affirmation, and action to submit for this ritual.'
        }
      })
    }

    const result = upsertSubmissionForCycle({
      teamId: authorizedTeam.teamId,
      deviceId,
      cycleId,
      affirmationId,
      action
    })

    if (!result.success) {
      if (result.code === 'OUT_OF_CYCLE') {
        recordHealthEvent('submission:out-of-cycle')
      } else if (result.code === 'DUPLICATE_CYCLE_SUBMISSION') {
        recordHealthEvent('submission:duplicate')
      }
      return reply.code(result.statusCode).send({
        success: false,
        error: {
          code: result.code,
          message: result.message
        }
      })
    }

    const liveSnapshot = teamAccessKey ? getAquariumSnapshotForAccessKey(teamAccessKey, deviceId) : null

    if (liveSnapshot) {
      publishTeamLiveSnapshot(authorizedTeam.teamId, {
        type: 'snapshot:update',
        snapshot: liveSnapshot
      })
      recordHealthEvent('aquarium:live-push')
    }

    recordHealthEvent(result.record.finalized ? 'submission:finalized' : 'submission:saved')

    return reply.code(200).send({
      success: true,
      data: {
        submission: result.record,
        stateLabel: result.record.finalized
          ? 'Submitted and synced for this cycle.'
          : 'Saved as pending for this cycle.'
      }
    })
  })

  app.post<{ Body: { cycleId?: string } }>('/ritual/submission/reset', async (request, reply) => {
    const teamAccessKey = getTeamAccessKey(request.headers['x-team-access-key'])
    const authorizedTeam = getAuthorizedTeam(teamAccessKey)

    if (!authorizedTeam) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'TEAM_SCOPE_UNAUTHORIZED',
          message: 'Join your team before resetting submissions.'
        }
      })
    }

    const cycleId = request.body?.cycleId?.trim() ?? getCurrentCycle().cycleId
    const removedCount = resetTeamSubmissionsForCycle(authorizedTeam.teamId, cycleId)

    recordHealthEvent('submission:reset-cycle')

    return reply.code(200).send({
      success: true,
      data: {
        cycleId,
        removedCount
      }
    })
  })
}

export default ritualRoutes
