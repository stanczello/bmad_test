import type { UpdateStatus } from '../../stores/useAppStore'

type UpdateStatusBannerProps = {
  status: UpdateStatus
  releaseChannel: string
  onInstall: () => void
}

function updateLabel(status: UpdateStatus): string | null {
  switch (status.phase) {
    case 'checking':
      return 'Checking for updates...'
    case 'available':
      return `Update ${status.version} is downloading in the background.`
    case 'downloading':
      return `Downloading update... ${status.percent}%`
    case 'ready':
      return `Update ${status.version} is ready. Restart to apply it.`
    case 'error':
      return status.message
    default:
      return null
  }
}

function bannerColor(status: UpdateStatus): string {
  switch (status.phase) {
    case 'ready':
      return 'border-emerald-600/60 bg-emerald-950/40 text-emerald-100'
    case 'error':
      return 'border-amber-600/60 bg-amber-950/30 text-amber-200'
    default:
      return 'border-slate-600/50 bg-slate-800/40 text-slate-300'
  }
}

function UpdateStatusBanner({
  status,
  releaseChannel,
  onInstall
}: UpdateStatusBannerProps): React.JSX.Element | null {
  const label = updateLabel(status)

  if (!label) {
    return null
  }

  return (
    <div
      className={`flex w-full items-center justify-between gap-3 rounded border px-4 py-2 text-xs ${bannerColor(status)}`}
    >
      <div className="flex flex-col gap-0.5">
        <span>{label}</span>
        {releaseChannel !== 'stable' ? (
          <span className="text-slate-400">
            Channel: <span className="font-semibold text-slate-300">{releaseChannel}</span>
          </span>
        ) : null}
      </div>
      {status.phase === 'ready' ? (
        <button
          type="button"
          onClick={onInstall}
          className="shrink-0 rounded bg-emerald-500 px-3 py-1 font-semibold text-slate-900 hover:bg-emerald-400"
        >
          Restart to update
        </button>
      ) : null}
    </div>
  )
}

export default UpdateStatusBanner
