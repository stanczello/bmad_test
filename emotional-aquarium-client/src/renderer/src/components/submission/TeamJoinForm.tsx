import { useState } from 'react'
import { joinTeam } from '../../services/teamJoinService'
import { useTeamStore } from '../../stores/useTeamStore'

function TeamJoinForm(): React.JSX.Element {
  const [token, setToken] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const setTeamScope = useTeamStore((state) => state.setTeamScope)

  const submitToken = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    const result = await joinTeam(token.trim())

    if (!result.success) {
      setErrorMessage(result.error.message)
      setIsSubmitting(false)
      return
    }

    await window.api.getDeviceId()
    setTeamScope(result.data.team, result.data.teamAccessKey)
    setIsSubmitting(false)
  }

  return (
    <form
      onSubmit={submitToken}
      className="flex w-full max-w-md flex-col gap-3 rounded-lg border border-slate-700 bg-slate-800/60 p-4"
    >
      <label htmlFor="team-token" className="text-sm font-medium text-slate-200">
        Team Join Token
      </label>
      <input
        id="team-token"
        name="team-token"
        type="text"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        placeholder="TEAM-ALPHA-2026"
        className="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
        aria-label="Team join token"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-500"
      >
        {isSubmitting ? 'Joining...' : 'Join Team'}
      </button>
      {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
    </form>
  )
}

export default TeamJoinForm
