import { useCallback, useEffect, useState, useRef } from 'react'
import {
  finalizeRitualSelection,
  getAffirmations,
  getCurrentCycle,
  isOfflineMode,
  replayQueuedFinalization,
  saveRitualSelection
} from '../../services/ritualService'
import { useRitualStore } from '../../stores/useRitualStore'

type AffirmationRitualPanelProps = {
  teamAccessKey: string
  deviceId: string
}

function AffirmationRitualPanel({
  teamAccessKey,
  deviceId
}: AffirmationRitualPanelProps): React.JSX.Element {
  const affirmations = useRitualStore((state) => state.affirmations)
  const cycle = useRitualStore((state) => state.cycle)
  const selectedAffirmationId = useRitualStore((state) => state.selectedAffirmationId)
  const submission = useRitualStore((state) => state.submission)
  const syncStatusLabel = useRitualStore((state) => state.syncStatusLabel)
  const offlineQueue = useRitualStore((state) => state.offlineQueue)
  const isReplayingQueue = useRitualStore((state) => state.isReplayingQueue)
  const recoveryGuidance = useRitualStore((state) => state.recoveryGuidance)
  const setCatalog = useRitualStore((state) => state.setCatalog)
  const setCycle = useRitualStore((state) => state.setCycle)
  const setSelection = useRitualStore((state) => state.setSelection)
  const setSubmissionState = useRitualStore((state) => state.setSubmissionState)
  const setSyncStatusLabel = useRitualStore((state) => state.setSyncStatusLabel)
  const upsertQueuedFinalization = useRitualStore((state) => state.upsertQueuedFinalization)
  const removeQueuedFinalization = useRitualStore((state) => state.removeQueuedFinalization)
  const incrementQueueAttempt = useRitualStore((state) => state.incrementQueueAttempt)
  const setQueueReplayState = useRitualStore((state) => state.setQueueReplayState)
  const setRecoveryGuidance = useRitualStore((state) => state.setRecoveryGuidance)
  const clearRitualState = useRitualStore((state) => state.clearRitualState)

  const [panelError, setPanelError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const prevFinalized = useRef(false)

  useEffect(() => {
    if (submission?.finalized && !prevFinalized.current) {
      setIsExpanded(false)
    }
    prevFinalized.current = Boolean(submission?.finalized)
  }, [submission?.finalized])

  const queueForThisDevice = offlineQueue.filter(
    (entry) => entry.teamAccessKey === teamAccessKey && entry.deviceId === deviceId
  )

  const replayQueuedSubmissions = useCallback(
    async (reason: 'startup' | 'reconnect'): Promise<void> => {
      if (isOfflineMode()) {
        setRecoveryGuidance(
          'You are offline. Your pending submission will sync automatically once connection returns.'
        )
        return
      }

      const queuedForScope = useRitualStore
        .getState()
        .offlineQueue.filter(
          (entry) => entry.teamAccessKey === teamAccessKey && entry.deviceId === deviceId
        )

      if (queuedForScope.length === 0) {
        if (reason === 'reconnect') {
          setRecoveryGuidance('Connection restored. No pending submissions need replay.')
        }
        return
      }

      setQueueReplayState(true)
      setRecoveryGuidance(
        `Replaying ${queuedForScope.length} queued submission${queuedForScope.length === 1 ? '' : 's'} now that connection is available.`
      )

      let acceptedCount = 0
      let reconciledCount = 0

      for (const queued of queuedForScope) {
        incrementQueueAttempt(queued.queueId)

        const replayResult = await replayQueuedFinalization(queued)

        if (replayResult.success) {
          acceptedCount += 1
          removeQueuedFinalization(queued.queueId)
          setSubmissionState(replayResult.data.submission, replayResult.data.stateLabel)
          continue
        }

        if (replayResult.error.code === 'OUT_OF_CYCLE') {
          reconciledCount += 1
          removeQueuedFinalization(queued.queueId)
          setSyncStatusLabel(
            'A queued submission was reconciled after cycle reset. Select an affirmation in the active cycle to submit again.'
          )
          continue
        }

        setRecoveryGuidance(
          'Some queued submissions are still pending. Keep this app open and they will retry automatically after connection stabilizes.'
        )
        break
      }

      if (acceptedCount > 0 && reconciledCount === 0) {
        setRecoveryGuidance('Queued submissions synced successfully after reconnect.')
      }

      if (reconciledCount > 0) {
        setRecoveryGuidance(
          'Some delayed submissions crossed into a new cycle and were safely reconciled. You can submit again in the active cycle.'
        )
      }

      setQueueReplayState(false)
    },
    [
      deviceId,
      incrementQueueAttempt,
      removeQueuedFinalization,
      setQueueReplayState,
      setRecoveryGuidance,
      setSubmissionState,
      setSyncStatusLabel,
      teamAccessKey
    ]
  )

  useEffect(() => {
    let isActive = true

    void Promise.resolve().then(async () => {
      setIsLoading(true)
      setPanelError(null)

      const [cycleResult, affirmationsResult] = await Promise.all([
        getCurrentCycle(teamAccessKey),
        getAffirmations(teamAccessKey)
      ])

      if (!isActive) {
        return
      }

      if (!cycleResult.success) {
        setPanelError(cycleResult.error.message)
        setIsLoading(false)
        return
      }

      if (!affirmationsResult.success) {
        setPanelError(affirmationsResult.error.message)
        setIsLoading(false)
        return
      }

      setCycle(cycleResult.data.cycle)
      setCatalog(affirmationsResult.data.affirmations)

      const existingSubmission = useRitualStore.getState().submission
      if (existingSubmission && existingSubmission.cycleId !== cycleResult.data.cycle.cycleId) {
        setSubmissionState(
          null,
          'Cycle context refreshed after reconnect. Please choose your affirmation for the active cycle.'
        )
      }

      if (
        !useRitualStore.getState().selectedAffirmationId &&
        affirmationsResult.data.affirmations.length > 0
      ) {
        setSelection(affirmationsResult.data.affirmations[0].id)
      }

      setIsLoading(false)
    })

    return () => {
      isActive = false
      clearRitualState()
    }
  }, [clearRitualState, setCatalog, setCycle, setSelection, setSubmissionState, teamAccessKey])

  useEffect(() => {
    void replayQueuedSubmissions('startup')
  }, [replayQueuedSubmissions])

  useEffect(() => {
    const onOnline = (): void => {
      void replayQueuedSubmissions('reconnect')
    }

    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('online', onOnline)
    }
  }, [replayQueuedSubmissions])

  const saveSelection = async (affirmationId: string): Promise<void> => {
    if (!cycle) {
      return
    }

    setSelection(affirmationId)
    setPanelError(null)
    setIsSubmitting(true)

    const result = await saveRitualSelection({
      teamAccessKey,
      deviceId,
      cycleId: cycle.cycleId,
      affirmationId
    })

    if (!result.success) {
      setPanelError(result.error.message)
      setIsSubmitting(false)
      return
    }

    setSubmissionState(result.data.submission, result.data.stateLabel)
    setIsSubmitting(false)
  }

  const finalizeSelection = async (): Promise<void> => {
    if (!cycle || !selectedAffirmationId) {
      return
    }

    setPanelError(null)
    setIsSubmitting(true)

    if (isOfflineMode()) {
      upsertQueuedFinalization({
        teamAccessKey,
        deviceId,
        cycleId: cycle.cycleId,
        affirmationId: selectedAffirmationId
      })
      setSubmissionState(
        {
          deviceId,
          cycleId: cycle.cycleId,
          affirmationId: selectedAffirmationId,
          status: 'pending',
          finalized: true,
          updatedAt: new Date().toISOString()
        },
        'Queued while offline. It will sync automatically when you reconnect.'
      )
      setRecoveryGuidance(
        'You can close and reopen the app. Your queued submission is stored locally for replay.'
      )
      setIsSubmitting(false)
      return
    }

    const result = await finalizeRitualSelection({
      teamAccessKey,
      deviceId,
      cycleId: cycle.cycleId,
      affirmationId: selectedAffirmationId
    })

    if (!result.success) {
      if (result.error.code === 'NETWORK_ERROR') {
        upsertQueuedFinalization({
          teamAccessKey,
          deviceId,
          cycleId: cycle.cycleId,
          affirmationId: selectedAffirmationId
        })
        setSubmissionState(
          {
            deviceId,
            cycleId: cycle.cycleId,
            affirmationId: selectedAffirmationId,
            status: 'pending',
            finalized: true,
            updatedAt: new Date().toISOString()
          },
          'Connection dropped during submit. Your selection was queued and will replay automatically.'
        )
        setRecoveryGuidance(
          'No manual recovery needed. Keep the app open or reconnect later to sync.'
        )
        setIsSubmitting(false)
        return
      }

      setPanelError(result.error.message)
      setIsSubmitting(false)
      return
    }

    setSubmissionState(result.data.submission, result.data.stateLabel)
    setIsSubmitting(false)
  }

  return (
    <section className="flex flex-col rounded-lg border border-amber-700/50 bg-amber-950/30 text-sm">
      <button
        type="button"
        onClick={() => {
          setIsExpanded((prev) => !prev)
        }}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-amber-100">Daily Affirmation Ritual</h2>
          {submission?.finalized ? (
            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-medium text-amber-300">
              ✓ Submitted
            </span>
          ) : null}
        </div>
        <span
          className="text-amber-400 transition-transform"
          style={{
            display: 'inline-block',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          ▾
        </span>
      </button>

      {isExpanded ? (
        <div className="flex flex-col gap-3 px-4 pb-4">
          <div>
            <p className="text-amber-200/80">
              Active cycle:{' '}
              <span className="font-semibold">{cycle?.label ?? 'Loading cycle...'}</span>
            </p>
            <p className="text-amber-200/70">
              Quiet participation only. No reminders or interruption prompts.
            </p>
          </div>

          {isLoading ? <p className="text-amber-100">Loading affirmations...</p> : null}
          {panelError ? <p className="text-rose-300">{panelError}</p> : null}

          {submission?.finalized ? (
            <p className="rounded border border-amber-700/40 bg-amber-900/30 px-3 py-2 text-xs text-amber-200">
              Your shape is locked for this cycle. To make a new selection, reset your team scope
              and re-join.
            </p>
          ) : null}

          <div className="grid gap-2">
            {affirmations.map((affirmation) => {
              const isSelected = selectedAffirmationId === affirmation.id
              return (
                <button
                  key={affirmation.id}
                  type="button"
                  disabled={isSubmitting || Boolean(submission?.finalized)}
                  onClick={() => {
                    void saveSelection(affirmation.id)
                  }}
                  className={`w-full rounded border px-3 py-2 text-left transition ${
                    isSelected
                      ? 'border-amber-300 bg-amber-400/20 text-amber-100'
                      : 'border-amber-700/60 bg-slate-900/40 text-amber-50 hover:border-amber-500'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span className="block text-xs uppercase tracking-wide text-amber-300">
                    Shape: {affirmation.shape}
                  </span>
                  <span className="block text-sm">{affirmation.label}</span>
                </button>
              )
            })}
          </div>

          {!submission?.finalized && selectedAffirmationId ? (
            <p className="text-xs text-amber-200/60">
              Shape saved as pending. Click &ldquo;Submit for this cycle&rdquo; to lock it in.
            </p>
          ) : null}

          <button
            type="button"
            disabled={!selectedAffirmationId || isSubmitting || submission?.finalized}
            onClick={() => {
              void finalizeSelection()
            }}
            className="rounded bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-200"
          >
            {submission?.finalized ? 'Submitted for this cycle' : 'Submit for this cycle'}
          </button>

          {!submission?.finalized ? (
            <div className="rounded border border-amber-700/40 bg-slate-900/50 p-3">
              <p className="text-xs uppercase tracking-wide text-amber-300">Sync status</p>
              <p className="mt-1 text-sm text-amber-100">
                {syncStatusLabel ??
                  'No submission yet. Select an affirmation to save your in-cycle intent.'}
              </p>
              <p className="mt-2 text-xs text-amber-200/90">
                {isReplayingQueue
                  ? 'Sync replay is in progress...'
                  : queueForThisDevice.length > 0
                    ? `${queueForThisDevice.length} queued submission${queueForThisDevice.length === 1 ? '' : 's'} pending replay.`
                    : 'No queued submissions on this device.'}
              </p>
              {recoveryGuidance ? (
                <p className="mt-2 text-xs text-amber-200">{recoveryGuidance}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default AffirmationRitualPanel
