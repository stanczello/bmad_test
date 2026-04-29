export type AffirmationCategory = 'positive'

export type AffirmationDefinition = {
  id: string
  label: string
  shape: string
  category: AffirmationCategory
}

export type RitualCycleWindow = 'morning' | 'afternoon'

export type RitualCycle = {
  cycleId: string
  label: string
  window: RitualCycleWindow
  startsAt: string
  endsAt: string
}

export type SubmissionAction = 'save' | 'finalize'

export type RitualSubmissionRequest = {
  deviceId: string
  cycleId: string
  affirmationId: string
  action: SubmissionAction
}

export type RitualSubmissionRecord = {
  deviceId: string
  cycleId: string
  affirmationId: string
  status: 'pending' | 'synced'
  finalized: boolean
  updatedAt: string
}