import type { TeamJoinErrorResponse, TeamJoinSuccessResponse } from '../types/team'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function joinTeam(
  teamJoinToken: string
): Promise<TeamJoinSuccessResponse | TeamJoinErrorResponse> {
  try {
    const response = await fetch(`${API_URL}/teams/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ teamJoinToken })
    })

    return (await response.json()) as TeamJoinSuccessResponse | TeamJoinErrorResponse
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to reach the server. Check your connection and try again.'
      }
    }
  }
}
