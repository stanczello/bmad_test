import Database from 'better-sqlite3'

export function initDb(dbPath: string): void {
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.close()
}
