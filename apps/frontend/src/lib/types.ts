/**
 * Case Note domain types for the frontend, aligned with the WelshPAS
 * `CaseNote` contract. Only tracking-relevant fields are modelled.
 */
export interface CaseNote {
	CaseNoteSeq: number;
	/** Patient NHS number (Patient ID). */
	Nhs: string;
	/** Case number (Tracking ID). */
	CaseNo: string;
	Volume: number;
	/** Current location code. */
	LocHeld: string;
	Holder: string | null;
	Status: string;
	BaseLocation: string;
	Creator: string;
	CreateDate: string;
	/** Last Updated timestamp (ISO). */
	SyncDate: string;
	AddInfo: string | null;
}

export interface ClinicalLocation {
	id: string;
	name: string;
}

export interface CreateCaseNotePayload {
	Nhs: string;
	CaseNo: string;
	Volume?: number;
	LocHeld: string;
	Holder?: string | null;
	BaseLocation?: string;
	Creator?: string;
	AddInfo?: string | null;
}

export interface MoveCaseNotePayload {
	LocHeld: string;
	Holder?: string | null;
	Status?: string | null;
	AddInfo?: string | null;
}

export interface ApiError {
	message: string;
	errors?: string[];
}
