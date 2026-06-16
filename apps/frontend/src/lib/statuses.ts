import type { ClinicalLocation } from './types';

/**
 * The fixed tracking-status vocabulary, shaped as `{ id, name }` so it can be
 * fed straight to `SelectField`. The stored value equals the label. Keep these
 * in step with the API (`apps/mock-api/src/statuses.ts`) and the tone mapping
 * in `format.ts`.
 */
export const TRACKING_STATUSES: ClinicalLocation[] = [
	{ id: 'Active', name: 'Active' },
	{ id: 'In transit', name: 'In transit' },
	{ id: 'Requested', name: 'Requested' },
	{ id: 'Missing', name: 'Missing' },
	{ id: 'Overdue', name: 'Overdue' },
	{ id: 'Archived', name: 'Archived' }
];
