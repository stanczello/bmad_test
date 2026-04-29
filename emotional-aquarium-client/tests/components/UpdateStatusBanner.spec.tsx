import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import UpdateStatusBanner from '../../src/renderer/src/components/shell/UpdateStatusBanner'

describe('UpdateStatusBanner', () => {
  it('does not render for idle phase', () => {
    const onInstall = vi.fn()
    const view = render(
      <UpdateStatusBanner status={{ phase: 'idle' }} releaseChannel="stable" onInstall={onInstall} />
    )

    expect(view.container.firstChild).toBeNull()
  })

  it('shows restart CTA when update is ready', () => {
    const onInstall = vi.fn()

    render(
      <UpdateStatusBanner
        status={{ phase: 'ready', version: '1.4.0' }}
        releaseChannel="stable"
        onInstall={onInstall}
      />
    )

    expect(screen.getByText(/update 1.4.0 is ready/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /restart to update/i }))
    expect(onInstall).toHaveBeenCalledTimes(1)
  })

  it('shows non-stable release channel and error details', () => {
    const onInstall = vi.fn()

    render(
      <UpdateStatusBanner
        status={{ phase: 'error', message: 'Updater failed.' }}
        releaseChannel="beta"
        onInstall={onInstall}
      />
    )

    expect(screen.getByText(/updater failed/i)).toBeInTheDocument()
    expect(screen.getByText(/channel:/i)).toBeInTheDocument()
    expect(screen.getByText('beta')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /restart to update/i })).not.toBeInTheDocument()
  })
})
