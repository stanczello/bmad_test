import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'
import { getOrCreateDeviceId, initDb } from './db/initDb'

// ── Release channel ──────────────────────────────────────────────────────────
// Defaults to 'stable'. Set RELEASE_CHANNEL=beta or RELEASE_CHANNEL=alpha for
// staged rollout cohorts. The channel value is surfaced on health diagnostics
// and used by electron-updater to resolve the target release feed.
const releaseChannel = (process.env['RELEASE_CHANNEL'] ?? 'stable').trim()

export type UpdateStatus =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'available'; version: string }
  | { phase: 'not-available' }
  | { phase: 'downloading'; percent: number }
  | { phase: 'ready'; version: string }
  | { phase: 'error'; message: string }

let currentUpdateStatus: UpdateStatus = { phase: 'idle' }

function configureAutoUpdater(mainWindow: BrowserWindow): void {
  // In dev mode there is no packaged app so updates cannot run; skip silently.
  if (is.dev) {
    currentUpdateStatus = { phase: 'not-available' }
    return
  }

  autoUpdater.channel = releaseChannel
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    currentUpdateStatus = { phase: 'checking' }
    mainWindow.webContents.send('app:updateStatus', currentUpdateStatus)
  })

  autoUpdater.on('update-available', (info) => {
    currentUpdateStatus = { phase: 'available', version: String(info.version) }
    mainWindow.webContents.send('app:updateStatus', currentUpdateStatus)
  })

  autoUpdater.on('update-not-available', () => {
    currentUpdateStatus = { phase: 'not-available' }
    mainWindow.webContents.send('app:updateStatus', currentUpdateStatus)
  })

  autoUpdater.on('download-progress', (progress) => {
    currentUpdateStatus = { phase: 'downloading', percent: Math.round(progress.percent) }
    mainWindow.webContents.send('app:updateStatus', currentUpdateStatus)
  })

  autoUpdater.on('update-downloaded', (info) => {
    currentUpdateStatus = { phase: 'ready', version: String(info.version) }
    mainWindow.webContents.send('app:updateStatus', currentUpdateStatus)
  })

  autoUpdater.on('error', (err) => {
    // Non-fatal: log and surface plain-language guidance without crashing.
    const message = err.message?.includes('net::')
      ? 'Could not reach the update server. The app is running normally without the latest update.'
      : 'An update check encountered an issue. No action needed — the app is running normally.'
    currentUpdateStatus = { phase: 'error', message }
    mainWindow.webContents.send('app:updateStatus', currentUpdateStatus)
    console.warn('[updater] non-fatal update error:', err.message)
  })

  // Trigger check shortly after window ready-to-show so startup feels instant.
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err: unknown) => {
      console.warn('[updater] checkForUpdates failed silently:', err)
    })
  }, 8000)
}

const isSmokeTest = app.commandLine.hasSwitch('smoke-test') || process.argv.includes('--smoke-test')
const smokeLogPath = join(app.getPath('temp'), 'emotional-aquarium-smoke-result.log')

function writeSmokeResult(message: string): void {
  if (!isSmokeTest) {
    return
  }

  writeFileSync(smokeLogPath, `${message}\n`, 'utf8')
}

async function runSmokeChecks(mainWindow: BrowserWindow): Promise<void> {
  const smokeBaselinePassed = await mainWindow.webContents.executeJavaScript(`
    (() => {
      const hasJoinInput = Boolean(document.querySelector('input[aria-label="Team join token"]'))
      const hasJoinButton = Array.from(document.querySelectorAll('button')).some((button) =>
        /join team/i.test(button.textContent ?? '')
      )
      const hasBridge = Boolean(window.api && typeof window.api.getDeviceId === 'function')

      return hasJoinInput && hasJoinButton && hasBridge
    })()
  `)

  if (!smokeBaselinePassed) {
    throw new Error('Smoke baseline failed: startup did not expose onboarding and preload bridge.')
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (!isSmokeTest) {
    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
      configureAutoUpdater(mainWindow)
    })
  }

  mainWindow.webContents.once('did-fail-load', () => {
    if (isSmokeTest) {
      writeSmokeResult('Smoke baseline failed: renderer did not load successfully.')
      console.error('Smoke baseline failed: renderer did not load successfully.')
      app.exit(1)
    }
  })

  mainWindow.webContents.once('did-finish-load', async () => {
    if (!isSmokeTest) {
      return
    }

    try {
      await runSmokeChecks(mainWindow)
      writeSmokeResult('Smoke baseline passed.')
      console.log('Smoke baseline passed.')
      app.exit(0)
    } catch (error) {
      writeSmokeResult(error instanceof Error ? error.message : String(error))
      console.error(error)
      app.exit(1)
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
if (isSmokeTest) {
  rmSync(smokeLogPath, { force: true })
  app.setPath('userData', join(app.getPath('temp'), 'emotional-aquarium-smoke'))
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.bmad.emotionalaquarium')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  initDb()
  getOrCreateDeviceId()

  ipcMain.handle('app:getDeviceId', async () => {
    return getOrCreateDeviceId()
  })

  ipcMain.handle('app:getUpdateStatus', () => {
    return currentUpdateStatus
  })

  ipcMain.handle('app:getReleaseChannel', () => {
    return releaseChannel
  })

  ipcMain.handle('app:installUpdate', () => {
    if (currentUpdateStatus.phase === 'ready') {
      autoUpdater.quitAndInstall(false, true)
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
