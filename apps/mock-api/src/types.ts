/**
 * Contract-aligned Case Note domain types.
 *
 * Field names mirror the WelshPAS REST API `CaseNote` schema (PascalCase) so
 * the mock service stays a faithful stand-in for the real assigning-authority
 * endpoints. Only the subset of fields relevant to physical folder tracking
 * is persisted.
 */

/** A tracked physical case note folder. Mirrors the WelshPAS `CaseNote` schema. */
export interface CaseNote {
	/** Primary key — the case note tracking sequence. */
	CaseNoteSeq: number;
	/** Patient NHS number (Patient ID). */
	Nhs: string;
	/** Case number (human-facing Tracking ID). */
	CaseNo: string;
	/** Folder volume number. */
	Volume: number;
	/** Location code where the folder is currently held. */
	LocHeld: string;
	/** Person/role currently holding the folder. */
	Holder: string | null;
	/** Tracking lifecycle status, e.g. "Active", "In transit", "Archived". */
	Status: string;
	/** Base/home location code for the folder. */
	BaseLocation: string;
	/** User that created the tracking record. */
	Creator: string;
	/** ISO timestamp the record was created. */
	CreateDate: string;
	/** ISO timestamp of the last tracking update (Last Updated). */
	SyncDate: string;
	/** Free-text additional information. */
	AddInfo: string | null;
}

/** Payload accepted when registering a new tracking sequence (POST). */
export interface CreateCaseNoteInput {
	Nhs: string;
	CaseNo: string;
	Volume?: number;
	LocHeld: string;
	Holder?: string | null;
	Status?: string;
	BaseLocation?: string;
	Creator?: string;
	AddInfo?: string | null;
}

/** Payload accepted when moving a folder to a new location (PATCH). */
export interface MoveCaseNoteInput {
	LocHeld: string;
	Holder?: string | null;
	/** Explicit tracking status. When omitted, the status is derived from the
	 * destination vs. base location. */
	Status?: string | null;
	AddInfo?: string | null;
}
