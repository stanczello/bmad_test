export type TeamScope = {
  teamId: string
  companyId: string
  teamName: string
}

export type TeamJoinRequest = {
  teamJoinToken: string
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

export type TeamAccessRecord = {
  team: TeamScope
  teamAccessKey: string
}
