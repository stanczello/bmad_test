import type { TeamAccessRecord } from '../types/team.js'

const TOKEN_PATTERN = /^[A-Z0-9-]{6,64}$/

const TEAM_ACCESS_BY_TOKEN: Record<string, TeamAccessRecord> = {
  'TEAM-ALPHA-2026': {
    team: {
      teamId: 'team-alpha',
      companyId: 'company-bmad',
      teamName: 'Alpha Team'
    },
    teamAccessKey: 'scope_alpha_collective'
  },
  'TEAM-BETA-2026': {
    team: {
      teamId: 'team-beta',
      companyId: 'company-bmad',
      teamName: 'Beta Team'
    },
    teamAccessKey: 'scope_beta_collective'
  }
}

const TEAM_ACCESS_BY_KEY: Record<string, TeamAccessRecord> = Object.values(TEAM_ACCESS_BY_TOKEN).reduce(
  (accumulator, record) => {
    accumulator[record.teamAccessKey] = record
    return accumulator
  },
  {} as Record<string, TeamAccessRecord>
)

export function validateTokenFormat(token: string): boolean {
  return TOKEN_PATTERN.test(token)
}

export function resolveTeamFromToken(token: string): TeamAccessRecord | null {
  return TEAM_ACCESS_BY_TOKEN[token] ?? null
}

export function resolveTeamFromAccessKey(teamAccessKey: string): TeamAccessRecord | null {
  return TEAM_ACCESS_BY_KEY[teamAccessKey] ?? null
}
