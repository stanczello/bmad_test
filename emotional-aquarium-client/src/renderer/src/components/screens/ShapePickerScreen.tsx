import { useEffect, useState } from 'react'
import {
  finalizeRitualSelection,
  getAffirmations,
  getCurrentCycle,
  getSubmissionForCycle
} from '../../services/ritualService'
import type { AffirmationDefinition, RitualCycle } from '../../types/ritual'

type ShapePickerScreenProps = {
  teamAccessKey: string
  deviceId: string
  onSubmitted: () => void
}

const SHAPE_ICON: Record<string, string> = {
  circle: '●',
  triangle: '▲',
  square: '■',
  wave: '〜',
  arc: '◎'
}

const SHAPE_NAME: Record<string, string> = {
  circle: 'Sphere',
  triangle: 'Pyramid',
  square: 'Cube',
  wave: 'Torus',
  arc: 'Torus Knot'
}

const SHAPE_COLOR: Record<string, string> = {
  circle: '#3b82f6',
  triangle: '#22c55e',
  square: '#ef4444',
  wave: '#a855f7',
  arc: '#f59e0b'
}

function ShapePickerScreen({
  teamAccessKey,
  deviceId,
  onSubmitted
}: ShapePickerScreenProps): React.JSX.Element {
  const [affirmations, setAffirmations] = useState<AffirmationDefinition[]>([])
  const [cycle, setCycle] = useState<RitualCycle | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    void Promise.all([getCurrentCycle(teamAccessKey), getAffirmations(teamAccessKey)]).then(
      async ([cycleResult, affirmationsResult]) => {
        if (!isActive) return

        if (!cycleResult.success) {
          setError(cycleResult.error.message)
          setIsLoading(false)
          return
        }

        if (!affirmationsResult.success) {
          setError(affirmationsResult.error.message)
          setIsLoading(false)
          return
        }

        const submissionResult = await getSubmissionForCycle({
          teamAccessKey,
          deviceId,
          cycleId: cycleResult.data.cycle.cycleId
        })

        if (!isActive) return

        if (submissionResult.success && submissionResult.data.submission?.finalized) {
          onSubmitted()
          return
        }

        setCycle(cycleResult.data.cycle)
        setAffirmations(affirmationsResult.data.affirmations)
        setIsLoading(false)
      }
    )

    return () => {
      isActive = false
    }
  }, [deviceId, onSubmitted, teamAccessKey])

  const handleSelect = async (affirmationId: string): Promise<void> => {
    if (!cycle || isSubmitting) return

    setSelected(affirmationId)
    setIsSubmitting(true)
    setError(null)

    const result = await finalizeRitualSelection({
      teamAccessKey,
      deviceId,
      cycleId: cycle.cycleId,
      affirmationId
    })

    if (!result.success) {
      if (result.error.code === 'DUPLICATE_CYCLE_SUBMISSION') {
        onSubmitted()
        return
      }

      setError(result.error.message)
      setIsSubmitting(false)
      return
    }

    onSubmitted()
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-300">Preparing your ritual...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col items-center justify-between overflow-hidden bg-slate-900 px-4 py-4 sm:px-6 sm:py-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          Choose Your 3D Figure for Today
        </h1>
        {cycle ? (
          <p className="mt-2 text-sm text-slate-400">
            {cycle.label} · Choose your intention for this cycle
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded border border-rose-700/50 bg-rose-900/30 px-4 py-2 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <div className="grid w-full max-w-6xl flex-1 content-center gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {affirmations.map((affirmation) => {
          const color = SHAPE_COLOR[affirmation.shape] ?? '#94a3b8'
          const icon = SHAPE_ICON[affirmation.shape] ?? '◆'
          const shapeName = SHAPE_NAME[affirmation.shape] ?? affirmation.shape
          const isSelected = selected === affirmation.id

          return (
            <button
              key={affirmation.id}
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                void handleSelect(affirmation.id)
              }}
              className={`group flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-2xl border p-4 transition-all duration-200 disabled:cursor-wait ${
                isSelected
                  ? 'scale-95 border-white/60 bg-white/10'
                  : 'border-slate-700 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800'
              }`}
            >
              <span
                className="text-4xl leading-none transition-transform duration-200 group-hover:scale-110 sm:text-5xl"
                style={{ color }}
              >
                {icon}
              </span>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {shapeName}
                </p>
                <p className="mt-1 text-xs font-medium leading-snug text-white sm:text-sm">
                  {affirmation.label}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-slate-500">
        Your choice is anonymous and contributes to the shared team aquarium.
      </p>
    </div>
  )
}

export default ShapePickerScreen
