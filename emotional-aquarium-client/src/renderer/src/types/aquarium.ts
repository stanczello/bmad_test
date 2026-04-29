export type AquariumShapeSummary = {
  shape: string
  count: number
}

export type AquariumSnapshot = {
  teamId: string
  teamName: string
  cycleLabel: string
  cycleWindow: 'morning' | 'afternoon'
  participantCount: number
  submittedCount: number
  habitatTone: string
  shapes: AquariumShapeSummary[]
  ownShape: string | null
  ownContributionVisible: boolean
  isDemoMode: boolean
  emptyStateMessage: string | null
}

export type AquariumSnapshotSuccessResponse = {
  success: true
  data: {
    snapshot: AquariumSnapshot
  }
}

export type AquariumSnapshotErrorResponse = {
  success: false
  error: {
    code: string
    message: string
  }
}
