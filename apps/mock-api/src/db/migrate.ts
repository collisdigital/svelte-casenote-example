import { getDb } from './connection.js';

/**
 * Creates the `case_notes` table. Run with `--fresh` to drop first
 * (used by `pnpm db:reset`). Column names mirror the WelshPAS CaseNote
 * contract; SQLite stores them verbatim.
 */
export function migrate(fresh = false): void {
	const db = getDb();

	if (fresh) {
		db.exec('DROP TABLE IF EXISTS case_notes;');
	}

	db.exec(`
		CREATE TABLE IF NOT EXISTS case_notes (
			CaseNoteSeq  INTEGER PRIMARY KEY AUTOINCREMENT,
			Nhs          TEXT    NOT NULL,
			CaseNo       TEXT    NOT NULL,
			Volume       INTEGER NOT NULL DEFAULT 1,
			LocHeld      TEXT    NOT NULL,
			Holder       TEXT,
			Status       TEXT    NOT NULL DEFAULT 'Active',
			BaseLocation TEXT    NOT NULL DEFAULT 'MRL',
			Creator      TEXT    NOT NULL DEFAULT 'system',
			CreateDate   TEXT    NOT NULL,
			SyncDate     TEXT    NOT NULL,
			AddInfo      TEXT
		);

		CREATE INDEX IF NOT EXISTS idx_case_notes_caseno ON case_notes (CaseNo);
		CREATE INDEX IF NOT EXISTS idx_case_notes_locheld ON case_notes (LocHeld);
	`);
}

const invokedDirectly = process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js');
if (invokedDirectly) {
	const fresh = process.argv.includes('--fresh');
	migrate(fresh);
	console.log(`[migrate] schema ready${fresh ? ' (fresh)' : ''}.`);
}
