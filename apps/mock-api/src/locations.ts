/**
 * Plausible NHS clinical locations a physical case note folder can move
 * between. `id` is the stored `LocHeld` / `BaseLocation` code; `name` is the
 * human-readable label rendered in the UI.
 */
export interface ClinicalLocation {
	id: string;
	name: string;
}

export const LOCATIONS: ClinicalLocation[] = [
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

const LOCATION_IDS = new Set(LOCATIONS.map((location) => location.id));

export function isKnownLocation(id: string): boolean {
	return LOCATION_IDS.has(id);
}

export function locationName(id: string): string {
	return LOCATIONS.find((location) => location.id === id)?.name ?? id;
}
