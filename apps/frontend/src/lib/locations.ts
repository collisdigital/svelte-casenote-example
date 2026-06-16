import type { ClinicalLocation } from './types';

/**
 * Fallback clinical locations, used when the mock API reference endpoint is
 * unavailable. The authoritative list comes from the API at runtime.
 */
export const FALLBACK_LOCATIONS: ClinicalLocation[] = [
	{ id: 'MRL', name: 'Medical Records Library' },
	{ id: 'OPD', name: 'Outpatients' },
	{ id: 'ED', name: 'Emergency Department' },
	{ id: 'THEATRE', name: 'Main Theatre' },
	{ id: 'WARD2', name: 'Ward 2' },
	{ id: 'WARD4', name: 'Ward 4' },
	{ id: 'RADIOLOGY', name: 'Radiology' },
	{ id: 'PATHOLOGY', name: 'Pathology' },
	{ id: 'CLINIC', name: 'Fracture Clinic' },
	{ id: 'ARCHIVE', name: 'Off-site Archive' }
];

export function locationName(locations: ClinicalLocation[], id: string): string {
	return locations.find((location) => location.id === id)?.name ?? id;
}
