import { fail } from '@sveltejs/kit';
import { ApiRequestError, deleteCaseNote, fetchCaseNotes } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const caseNotes = await fetchCaseNotes(fetch);
	return { caseNotes };
};

export const actions: Actions = {
	/** Remove a tracked case note record. */
	delete: async ({ request, fetch }) => {
		const data = await request.formData();
		const seq = Number(data.get('caseNoteSeq'));

		if (!Number.isInteger(seq) || seq <= 0) {
			return fail(400, { message: 'Select a valid case note to delete' });
		}

		try {
			await deleteCaseNote(fetch, seq);
			return { deleted: seq };
		} catch (error) {
			if (error instanceof ApiRequestError) {
				return fail(error.status, { message: error.message });
			}
			return fail(500, { message: 'Could not delete the case note' });
		}
	}
};
