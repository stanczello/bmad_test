import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import AffirmationRitualPanel from '../../src/renderer/src/components/submission/AffirmationRitualPanel'
import { useRitualStore } from '../../src/renderer/src/stores/useRitualStore'

const originalFetch = global.fetch

describe('AffirmationRitualPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
    useRitualStore.getState().clearRitualState()
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true
    })
  })

  it('loads positive affirmations and shows cycle context', async () => {
    global.fetch = vi.fn(async (input) => {
      const url = String(input)

      if (url.includes('/ritual/cycle/current')) {
        return {
          json: async () => ({
            success: true,
            data: {
              cycle: {
                cycleId: '2026-04-29-morning',
                label: 'Morning cycle',
                window: 'morning',
                startsAt: '2026-04-29T00:00:00.000Z',
                endsAt: '2026-04-29T11:59:59.999Z'
              }
            }
          })
        } as Response
      }

      return {
        json: async () => ({
          success: true,
          data: {
            affirmations: [
              {
                id: 'affirm-calm',
                label: 'I bring calm focus to my team.',
                shape: 'circle',
                category: 'positive'
              },
              {
                id: 'affirm-kind',
                label: 'I contribute with kindness today.',
                shape: 'wave',
                category: 'positive'
              }
            ]
          }
        })
      } as Response
    })

    render(<AffirmationRitualPanel teamAccessKey="scope_alpha_collective" deviceId="anon_test" />)

    await waitFor(() => {
      expect(screen.getByText(/active cycle/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/morning cycle/i)).toBeInTheDocument()
    expect(screen.getByText(/shape: circle/i)).toBeInTheDocument()
    expect(screen.queryByText(/negative/i)).not.toBeInTheDocument()
  })

  it('supports in-cycle update before finalization and then final sync state', async () => {
    global.fetch = vi.fn(async (input, init) => {
      const url = String(input)

      if (url.includes('/ritual/cycle/current')) {
        return {
          json: async () => ({
            success: true,
            data: {
              cycle: {
                cycleId: '2026-04-29-morning',
                label: 'Morning cycle',
                window: 'morning',
                startsAt: '2026-04-29T00:00:00.000Z',
                endsAt: '2026-04-29T11:59:59.999Z'
              }
            }
          })
        } as Response
      }

      if (url.includes('/ritual/affirmations')) {
        return {
          json: async () => ({
            success: true,
            data: {
              affirmations: [
                {
                  id: 'affirm-calm',
                  label: 'I bring calm focus to my team.',
                  shape: 'circle',
                  category: 'positive'
                },
                {
                  id: 'affirm-kind',
                  label: 'I contribute with kindness today.',
                  shape: 'wave',
                  category: 'positive'
                }
              ]
            }
          })
        } as Response
      }

      const body = JSON.parse(String(init?.body ?? '{}')) as {
        affirmationId?: string
        action?: 'save' | 'finalize'
      }

      if (body.action === 'save') {
        return {
          json: async () => ({
            success: true,
            data: {
              submission: {
                deviceId: 'anon_test',
                cycleId: '2026-04-29-morning',
                affirmationId: body.affirmationId,
                status: 'pending',
                finalized: false,
                updatedAt: '2026-04-29T08:00:00.000Z'
              },
              stateLabel: 'Saved as pending for this cycle.'
            }
          })
        } as Response
      }

      return {
        json: async () => ({
          success: true,
          data: {
            submission: {
              deviceId: 'anon_test',
              cycleId: '2026-04-29-morning',
              affirmationId: body.affirmationId,
              status: 'synced',
              finalized: true,
              updatedAt: '2026-04-29T08:10:00.000Z'
            },
            stateLabel: 'Submitted and synced for this cycle.'
          }
        })
      } as Response
    })

    render(<AffirmationRitualPanel teamAccessKey="scope_alpha_collective" deviceId="anon_test" />)

    await waitFor(() => {
      expect(screen.getByText(/i bring calm focus to my team/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/i bring calm focus to my team/i))
    await waitFor(() => {
      expect(screen.getByText(/saved as pending for this cycle/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/i contribute with kindness today/i))
    await waitFor(() => {
      expect(screen.getByText(/saved as pending for this cycle/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /submit for this cycle/i }))
    await waitFor(() => {
      expect(screen.getByText(/submitted/i)).toBeInTheDocument()
    })
  })

  it('queues finalization while offline and keeps it across remount', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false
    })

    global.fetch = vi.fn(async (input) => {
      const url = String(input)

      if (url.includes('/ritual/cycle/current')) {
        return {
          json: async () => ({
            success: true,
            data: {
              cycle: {
                cycleId: '2026-04-29-morning',
                label: 'Morning cycle',
                window: 'morning',
                startsAt: '2026-04-29T00:00:00.000Z',
                endsAt: '2026-04-29T11:59:59.999Z'
              }
            }
          })
        } as Response
      }

      return {
        json: async () => ({
          success: true,
          data: {
            affirmations: [
              {
                id: 'affirm-calm',
                label: 'I bring calm focus to my team.',
                shape: 'circle',
                category: 'positive'
              }
            ]
          }
        })
      } as Response
    })

    const view = render(
      <AffirmationRitualPanel teamAccessKey="scope_alpha_collective" deviceId="anon_test" />
    )

    await waitFor(() => {
      expect(screen.getByText(/i bring calm focus to my team/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /submit for this cycle/i }))

    await waitFor(() => {
      expect(screen.getByText(/submitted/i)).toBeInTheDocument()
    })

    const storedQueue = window.localStorage.getItem('emotional-aquarium:ritual-offline-queue')
    expect(storedQueue).toBeTruthy()

    view.unmount()

    render(<AffirmationRitualPanel teamAccessKey="scope_alpha_collective" deviceId="anon_test" />)

    await waitFor(() => {
      expect(screen.getByText(/1 queued submission pending replay/i)).toBeInTheDocument()
    })
  })

  it('replays queued submissions on reconnect and reconciles out-of-cycle entries', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false
    })

    useRitualStore.getState().upsertQueuedFinalization({
      teamAccessKey: 'scope_alpha_collective',
      deviceId: 'anon_test',
      cycleId: '2026-04-29-morning',
      affirmationId: 'affirm-calm'
    })

    global.fetch = vi.fn(async (input, init) => {
      const url = String(input)

      if (url.includes('/ritual/cycle/current')) {
        return {
          json: async () => ({
            success: true,
            data: {
              cycle: {
                cycleId: '2026-04-29-afternoon',
                label: 'Afternoon cycle',
                window: 'afternoon',
                startsAt: '2026-04-29T12:00:00.000Z',
                endsAt: '2026-04-29T23:59:59.999Z'
              }
            }
          })
        } as Response
      }

      if (url.includes('/ritual/affirmations')) {
        return {
          json: async () => ({
            success: true,
            data: {
              affirmations: [
                {
                  id: 'affirm-calm',
                  label: 'I bring calm focus to my team.',
                  shape: 'circle',
                  category: 'positive'
                }
              ]
            }
          })
        } as Response
      }

      const body = JSON.parse(String(init?.body ?? '{}')) as { action?: string }
      if (body.action === 'finalize') {
        return {
          json: async () => ({
            success: false,
            error: {
              code: 'OUT_OF_CYCLE',
              message:
                'That submission targets a different cycle. Refresh and submit in the active cycle.'
            }
          })
        } as Response
      }

      return {
        json: async () => ({
          success: true,
          data: {}
        })
      } as Response
    })

    render(<AffirmationRitualPanel teamAccessKey="scope_alpha_collective" deviceId="anon_test" />)

    await waitFor(() => {
      expect(screen.getByText(/1 queued submission pending replay/i)).toBeInTheDocument()
    })

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true
    })
    await act(async () => {
      window.dispatchEvent(new Event('online'))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(
        screen.getByText(/queued submission was reconciled after cycle reset/i)
      ).toBeInTheDocument()
    })

    expect(useRitualStore.getState().offlineQueue.length).toBe(0)
  })
})

afterAll(() => {
  global.fetch = originalFetch
})
