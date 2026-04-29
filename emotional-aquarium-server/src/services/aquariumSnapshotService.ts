import { resolveTeamFromAccessKey } from './teamJoinService.js'
import { getAffirmationCatalog, getCurrentCycle, getTeamSubmissionsForCycle } from './ritualService.js'
import type { AquariumSnapshot } from '../types/aquarium.js'

const demoModeByTeamId = new Map<string, boolean>()

const DEMO_SHAPES = [
  { shape: 'circle', count: 4 },
  { shape: 'triangle', count: 3 },
  { shape: 'wave', count: 3 },
  { shape: 'arc', count: 2 }
]

function getOwnShape(affirmationId: string | undefined): string | null {
  if (!affirmationId) {
    return null
  }

  const match = getAffirmationCatalog().find((item) => item.id === affirmationId)
  return match?.shape ?? null
}

function getShapeSummaryFromAffirmations(affirmationIds: string[]): { shape: string; count: number }[] {
  const shapeByAffirmation = new Map(getAffirmationCatalog().map((item) => [item.id, item.shape]))
  const counts = new Map<string, number>()

  affirmationIds.forEach((affirmationId) => {
    const shape = shapeByAffirmation.get(affirmationId)

    if (!shape) {
      return
    }

    counts.set(shape, (counts.get(shape) ?? 0) + 1)
  })

  return Array.from(counts.entries()).map(([shape, count]) => ({ shape, count }))
}

function getEmptyStateMessage(window: 'morning' | 'afternoon'): string {
  if (window === 'afternoon') {
    return 'The aquarium reset at noon for a fresh cycle. New team shapes will appear as submissions sync.'
  }

  return 'No synced submissions yet for this cycle. Shapes will appear as your team participates.'
}

export function setDemoModeForTeam(teamId: string, enabled: boolean): void {
  demoModeByTeamId.set(teamId, enabled)
}

export function getDemoModeForTeam(teamId: string): boolean {
  return demoModeByTeamId.get(teamId) ?? false
}

export function resetAquariumDemoStateForTests(): void {
  demoModeByTeamId.clear()
}

export function getAquariumSnapshotForAccessKey(
  teamAccessKey: string,
  viewerDeviceId?: string,
  now: Date = new Date()
): AquariumSnapshot | null {
  const record = resolveTeamFromAccessKey(teamAccessKey)

  if (!record) {
    return null
  }

  const cycle = getCurrentCycle(now)
  const isDemoMode = getDemoModeForTeam(record.team.teamId)

  if (isDemoMode) {
    return {
      teamId: record.team.teamId,
      teamName: record.team.teamName,
      cycleLabel: cycle.label,
      cycleWindow: cycle.window,
      participantCount: 12,
      submittedCount: DEMO_SHAPES.reduce((sum, item) => sum + item.count, 0),
      habitatTone: 'demo-glow',
      shapes: DEMO_SHAPES,
      ownShape: null,
      ownContributionVisible: false,
      isDemoMode: true,
      emptyStateMessage: null
    }
  }

  const syncedSubmissions = getTeamSubmissionsForCycle(record.team.teamId, cycle.cycleId).filter(
    (submission) => submission.finalized
  )

  const shapes = getShapeSummaryFromAffirmations(
    syncedSubmissions.map((submission) => submission.affirmationId)
  )

  const ownSubmission = syncedSubmissions.find((submission) => submission.deviceId === viewerDeviceId)
  const ownShape = getOwnShape(ownSubmission?.affirmationId)

  return {
    teamId: record.team.teamId,
    teamName: record.team.teamName,
    cycleLabel: cycle.label,
    cycleWindow: cycle.window,
    participantCount: syncedSubmissions.length,
    submittedCount: syncedSubmissions.length,
    habitatTone: syncedSubmissions.length > 0 ? 'shared-flow' : 'calm-reset',
    shapes,
    ownShape,
    ownContributionVisible: Boolean(ownShape),
    isDemoMode: false,
    emptyStateMessage: shapes.length === 0 ? getEmptyStateMessage(cycle.window) : null
  }
}