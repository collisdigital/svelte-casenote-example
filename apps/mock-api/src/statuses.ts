/**
 * The fixed tracking-status vocabulary a case note folder can carry. Values
 * are stored verbatim in `CaseNote.Status` and drive the UI status tone.
 */
export const TRACKING_STATUSES: string[] = [
	'Active',
	'In transit',
	'Requested',
	'Missing',
	'Overdue',
	'Archived'
];

const STATUS_SET = new Set(TRACKING_STATUSES.map((status) => status.toLowerCase()));

export function isKnownStatus(status: string): boolean {
	return STATUS_SET.has(status.toLowerCase());
}
