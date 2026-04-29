import Database from 'better-sqlite3'
import { app } from 'electron'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'

function getDbPath(): string {
  return join(app.getPath('userData'), 'aquarium.sqlite')
}

function ensureIdentityTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS device_identity (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      device_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `)
}

export function getOrCreateDeviceId(): string {
  const db = new Database(getDbPath())
  db.pragma('journal_mode = WAL')
  ensureIdentityTable(db)

  const row = db.prepare('SELECT device_id FROM device_identity WHERE id = 1').get() as
    | { device_id: string }
    | undefined

  if (row?.device_id) {
    db.close()
    return row.device_id
  }

  const deviceId = `anon_${randomUUID().replace(/-/g, '')}`
  db.prepare('INSERT INTO device_identity (id, device_id, created_at) VALUES (1, ?, ?)').run(
    deviceId,
    new Date().toISOString()
  )
  db.close()
  return deviceId
}

export function initDb(): void {
  const db = new Database(getDbPath())
  db.pragma('journal_mode = WAL')
  ensureIdentityTable(db)
  db.close()
}
