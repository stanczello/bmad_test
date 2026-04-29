import type {
  AffirmationDefinition,
  QueuedRitualSubmission,
  RitualCycle,
  RitualErrorResponse,
  RitualSubmissionRecord,
  RitualSuccessResponse
} from '../types/ritual'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function getHeaders(teamAccessKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-team-access-key': teamAccessKey
  }
}

export async function getAffirmations(
  teamAccessKey: string
): Promise<RitualSuccessResponse<{ affirmations: AffirmationDefinition[] }> | RitualErrorResponse> {
  try {
    const response = await fetch(`${API_URL}/ritual/affirmations`, {
      headers: {
        'x-team-access-key': teamAccessKey
      }
    })

    return (await response.json()) as
      | RitualSuccessResponse<{ affirmations: AffirmationDefinition[] }>
      | RitualErrorResponse
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to load affirmations right now. Check your connection and try again.'
      }
    }
  }
}

export async function getCurrentCycle(
  teamAccessKey: string
): Promise<RitualSuccessResponse<{ cycle: RitualCycle }> | RitualErrorResponse> {
  try {
    const response = await fetch(`${API_URL}/ritual/cycle/current`, {
      headers: {
        'x-team-access-key': teamAccessKey
      }
    })

    return (await response.json()) as
      | RitualSuccessResponse<{ cycle: RitualCycle }>
      | RitualErrorResponse
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to load cycle context right now. Check your connection and try again.'
      }
    }
  }
}

export async function getSubmissionForCycle(input: {
  teamAccessKey: string
  deviceId: string
  cycleId?: string
}): Promise<
  RitualSuccessResponse<{ submission: RitualSubmissionRecord | null }> | RitualErrorResponse
> {
  try {
    const url = new URL(`${API_URL}/ritual/submission`)
    url.searchParams.set('deviceId', input.deviceId)
    if (input.cycleId) {
      url.searchParams.set('cycleId', input.cycleId)
    }

    const response = await fetch(url.toString(), {
      headers: {
        'x-team-access-key': input.teamAccessKey
      }
    })

    return (await response.json()) as
      | RitualSuccessResponse<{ submission: RitualSubmissionRecord | null }>
      | RitualErrorResponse
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message:
          'Unable to load your current submission right now. Check your connection and try again.'
      }
    }
  }
}

export async function saveRitualSelection(input: {
  teamAccessKey: string
  deviceId: string
  cycleId: string
  affirmationId: string
}): Promise<
  | RitualSuccessResponse<{ submission: RitualSubmissionRecord; stateLabel: string }>
  | RitualErrorResponse
> {
  try {
    const response = await fetch(`${API_URL}/ritual/submission`, {
      method: 'POST',
      headers: getHeaders(input.teamAccessKey),
      body: JSON.stringify({
        deviceId: input.deviceId,
        cycleId: input.cycleId,
        affirmationId: input.affirmationId,
        action: 'save'
      })
    })

    return (await response.json()) as
      | RitualSuccessResponse<{ submission: RitualSubmissionRecord; stateLabel: string }>
      | RitualErrorResponse
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to save your selection right now. Check your connection and try again.'
      }
    }
  }
}

export async function finalizeRitualSelection(input: {
  teamAccessKey: string
  deviceId: string
  cycleId: string
  affirmationId: string
}): Promise<
  | RitualSuccessResponse<{ submission: RitualSubmissionRecord; stateLabel: string }>
  | RitualErrorResponse
> {
  try {
    const response = await fetch(`${API_URL}/ritual/submission`, {
      method: 'POST',
      headers: getHeaders(input.teamAccessKey),
      body: JSON.stringify({
        deviceId: input.deviceId,
        cycleId: input.cycleId,
        affirmationId: input.affirmationId,
        action: 'finalize'
      })
    })

    return (await response.json()) as
      | RitualSuccessResponse<{ submission: RitualSubmissionRecord; stateLabel: string }>
      | RitualErrorResponse
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message:
          'Unable to finalize your submission right now. Check your connection and try again.'
      }
    }
  }
}

export async function replayQueuedFinalization(
  queued: QueuedRitualSubmission
): Promise<
  | RitualSuccessResponse<{ submission: RitualSubmissionRecord; stateLabel: string }>
  | RitualErrorResponse
> {
  return finalizeRitualSelection({
    teamAccessKey: queued.teamAccessKey,
    deviceId: queued.deviceId,
    cycleId: queued.cycleId,
    affirmationId: queued.affirmationId
  })
}

export function isOfflineMode(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }

  return navigator.onLine === false
}
