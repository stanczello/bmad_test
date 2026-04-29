import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { AquariumSnapshot } from '../../types/aquarium'

type ShapeEntry = {
  shape: string
  isOwn: boolean
}

type BodyState = {
  position: [number, number, number]
  velocity: [number, number, number]
  driftPhase: number
  driftRate: number
}

type Bounds3D = {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  zMin: number
  zMax: number
}

type PhysicsShapesProps = {
  entries: ShapeEntry[]
}

const MAX_SHAPES = 50
const BOUNDS: Bounds3D = {
  xMin: -8.6,
  xMax: 8.6,
  yMin: -4.8,
  yMax: 4.8,
  zMin: -3.9,
  zMax: 3.9
}

const AVOIDANCE_DISTANCE = 1.05
const WALL_MARGIN = 1.15
const WALL_FORCE = 2.9
const AVOIDANCE_FORCE = 2.35
const DRIFT_FORCE = 2.2
const MAX_ACCELERATION = 7.5
const MAX_SPEED = 4.8

function shapeColor(shape: string, isOwn: boolean): string {
  if (isOwn) return '#ffffff'
  const palette: Record<string, string> = {
    circle: '#3b82f6',
    triangle: '#22c55e',
    square: '#ef4444',
    wave: '#a855f7',
    arc: '#f59e0b'
  }
  return palette[shape] ?? '#94a3b8'
}

function hashSeed(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0) / 4294967295
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function clampVectorMagnitude(
  vector: [number, number, number],
  maxMagnitude: number
): [number, number, number] {
  const magnitude = Math.hypot(vector[0], vector[1], vector[2])
  if (magnitude <= maxMagnitude || magnitude === 0) {
    return vector
  }

  const scale = maxMagnitude / magnitude
  return [vector[0] * scale, vector[1] * scale, vector[2] * scale]
}

function createInitialBody(index: number, entry: ShapeEntry): BodyState {
  const seed = hashSeed(`${entry.shape}-${index}`)
  const xSpan = BOUNDS.xMax - BOUNDS.xMin
  const ySpan = BOUNDS.yMax - BOUNDS.yMin
  const zSpan = BOUNDS.zMax - BOUNDS.zMin

  const x = BOUNDS.xMin + xSpan * ((seed * 1.17) % 1)
  const y = BOUNDS.yMin + ySpan * ((seed * 1.93) % 1)
  const z = BOUNDS.zMin + zSpan * ((seed * 2.31) % 1)

  const vx = ((seed * 3.13) % 1) * 3.4 - 1.7
  const vy = ((seed * 4.17) % 1) * 1.6 - 0.8
  const vz = ((seed * 5.29) % 1) * 3.4 - 1.7

  return {
    position: [x, y, z],
    velocity: [vx, vy, vz],
    driftPhase: ((seed * 6.71) % 1) * Math.PI * 2,
    driftRate: 0.8 + ((seed * 7.11) % 1) * 0.65
  }
}

function geometryByShape(shape: string): React.JSX.Element {
  switch (shape) {
    case 'circle':
      return <sphereGeometry args={[0.35, 24, 24]} />
    case 'triangle':
      return <coneGeometry args={[0.3, 0.6, 4]} />
    case 'square':
      return <boxGeometry args={[0.5, 0.5, 0.5]} />
    case 'wave':
      return <torusGeometry args={[0.3, 0.12, 12, 32]} />
    case 'arc':
      return <torusKnotGeometry args={[0.25, 0.08, 64, 8]} />
    default:
      return <octahedronGeometry args={[0.35]} />
  }
}

function PhysicsShapes({ entries }: PhysicsShapesProps): React.JSX.Element {
  const meshRefs = useRef<Array<Mesh | null>>([])
  const bodiesRef = useRef<BodyState[]>([])

  useEffect(() => {
    bodiesRef.current = entries.map((entry, index) => createInitialBody(index, entry))
    meshRefs.current = Array.from({ length: entries.length }, (_, i) => meshRefs.current[i] ?? null)
  }, [entries])

  useFrame(({ clock }, delta) => {
    const bodies = bodiesRef.current
    if (bodies.length === 0) {
      return
    }

    const dt = Math.min(Math.max(delta, 1 / 120), 1 / 24)
    const now = clock.getElapsedTime()
    const accelerations = bodies.map(() => [0, 0, 0] as [number, number, number])

    for (let i = 0; i < bodies.length; i += 1) {
      const body = bodies[i]
      const acceleration = accelerations[i]
      const [x, y, z] = body.position

      if (x < BOUNDS.xMin + WALL_MARGIN) {
        acceleration[0] += ((BOUNDS.xMin + WALL_MARGIN - x) / WALL_MARGIN) * WALL_FORCE
      } else if (x > BOUNDS.xMax - WALL_MARGIN) {
        acceleration[0] -= ((x - (BOUNDS.xMax - WALL_MARGIN)) / WALL_MARGIN) * WALL_FORCE
      }

      if (y < BOUNDS.yMin + WALL_MARGIN) {
        acceleration[1] += ((BOUNDS.yMin + WALL_MARGIN - y) / WALL_MARGIN) * WALL_FORCE
      } else if (y > BOUNDS.yMax - WALL_MARGIN) {
        acceleration[1] -= ((y - (BOUNDS.yMax - WALL_MARGIN)) / WALL_MARGIN) * WALL_FORCE
      }

      if (z < BOUNDS.zMin + WALL_MARGIN) {
        acceleration[2] += ((BOUNDS.zMin + WALL_MARGIN - z) / WALL_MARGIN) * WALL_FORCE
      } else if (z > BOUNDS.zMax - WALL_MARGIN) {
        acceleration[2] -= ((z - (BOUNDS.zMax - WALL_MARGIN)) / WALL_MARGIN) * WALL_FORCE
      }

      const drift = now * body.driftRate + body.driftPhase
      acceleration[0] += Math.sin(drift) * DRIFT_FORCE
      acceleration[1] += Math.cos(drift * 0.75) * DRIFT_FORCE * 0.55
      acceleration[2] += Math.sin(drift * 1.17) * DRIFT_FORCE
    }

    for (let i = 0; i < bodies.length; i += 1) {
      for (let j = i + 1; j < bodies.length; j += 1) {
        const a = bodies[i]
        const b = bodies[j]
        const dx = a.position[0] - b.position[0]
        const dy = a.position[1] - b.position[1]
        const dz = a.position[2] - b.position[2]

        const distanceSq = dx * dx + dy * dy + dz * dz
        if (distanceSq === 0 || distanceSq >= AVOIDANCE_DISTANCE * AVOIDANCE_DISTANCE) {
          continue
        }

        const distance = Math.sqrt(distanceSq)
        const nx = dx / distance
        const ny = dy / distance
        const nz = dz / distance
        const push = ((AVOIDANCE_DISTANCE - distance) / AVOIDANCE_DISTANCE) * AVOIDANCE_FORCE

        accelerations[i][0] += nx * push
        accelerations[i][1] += ny * push
        accelerations[i][2] += nz * push

        accelerations[j][0] -= nx * push
        accelerations[j][1] -= ny * push
        accelerations[j][2] -= nz * push
      }
    }

    const damping = Math.pow(0.9985, dt * 60)

    for (let i = 0; i < bodies.length; i += 1) {
      const body = bodies[i]
      const clampedAcceleration = clampVectorMagnitude(accelerations[i], MAX_ACCELERATION)

      body.velocity[0] = (body.velocity[0] + clampedAcceleration[0] * dt) * damping
      body.velocity[1] = (body.velocity[1] + clampedAcceleration[1] * dt) * damping
      body.velocity[2] = (body.velocity[2] + clampedAcceleration[2] * dt) * damping

      body.velocity = clampVectorMagnitude(body.velocity, MAX_SPEED)

      body.position[0] = clamp(body.position[0] + body.velocity[0] * dt, BOUNDS.xMin, BOUNDS.xMax)
      body.position[1] = clamp(body.position[1] + body.velocity[1] * dt, BOUNDS.yMin, BOUNDS.yMax)
      body.position[2] = clamp(body.position[2] + body.velocity[2] * dt, BOUNDS.zMin, BOUNDS.zMax)

      const mesh = meshRefs.current[i]
      if (!mesh) {
        continue
      }

      mesh.position.set(body.position[0], body.position[1], body.position[2])
      mesh.rotation.y += body.velocity[0] * 0.01
      mesh.rotation.x += body.velocity[2] * 0.01
    }
  })

  return (
    <>
      {entries.map((entry, i) => (
        <mesh
          key={`${entry.shape}-${i}`}
          ref={(value) => {
            meshRefs.current[i] = value
          }}
        >
          {geometryByShape(entry.shape)}
          <meshStandardMaterial
            color={shapeColor(entry.shape, entry.isOwn)}
            roughness={0.4}
            metalness={entry.isOwn ? 0.6 : 0.1}
          />
        </mesh>
      ))}
    </>
  )
}

type AquariumCanvasProps = {
  snapshot?: AquariumSnapshot | null
}

function AquariumCanvas({ snapshot }: AquariumCanvasProps): React.JSX.Element {
  const entries: ShapeEntry[] = useMemo(() => {
    if (!snapshot) {
      return []
    }

    const baseEntries = snapshot.shapes
      .flatMap((s) =>
        Array.from({ length: Math.max(0, s.count) }, () => ({
          shape: s.shape,
          isOwn: snapshot.ownShape === s.shape && snapshot.ownContributionVisible
        }))
      )
      .slice(0, MAX_SHAPES)

    return baseEntries
  }, [snapshot])

  const isEmpty = entries.length === 0

  return (
    <Canvas camera={{ position: [0, 0, 10] }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#a5f3fc" />
      {isEmpty ? (
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#1e3a5f" wireframe />
        </mesh>
      ) : (
        <PhysicsShapes entries={entries} />
      )}
    </Canvas>
  )
}

export default AquariumCanvas
