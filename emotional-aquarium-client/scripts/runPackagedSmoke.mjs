/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const smokeLogPath = join(tmpdir(), 'emotional-aquarium-smoke-result.log')

function findWindowsExecutable(distDir) {
  const winDir = join(distDir, 'win-unpacked')

  if (!existsSync(winDir)) {
    throw new Error(`Windows unpacked directory not found: ${winDir}`)
  }

  const executable = readdirSync(winDir).find((entry) => entry.endsWith('.exe'))

  if (!executable) {
    throw new Error(`No Windows executable found in ${winDir}`)
  }

  return join(winDir, executable)
}

function findMacExecutable(distDir) {
  const macDir = join(distDir, 'mac')

  if (!existsSync(macDir)) {
    throw new Error(`macOS app directory not found: ${macDir}`)
  }

  const appBundle = readdirSync(macDir).find((entry) => entry.endsWith('.app'))

  if (!appBundle) {
    throw new Error(`No macOS app bundle found in ${macDir}`)
  }

  const binaryDir = join(macDir, appBundle, 'Contents', 'MacOS')
  const binary = readdirSync(binaryDir)[0]

  if (!binary) {
    throw new Error(`No macOS executable found in ${binaryDir}`)
  }

  return join(binaryDir, binary)
}

function resolveExecutablePath(targetPlatform) {
  const distDir = join(process.cwd(), 'dist')

  if (targetPlatform === 'win') {
    return findWindowsExecutable(distDir)
  }

  if (targetPlatform === 'mac') {
    return findMacExecutable(distDir)
  }

  throw new Error(`Unsupported smoke target: ${targetPlatform}`)
}

async function run() {
  const targetPlatform = process.argv[2]

  if (!targetPlatform) {
    throw new Error('Usage: node ./scripts/runPackagedSmoke.mjs <win|mac>')
  }

  if (targetPlatform === 'win' && process.platform !== 'win32') {
    throw new Error('Windows packaged smoke must run on Windows.')
  }

  if (targetPlatform === 'mac' && process.platform !== 'darwin') {
    throw new Error('macOS packaged smoke must run on macOS.')
  }

  const executablePath = resolveExecutablePath(targetPlatform)
  rmSync(smokeLogPath, { force: true })

  await new Promise((resolve, reject) => {
    const child = spawn(executablePath, ['--smoke-test'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        ELECTRON_ENABLE_LOGGING: '1'
      }
    })

    const timeout = setTimeout(() => {
      child.kill()
      reject(new Error('Packaged smoke timed out after 45 seconds.'))
    }, 45000)

    child.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })

    child.on('exit', (code) => {
      clearTimeout(timeout)

      if (code === 0) {
        resolve(undefined)
        return
      }

      const smokeDetails = existsSync(smokeLogPath)
        ? readFileSync(smokeLogPath, 'utf8').trim()
        : 'No packaged smoke details were written.'

      reject(new Error(`Packaged smoke exited with code ${code ?? 'unknown'}: ${smokeDetails}`))
    })
  })

  console.log(`Packaged smoke passed for ${targetPlatform}.`)
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
