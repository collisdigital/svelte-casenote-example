import { getDb } from './db/connection.js';
import type { CaseNote, CreateCaseNoteInput, MoveCaseNoteInput } from './types.js';

function nowIso(): string {
	return new Date().toISOString();
}

export function listCaseNotes(): CaseNote[] {
	return getDb()
		.prepare('SELECT * FROM case_notes ORDER BY datetime(SyncDate) DESC')
		.all() as CaseNote[];
}

export function getCaseNote(seq: number): CaseNote | undefined {
	return getDb()
		.prepare('SELECT * FROM case_notes WHERE CaseNoteSeq = ?')
		.get(seq) as CaseNote | undefined;
}

export function createCaseNote(input: CreateCaseNoteInput): CaseNote {
	const db = getDb();
	const timestamp = nowIso();

	const result = db
		.prepare(
			`INSERT INTO case_notes
				(Nhs, CaseNo, Volume, LocHeld, Holder, Status, BaseLocation, Creator, CreateDate, SyncDate, AddInfo)
			VALUES
				(@Nhs, @CaseNo, @Volume, @LocHeld, @Holder, @Status, @BaseLocation, @Creator, @CreateDate, @SyncDate, @AddInfo)`
		)
		.run({
			Nhs: input.Nhs,
			CaseNo: input.CaseNo,
			Volume: input.Volume ?? 1,
			LocHeld: input.LocHeld,
			Holder: input.Holder ?? null,
			Status: input.Status ?? 'Active',
			BaseLocation: input.BaseLocation ?? 'MRL',
			Creator: input.Creator ?? 'system',
			CreateDate: timestamp,
			SyncDate: timestamp,
			AddInfo: input.AddInfo ?? null
		});

	return getCaseNote(Number(result.lastInsertRowid)) as CaseNote;
}

/** Moves a folder to a new location, refreshing the Last Updated timestamp. */
export function moveCaseNote(seq: number, input: MoveCaseNoteInput): CaseNote | undefined {
	const existing = getCaseNote(seq);
	if (!existing) {
		return undefined;
	}

	const inTransit = input.LocHeld !== existing.BaseLocation;
	const explicitStatus =
		typeof input.Status === 'string' && input.Status.trim().length > 0
			? input.Status.trim()
			: null;
	// An explicit status wins; otherwise derive from destination vs. base.
	const Status = explicitStatus ?? (inTransit ? 'In transit' : 'Active');

	getDb()
		.prepare(
			`UPDATE case_notes
			SET LocHeld = @LocHeld,
			    Holder = @Holder,
			    Status = @Status,
			    AddInfo = @AddInfo,
			    SyncDate = @SyncDate
			WHERE CaseNoteSeq = @CaseNoteSeq`
		)
		.run({
			CaseNoteSeq: seq,
			LocHeld: input.LocHeld,
			Holder: input.Holder ?? existing.Holder,
			Status,
			AddInfo: input.AddInfo ?? existing.AddInfo,
			SyncDate: nowIso()
		});

	return getCaseNote(seq);
}

export function deleteCaseNote(seq: number): boolean {
	const result = getDb().prepare('DELETE FROM case_notes WHERE CaseNoteSeq = ?').run(seq);
	return result.changes > 0;
}
