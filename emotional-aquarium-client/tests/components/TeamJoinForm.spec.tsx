import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import TeamJoinForm from '../../src/renderer/src/components/submission/TeamJoinForm'
import { useTeamStore } from '../../src/renderer/src/stores/useTeamStore'

const originalFetch = global.fetch
const originalApi = (window as Window & { api?: { getDeviceId?: () => Promise<string> } }).api

describe('TeamJoinForm', () => {
  beforeEach(() => {
    useTeamStore.getState().clearTeamScope()
    vi.restoreAllMocks()
    ;(window as Window & { api: { getDeviceId: () => Promise<string> } }).api = {
      getDeviceId: vi.fn().mockResolvedValue('anon_test_device')
    }
  })

  it('joins team and updates store on valid token', async () => {
    global.fetch = vi.fn().mockResolvedValue({
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
    } as Response)

    render(<TeamJoinForm />)

    fireEvent.change(screen.getByLabelText(/team join token/i), {
      target: { value: 'TEAM-ALPHA-2026' }
    })
    fireEvent.click(screen.getByRole('button', { name: /join team/i }))

    await waitFor(() => {
      expect(useTeamStore.getState().teamScope?.teamId).toBe('team-alpha')
    })
    expect(useTeamStore.getState().teamAccessKey).toBe('scope_alpha_collective')
    expect(window.api.getDeviceId).toHaveBeenCalledTimes(1)
  })

  it('shows recovery guidance when token is invalid', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: false,
        error: {
          code: 'TEAM_TOKEN_INVALID_OR_EXPIRED',
          message:
            'This team token is invalid or expired. Ask your rollout owner for a fresh token.'
        }
      })
    } as Response)

    render(<TeamJoinForm />)

    fireEvent.change(screen.getByLabelText(/team join token/i), {
      target: { value: 'TEAM-UNKNOWN-2026' }
    })
    fireEvent.click(screen.getByRole('button', { name: /join team/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired/i)).toBeInTheDocument()
    })
  })
})

afterAll(() => {
  global.fetch = originalFetch
  ;(window as Window & { api?: { getDeviceId?: () => Promise<string> } }).api = originalApi
})
