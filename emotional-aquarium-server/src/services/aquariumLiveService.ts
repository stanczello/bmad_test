type LiveSocket = {
  send: (data: string) => void
  close: () => void
  on: (event: 'close' | 'error', listener: () => void) => void
  readyState: number
}

const OPEN_STATE = 1
const teamSockets = new Map<string, Set<LiveSocket>>()

export function registerTeamLiveSocket(teamId: string, socket: LiveSocket): void {
  if (!teamSockets.has(teamId)) {
    teamSockets.set(teamId, new Set())
  }

  const sockets = teamSockets.get(teamId)

  if (!sockets) {
    return
  }

  sockets.add(socket)

  const unregister = (): void => {
    const teamSet = teamSockets.get(teamId)

    if (!teamSet) {
      return
    }

    teamSet.delete(socket)
    if (teamSet.size === 0) {
      teamSockets.delete(teamId)
    }
  }

  socket.on('close', unregister)
  socket.on('error', unregister)
}

export function publishTeamLiveSnapshot(teamId: string, payload: unknown): void {
  const sockets = teamSockets.get(teamId)

  if (!sockets || sockets.size === 0) {
    return
  }

  const message = JSON.stringify(payload)

  sockets.forEach((socket) => {
    if (socket.readyState !== OPEN_STATE) {
      return
    }

    socket.send(message)
  })
}