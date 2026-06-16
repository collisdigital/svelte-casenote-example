import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolves the SQLite database file path. Defaults to a `data/` directory
 * inside the service so mock CRUD transactions persist across runs. Override
 * with `DATABASE_PATH` (used by the container to mount a volume).
 */
export function databasePath(): string {
	const fromEnv = process.env.DATABASE_PATH;
	if (fromEnv && fromEnv.trim().length > 0) {
		return resolve(fromEnv);
	}
	return resolve(__dirname, '../../data/casenotes.sqlite');
}

let singleton: Database.Database | null = null;

/** Returns a shared, WAL-enabled database connection. */
export function getDb(): Database.Database {
	if (singleton) {
		return singleton;
	}

	const path = databasePath();
	mkdirSync(dirname(path), { recursive: true });

	const db = new Database(path);
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');
	singleton = db;
	return db;
}
