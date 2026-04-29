import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { TeamScope } from '../../src/renderer/src/types/team'

const STORAGE_KEY = 'aquarium.teamScope'

describe('useTeamStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.resetModules()
  })

  it('loads persisted team scope on first import', async () => {
    const persisted: TeamScope = {
      teamId: 'team-alpha',
      companyId: 'company-bmad',
      teamName: 'Alpha Team'
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ team: persisted, teamAccessKey: 'scope_alpha_collective' })
    )
    const { useTeamStore } = await import('../../src/renderer/src/stores/useTeamStore')
    expect(useTeamStore.getState().teamScope).toMatchObject(persisted)
    expect(useTeamStore.getState().teamAccessKey).toBe('scope_alpha_collective')
  })

  it('persists team scope and access key when setTeamScope is called', async () => {
    const { useTeamStore } = await import('../../src/renderer/src/stores/useTeamStore')

    useTeamStore.getState().setTeamScope(
      {
        teamId: 'team-beta',
        companyId: 'company-bmad',
        teamName: 'Beta Team'
      },
      'scope_beta_collective'
    )

    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('team-beta')
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('scope_beta_collective')
  })

  it('clears team scope persistence when clearTeamScope is called', async () => {
    const { useTeamStore } = await import('../../src/renderer/src/stores/useTeamStore')

    useTeamStore.getState().setTeamScope(
      {
        teamId: 'team-beta',
        companyId: 'company-bmad',
        teamName: 'Beta Team'
      },
      'scope_beta_collective'
    )
    useTeamStore.getState().clearTeamScope()

    expect(useTeamStore.getState().teamScope).toBeNull()
    expect(useTeamStore.getState().teamAccessKey).toBeNull()
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('gracefully loads legacy stored team scope without an access key', async () => {
    const persisted: TeamScope = {
      teamId: 'team-alpha',
      companyId: 'company-bmad',
      teamName: 'Alpha Team'
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    const { useTeamStore } = await import('../../src/renderer/src/stores/useTeamStore')

    expect(useTeamStore.getState().teamScope).toMatchObject(persisted)
    expect(useTeamStore.getState().teamAccessKey).toBeNull()
  })
})
