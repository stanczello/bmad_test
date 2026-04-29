import type {
  AffirmationDefinition,
  RitualCycle,
  RitualCycleWindow,
  RitualSubmissionRecord,
  SubmissionAction
} from '../types/ritual.js'

const RITUAL_AFFIRMATIONS: AffirmationDefinition[] = [
  { id: 'affirm-calm', label: 'I bring calm focus to my team.', shape: 'circle', category: 'positive' },
  {
    id: 'affirm-curious',
    label: 'I stay open and curious in challenges.',
    shape: 'triangle',
    category: 'positive'
  },
  {
    id: 'affirm-grounded',
    label: 'I can reset and choose a grounded response.',
    shape: 'square',
    category: 'positive'
  },
  { id: 'affirm-kind', label: 'I contribute with kindness today.', shape: 'wave', category: 'positive' },
  {
    id: 'affirm-resilient',
    label: 'I can recover and keep moving forward.',
    shape: 'arc',
    category: 'positive'
  }
]

const submissionStore = new Map<string, RitualSubmissionRecord>()

function toIso(date: Date): string {
  return date.toISOString()
}

function startOfDay(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

function buildCycleId(date: Date, window: RitualCycleWindow): string {
  const day = date.toISOString().slice(0, 10)
  return `${day}-${window}`
}

function buildStoreKey(teamId: string, cycleId: string, deviceId: string): string {
  return `${teamId}::${cycleId}::${deviceId}`
}

export function getCurrentCycle(now: Date = new Date()): RitualCycle {
  const hour = now.getHours()
  const window: RitualCycleWindow = hour < 12 ? 'morning' : 'afternoon'

  const dayStart = startOfDay(now)
  const startsAt = new Date(dayStart)
  const endsAt = new Date(dayStart)

  if (window === 'morning') {
    startsAt.setHours(0, 0, 0, 0)
    endsAt.setHours(11, 59, 59, 999)
  } else {
    startsAt.setHours(12, 0, 0, 0)
    endsAt.setHours(23, 59, 59, 999)
  }

  return {
    cycleId: buildCycleId(now, window),
    label: window === 'morning' ? 'Morning cycle' : 'Afternoon cycle',
    window,
    startsAt: toIso(startsAt),
    endsAt: toIso(endsAt)
  }
}

export function getAffirmationCatalog(): AffirmationDefinition[] {
  return RITUAL_AFFIRMATIONS
}

type UpsertResult =
  | { success: true; record: RitualSubmissionRecord }
  | { success: false; statusCode: 409; code: string; message: string }

export function upsertSubmissionForCycle(input: {
  teamId: string
  deviceId: string
  cycleId: string
  affirmationId: string
  action: SubmissionAction
  now?: Date
}): UpsertResult {
  const cycle = getCurrentCycle(input.now)

  if (input.cycleId !== cycle.cycleId) {
    return {
      success: false,
      statusCode: 409,
      code: 'OUT_OF_CYCLE',
      message: 'That submission targets a different cycle. Refresh and submit in the active cycle.'
    }
  }

  const affirmation = RITUAL_AFFIRMATIONS.find((item) => item.id === input.affirmationId)

  if (!affirmation) {
    return {
      success: false,
      statusCode: 409,
      code: 'INVALID_AFFIRMATION',
      message: 'Choose one of the available positive affirmations for this cycle.'
    }
  }

  const key = buildStoreKey(input.teamId, input.cycleId, input.deviceId)
  const existing = submissionStore.get(key)

  if (existing?.finalized) {
    return {
      success: false,
      statusCode: 409,
      code: 'DUPLICATE_CYCLE_SUBMISSION',
      message: 'A final submission is already recorded for this cycle.'
    }
  }

  const finalized = input.action === 'finalize'

  const record: RitualSubmissionRecord = {
    deviceId: input.deviceId,
    cycleId: input.cycleId,
    affirmationId: input.affirmationId,
    status: finalized ? 'synced' : 'pending',
    finalized,
    updatedAt: toIso(input.now ?? new Date())
  }

  submissionStore.set(key, record)
  return {
    success: true,
    record
  }
}

export function getSubmissionForCycle(teamId: string, cycleId: string, deviceId: string): RitualSubmissionRecord | null {
  const key = buildStoreKey(teamId, cycleId, deviceId)
  return submissionStore.get(key) ?? null
}

export function getTeamSubmissionsForCycle(teamId: string, cycleId: string): RitualSubmissionRecord[] {
  const teamPrefix = `${teamId}::${cycleId}::`

  return Array.from(submissionStore.entries())
    .filter(([key]) => key.startsWith(teamPrefix))
    .map(([, record]) => record)
}

export function resetTeamSubmissionsForCycle(teamId: string, cycleId: string): number {
  const teamPrefix = `${teamId}::${cycleId}::`
  let removedCount = 0

  for (const key of submissionStore.keys()) {
    if (!key.startsWith(teamPrefix)) {
      continue
    }

    submissionStore.delete(key)
    removedCount += 1
  }

  return removedCount
}

export function resetRitualStoreForTests(): void {
  submissionStore.clear()
}