// Lightweight in-process operational health counters for sync/reset diagnostics.
// These provide first-level signals for anomaly detection without requiring
// external telemetry infrastructure.

type HealthEventType =
  | 'submission:saved'
  | 'submission:finalized'
  | 'submission:out-of-cycle'
  | 'submission:duplicate'
  | 'submission:reset-cycle'
  | 'aquarium:snapshot-served'
  | 'aquarium:live-push'
  | 'cycle:reset-detected'
  | 'team:join-success'
  | 'team:join-invalid-token'

type EventCounter = {
  count: number
  lastSeenAt: string | null
}

const counters = new Map<HealthEventType, EventCounter>()

export function recordHealthEvent(event: HealthEventType): void {
  const existing = counters.get(event)

  counters.set(event, {
    count: (existing?.count ?? 0) + 1,
    lastSeenAt: new Date().toISOString()
  })
}

export type OperationalDiagnostics = {
  uptimeSecs: number
  events: Record<string, EventCounter>
}

const startTime = Date.now()

export function getOperationalDiagnostics(): OperationalDiagnostics {
  const events: Record<string, EventCounter> = {}

  for (const [key, value] of counters.entries()) {
    events[key] = value
  }

  return {
    uptimeSecs: Math.floor((Date.now() - startTime) / 1000),
    events
  }
}
