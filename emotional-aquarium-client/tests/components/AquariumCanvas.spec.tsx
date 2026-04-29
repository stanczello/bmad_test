import type { ReactNode } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { AquariumSnapshot } from '../../src/renderer/src/types/aquarium'

vi.spyOn(console, 'error').mockImplementation(() => {})

let frameCallback: ((state: { clock: { getElapsedTime: () => number } }, delta: number) => void) | null = null

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => (
    <canvas data-testid="r3f-canvas">{children}</canvas>
  ),
  useFrame: (
    callback: (state: { clock: { getElapsedTime: () => number } }, delta: number) => void
  ) => {
    frameCallback = callback
  }
}))

vi.mock('@react-three/drei', () => ({}))

describe('AquariumCanvas - React Three Fiber stub', () => {
  it('renders a fallback geometry when snapshot is empty', async () => {
    const mod = await import('../../src/renderer/src/components/aquarium/AquariumCanvas')
    const AquariumCanvas = mod.default

    const view = render(<AquariumCanvas />)
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()
    expect(view.container.querySelector('spheregeometry')).toBeTruthy()
  })

  it('renders real shape entries from snapshot and runs frame update loop', async () => {
    const mod = await import('../../src/renderer/src/components/aquarium/AquariumCanvas')
    const AquariumCanvas = mod.default

    const snapshot: AquariumSnapshot = {
      teamId: 'team-alpha',
      teamName: 'Alpha Team',
      cycleLabel: 'Morning cycle',
      participantCount: 2,
      submittedCount: 2,
      habitatTone: 'calm-current',
      ownShape: 'circle',
      ownContributionVisible: true,
      shapes: [
        { shape: 'circle', count: 1 },
        { shape: 'triangle', count: 1 }
      ]
    }

    const view = render(<AquariumCanvas snapshot={snapshot} />)

    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument()

    expect(view.container.querySelectorAll('mesh').length).toBeGreaterThanOrEqual(2)
    view.container.querySelectorAll('mesh').forEach((mesh) => {
      const target = mesh as unknown as {
        position?: { set?: (x: number, y: number, z: number) => void }
        rotation?: { x: number; y: number }
      }
      target.position = { set: () => {} }
      target.rotation = { x: 0, y: 0 }
    })

    expect(frameCallback).toBeTypeOf('function')

    frameCallback?.(
      {
        clock: {
          getElapsedTime: () => 1.25
        }
      },
      1 / 60
    )

    frameCallback?.(
      {
        clock: {
          getElapsedTime: () => 2.25
        }
      },
      1 / 30
    )
  })
})
