import { create } from 'zustand'
import type { TeamScope, TeamSession } from '../types/team'

const TEAM_SCOPE_STORAGE_KEY = 'aquarium.teamScope'

type TeamState = {
  teamScope: TeamScope | null
  teamAccessKey: string | null
  setTeamScope: (team: TeamScope, teamAccessKey: string) => void
  clearTeamScope: () => void
}

function isLegacyTeamScope(value: unknown): value is TeamScope {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'teamId' in value &&
    'companyId' in value &&
    'teamName' in value
  )
}

function loadStoredTeamSession(): TeamSession | null {
  try {
    const raw = window.localStorage.getItem(TEAM_SCOPE_STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as TeamSession | TeamScope

    if (
      parsed &&
      typeof parsed === 'object' &&
      'team' in parsed &&
      parsed.team &&
      typeof parsed.teamAccessKey === 'string'
    ) {
      return parsed as TeamSession
    }

    if (isLegacyTeamScope(parsed)) {
      return {
        team: parsed,
        teamAccessKey: null
      }
    }

    return null
  } catch {
    return null
  }
}

function persistTeamScope(teamSession: TeamSession | null): void {
  try {
    if (!teamSession) {
      window.localStorage.removeItem(TEAM_SCOPE_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(TEAM_SCOPE_STORAGE_KEY, JSON.stringify(teamSession))
  } catch {
    // Ignore persistence failures in foundation story.
  }
}

const storedTeamSession = loadStoredTeamSession()

export const useTeamStore = create<TeamState>((set) => ({
  teamScope: storedTeamSession?.team ?? null,
  teamAccessKey: storedTeamSession?.teamAccessKey ?? null,
  setTeamScope: (team, teamAccessKey) => {
    persistTeamScope({ team, teamAccessKey })
    set({ teamScope: team, teamAccessKey })
  },
  clearTeamScope: () => {
    persistTeamScope(null)
    set({ teamScope: null, teamAccessKey: null })
  }
}))
