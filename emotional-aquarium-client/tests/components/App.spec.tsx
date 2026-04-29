import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../../src/renderer/src/App'

const originalFetch = global.fetch
const originalApi = (window as Window & { api?: { getDeviceId?: () => Promise<string> } }).api

vi.mock('../../src/renderer/src/components/aquarium/AquariumCanvas', () => ({
  default: () => <div data-testid="aquarium-canvas" />
}))

vi.mock('../../src/renderer/src/components/screens/ShapePickerScreen', () => ({
  default: ({ onSubmitted }: { onSubmitted: () => void }) => (
    <button type="button" onClick={onSubmitted}>
      Mock submit shape
    </button>
  )
}))

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    ;(window as Window & { api: { getDeviceId: () => Promise<string> } }).api = {
      getDeviceId: vi.fn().mockResolvedValue('anon_app_test')
    }
  })

  it('joins team, then transitions from picker to aquarium and loads snapshot', async () => {
    global.fetch = vi.fn(async (input) => {
      const url = String(input)

      if (url.includes('/teams/join')) {
        return {
          json: async () => ({
            success: true,
            data: {
              team: {
                teamId: 'team-alpha',
                companyId: 'company-bmad',
                teamName: 'Alpha Team'
              },
              teamAccessKey: 'scope_alpha_collective'
            }
          })
        } as Response
      }

      return {
        json: async () => ({
          success: true,
          data: {
            snapshot: {
              teamId: 'team-alpha',
              teamName: 'Alpha Team',
              cycleLabel: 'Cycle 1',
              participantCount: 1,
              submittedCount: 1,
              habitatTone: 'calm-current',
              ownShape: 'circle',
              ownContributionVisible: true,
              shapes: [{ shape: 'circle', count: 1 }]
            }
          }
        })
      } as Response
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mock submit shape/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /mock submit shape/i }))

    await waitFor(() => {
      expect(screen.getByTestId('aquarium-canvas')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/teams/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ teamJoinToken: 'TEAM-ALPHA-2026' })
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/aquarium/current?deviceId=anon_app_test',
      {
        headers: {
          'x-team-access-key': 'scope_alpha_collective'
        }
      }
    )
  })

  it('shows startup error when join fails', async () => {
    global.fetch = vi.fn(async (input) => {
      const url = String(input)

      if (url.includes('/teams/join')) {
        return {
          json: async () => ({
            success: false,
            error: {
              code: 'TEAM_TOKEN_INVALID_OR_EXPIRED',
              message: 'Join failed for test.'
            }
          })
        } as Response
      }

      return {
        json: async () => ({ success: true, data: {} })
      } as Response
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/join failed for test/i)).toBeInTheDocument()
    })

    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/aquarium/current'),
      expect.anything()
    )
  })
})

afterAll(() => {
  global.fetch = originalFetch
  ;(window as Window & { api?: { getDeviceId?: () => Promise<string> } }).api = originalApi
})
