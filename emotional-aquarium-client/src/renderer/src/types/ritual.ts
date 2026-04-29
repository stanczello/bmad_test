export type AffirmationDefinition = {
  id: string
  label: string
  shape: string
  category: 'positive'
}

export type RitualCycle = {
  cycleId: string
  label: string
  window: 'morning' | 'afternoon'
  startsAt: string
  endsAt: string
}

export type RitualSubmissionRecord = {
  deviceId: string
  cycleId: string
  affirmationId: string
  status: 'pending' | 'synced'
  finalized: boolean
  updatedAt: string
}

export type QueuedRitualSubmission = {
  queueId: string
  teamAccessKey: string
  deviceId: string
  cycleId: string
  affirmationId: string
  queuedAt: string
  attempts: number
}

export type RitualSuccessResponse<T> = {
  success: true
  data: T
}

export type RitualErrorResponse = {
  success: false
  error: {
    code: string
    message: string
  }
}
