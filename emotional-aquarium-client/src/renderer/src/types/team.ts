export type TeamScope = {
  teamId: string
  companyId: string
  teamName: string
}

export type TeamSession = {
  team: TeamScope
  teamAccessKey: string | null
}

export type TeamJoinSuccessResponse = {
  success: true
  data: {
    team: TeamScope
    teamAccessKey: string
  }
}

export type TeamJoinErrorResponse = {
  success: false
  error: {
    code: string
    message: string
  }
}
