import { fetchLocations } from '$lib/server/api';
import { FALLBACK_LOCATIONS } from '$lib/locations';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch }) => {
	try {
		const locations = await fetchLocations(fetch);
		return { locations };
	} catch {
		// The reference endpoint may be briefly unavailable on cold start.
		return { locations: FALLBACK_LOCATIONS };
	}
};
