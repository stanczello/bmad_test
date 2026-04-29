import { create } from 'zustand'
import type {
  AffirmationDefinition,
  QueuedRitualSubmission,
  RitualCycle,
  RitualSubmissionRecord
} from '../types/ritual'

const QUEUE_STORAGE_KEY = 'emotional-aquarium:ritual-offline-queue'

function readQueuedSubmissions(): QueuedRitualSubmission[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = window.localStorage.getItem(QUEUE_STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored) as QueuedRitualSubmission[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistQueuedSubmissions(queue: QueuedRitualSubmission[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
  } catch {
    // Swallow storage errors so the ritual flow remains usable in constrained environments.
  }
}

function createQueueId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `queued-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

type RitualState = {
  affirmations: AffirmationDefinition[]
  cycle: RitualCycle | null
  selectedAffirmationId: string | null
  submission: RitualSubmissionRecord | null
  syncStatusLabel: string | null
  offlineQueue: QueuedRitualSubmission[]
  isReplayingQueue: boolean
  recoveryGuidance: string | null
  setCatalog: (affirmations: AffirmationDefinition[]) => void
  setCycle: (cycle: RitualCycle) => void
  setSelection: (affirmationId: string) => void
  setSubmissionState: (
    submission: RitualSubmissionRecord | null,
    syncStatusLabel: string | null
  ) => void
  setSyncStatusLabel: (syncStatusLabel: string | null) => void
  upsertQueuedFinalization: (
    queued: Omit<QueuedRitualSubmission, 'queueId' | 'queuedAt' | 'attempts'>
  ) => void
  removeQueuedFinalization: (queueId: string) => void
  incrementQueueAttempt: (queueId: string) => void
  setQueueReplayState: (isReplayingQueue: boolean) => void
  setRecoveryGuidance: (guidance: string | null) => void
  clearRitualState: () => void
}

export const useRitualStore = create<RitualState>((set) => ({
  affirmations: [],
  cycle: null,
  selectedAffirmationId: null,
  submission: null,
  syncStatusLabel: null,
  offlineQueue: readQueuedSubmissions(),
  isReplayingQueue: false,
  recoveryGuidance: null,
  setCatalog: (affirmations) => {
    set({ affirmations })
  },
  setCycle: (cycle) => {
    set({ cycle })
  },
  setSelection: (affirmationId) => {
    set({ selectedAffirmationId: affirmationId })
  },
  setSubmissionState: (submission, syncStatusLabel) => {
    set({ submission, syncStatusLabel })
  },
  setSyncStatusLabel: (syncStatusLabel) => {
    set({ syncStatusLabel })
  },
  upsertQueuedFinalization: (queued) => {
    set((state) => {
      const existing = state.offlineQueue.find(
        (item) =>
          item.teamAccessKey === queued.teamAccessKey &&
          item.deviceId === queued.deviceId &&
          item.cycleId === queued.cycleId
      )

      const queuedRecord: QueuedRitualSubmission = {
        queueId: existing?.queueId ?? createQueueId(),
        queuedAt: existing?.queuedAt ?? new Date().toISOString(),
        attempts: existing?.attempts ?? 0,
        ...queued
      }

      const filtered = state.offlineQueue.filter((item) => item.queueId !== queuedRecord.queueId)
      const nextQueue = [...filtered, queuedRecord]
      persistQueuedSubmissions(nextQueue)

      return {
        offlineQueue: nextQueue
      }
    })
  },
  removeQueuedFinalization: (queueId) => {
    set((state) => {
      const nextQueue = state.offlineQueue.filter((item) => item.queueId !== queueId)
      persistQueuedSubmissions(nextQueue)

      return {
        offlineQueue: nextQueue
      }
    })
  },
  incrementQueueAttempt: (queueId) => {
    set((state) => {
      const nextQueue = state.offlineQueue.map((item) =>
        item.queueId === queueId
          ? {
              ...item,
              attempts: item.attempts + 1
            }
          : item
      )
      persistQueuedSubmissions(nextQueue)

      return {
        offlineQueue: nextQueue
      }
    })
  },
  setQueueReplayState: (isReplayingQueue) => {
    set({ isReplayingQueue })
  },
  setRecoveryGuidance: (recoveryGuidance) => {
    set({ recoveryGuidance })
  },
  clearRitualState: () => {
    set({
      affirmations: [],
      cycle: null,
      selectedAffirmationId: null,
      submission: null,
      syncStatusLabel: null,
      isReplayingQueue: false,
      recoveryGuidance: null
    })
  }
}))
