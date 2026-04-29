import { describe, it, expect, afterEach } from 'vitest'
import path from 'node:path'
import fs from 'node:fs'
import { initDb } from '../../src/utils/initDb.js'

const TEST_DB_PATH = path.join(process.cwd(), 'test-aquarium.sqlite')

describe('initDb - SQLite initialisation', () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH)
    }
  })

  it('[P1] should open and close SQLite file without throwing', () => {
    expect(() => initDb(TEST_DB_PATH)).not.toThrow()
  })

  it('[P1] should create the SQLite file on disk', () => {
    initDb(TEST_DB_PATH)
    expect(fs.existsSync(TEST_DB_PATH)).toBe(true)
  })

  it('[P2] should be callable multiple times without error (idempotent open/close)', () => {
    expect(() => {
      initDb(TEST_DB_PATH)
      initDb(TEST_DB_PATH)
    }).not.toThrow()
  })
})
