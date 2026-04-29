import type {
  AquariumSnapshotErrorResponse,
  AquariumSnapshotSuccessResponse
} from '../types/aquarium'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function getAquariumSnapshot(
  teamAccessKey: string,
  deviceId?: string
): Promise<AquariumSnapshotSuccessResponse | AquariumSnapshotErrorResponse> {
  try {
    const query = deviceId ? `?deviceId=${encodeURIComponent(deviceId)}` : ''
    const response = await fetch(`${API_URL}/aquarium/current${query}`, {
      headers: {
        'x-team-access-key': teamAccessKey
      }
    })

    return (await response.json()) as
      | AquariumSnapshotSuccessResponse
      | AquariumSnapshotErrorResponse
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to load aquarium data right now. Check your connection and try again.'
      }
    }
  }
}

export async function setAquariumDemoMode(
  teamAccessKey: string,
  enabled: boolean
): Promise<{ success: true; data: { demoModeEnabled: boolean } } | AquariumSnapshotErrorResponse> {
  try {
    const response = await fetch(`${API_URL}/aquarium/demo-mode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-team-access-key': teamAccessKey
      },
      body: JSON.stringify({ enabled })
    })

    return (await response.json()) as
      | { success: true; data: { demoModeEnabled: boolean } }
      | AquariumSnapshotErrorResponse
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to update demo mode right now. Check your connection and try again.'
      }
    }
  }
}
