import { useCallback, useEffect, useRef, useState } from 'react'
import AquariumCanvas from './components/aquarium/AquariumCanvas'
import ShapePickerScreen from './components/screens/ShapePickerScreen'
import UpdateStatusBanner from './components/shell/UpdateStatusBanner'
import { getAquariumSnapshot } from './services/aquariumService'
import { joinTeam } from './services/teamJoinService'
import { useAppStore } from './stores/useAppStore'
import type { AquariumSnapshot } from './types/aquarium'
import type { UpdateStatus } from './stores/useAppStore'

const DEFAULT_TEAM_TOKEN = 'TEAM-ALPHA-2026'
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type AppScreen = 'loading' | 'picking' | 'aquarium'

function App(): React.JSX.Element {
  const updateStatus = useAppStore((state) => state.updateStatus)
  const releaseChannel = useAppStore((state) => state.releaseChannel)
  const setUpdateStatus = useAppStore((state) => state.setUpdateStatus)
  const setReleaseChannel = useAppStore((state) => state.setReleaseChannel)

  const [screen, setScreen] = useState<AppScreen>('loading')
  const [teamAccessKey, setTeamAccessKey] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<AquariumSnapshot | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const aquariumRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const api = window.api as
      | {
          getUpdateStatus?: () => Promise<UpdateStatus>
          getReleaseChannel?: () => Promise<string>
          onUpdateStatus?: (cb: (s: UpdateStatus) => void) => () => void
        }
      | undefined

    if (!api) return

    void api.getUpdateStatus?.().then((s) => {
      if (s) setUpdateStatus(s)
    })
    void api.getReleaseChannel?.().then((c) => {
      if (c) setReleaseChannel(c)
    })

    const unsubscribe = api.onUpdateStatus?.((s) => {
      setUpdateStatus(s)
    })
    return () => {
      unsubscribe?.()
    }
  }, [setReleaseChannel, setUpdateStatus])

  useEffect(() => {
    let isActive = true

    void Promise.all([joinTeam(DEFAULT_TEAM_TOKEN), window.api.getDeviceId()]).then(
      ([joinResult, resolvedDeviceId]) => {
        if (!isActive) return

        if (!joinResult.success) {
          setJoinError(joinResult.error.message)
          return
        }

        setTeamAccessKey(joinResult.data.teamAccessKey)
        setDeviceId(resolvedDeviceId)
        setScreen('picking')
      }
    )

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true
    if (screen !== 'aquarium' || !deviceId || !teamAccessKey)
      return () => {
        isActive = false
      }
    void getAquariumSnapshot(teamAccessKey, deviceId).then((result) => {
      if (!isActive) return
      if (result.success) setSnapshot(result.data.snapshot)
    })
    return () => {
      isActive = false
    }
  }, [screen, deviceId, teamAccessKey])

  useEffect(() => {
    if (screen !== 'aquarium' || !deviceId || !teamAccessKey || typeof WebSocket === 'undefined')
      return
    const wsUrl = new URL('/aquarium/live', API_URL)
    wsUrl.searchParams.set('teamAccessKey', teamAccessKey)
    wsUrl.searchParams.set('deviceId', deviceId)
    const protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:'
    const websocket = new WebSocket(
      `${protocol}//${wsUrl.host}${wsUrl.pathname}?${wsUrl.searchParams.toString()}`
    )
    websocket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string; snapshot?: AquariumSnapshot }
        if (payload.type === 'snapshot:update' && payload.snapshot) setSnapshot(payload.snapshot)
      } catch {
        /* ignore */
      }
    }
    return () => {
      websocket.close()
    }
  }, [screen, deviceId, teamAccessKey])

  const toggleFullscreen = useCallback((): void => {
    const el = aquariumRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      void el.requestFullscreen()
    } else {
      void document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const onFsChange = (): void => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const handleInstallUpdate = (): void => {
    const api = window.api as { installUpdate?: () => void } | undefined
    api?.installUpdate?.()
  }

  if (screen === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        {joinError ? (
          <p className="max-w-lg px-6 text-center text-sm text-rose-300">{joinError}</p>
        ) : (
          <p className="text-slate-400">Starting...</p>
        )}
      </div>
    )
  }

  if (screen === 'picking' && deviceId && teamAccessKey) {
    return (
      <ShapePickerScreen
        teamAccessKey={teamAccessKey}
        deviceId={deviceId}
        onSubmitted={() => setScreen('aquarium')}
      />
    )
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-slate-900 text-white">
      <UpdateStatusBanner
        status={updateStatus}
        releaseChannel={releaseChannel}
        onInstall={handleInstallUpdate}
      />
      <div ref={aquariumRef} className="relative flex-1 bg-slate-950">
        <AquariumCanvas snapshot={snapshot} />
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          className="absolute right-3 top-3 rounded bg-slate-800/70 px-2 py-1 text-xs text-slate-300 backdrop-blur hover:bg-slate-700/80"
        >
          {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </button>
      </div>
      <div className="flex items-center justify-center gap-3 border-t border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-500">
        <span>Emotional Aquarium</span>
      </div>
    </main>
  )
}

export default App
