import { error, fail, redirect } from '@sveltejs/kit';
import {
	ApiRequestError,
	deleteCaseNote,
	fetchCaseNote,
	moveCaseNote
} from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

function parseSeq(raw: string): number {
	const seq = Number(raw);
	if (!Number.isInteger(seq) || seq <= 0) {
		throw error(404, { message: 'Case note not found' });
	}
	return seq;
}

export const load: PageServerLoad = async ({ params, fetch }) => {
	const seq = parseSeq(params.seq);
	try {
		const caseNote = await fetchCaseNote(fetch, seq);
		return { caseNote };
	} catch (err) {
		if (err instanceof ApiRequestError && err.status === 404) {
			throw error(404, { message: 'Case note not found' });
		}
		throw err;
	}
};

export const actions: Actions = {
	/** Move the folder to a new clinical location. */
	move: async ({ params, request, fetch }) => {
		const seq = parseSeq(params.seq);
		const data = await request.formData();
		const LocHeld = String(data.get('LocHeld') ?? '').trim();
		const Holder = String(data.get('Holder') ?? '').trim();
		const Status = String(data.get('Status') ?? '').trim();
		const AddInfo = String(data.get('AddInfo') ?? '').trim();

		const values = { LocHeld, Holder, Status, AddInfo };
		const fieldErrors: Record<string, string> = {};
		if (!LocHeld) {
			fieldErrors.LocHeld = 'Select a destination location';
		}

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { values, fieldErrors });
		}

		try {
			await moveCaseNote(fetch, seq, {
				LocHeld,
				Holder: Holder || null,
				Status: Status || null,
				AddInfo: AddInfo || null
			});
		} catch (err) {
			if (err instanceof ApiRequestError) {
				return fail(err.status, { values, summary: [err.message, ...err.fieldErrors] });
			}
			return fail(500, { values, summary: ['Could not move the case note'] });
		}

		redirect(303, '/');
	},

	/** Delete the tracking record from the detail view. */
	delete: async ({ params, fetch }) => {
		const seq = parseSeq(params.seq);
		try {
			await deleteCaseNote(fetch, seq);
		} catch (err) {
			if (err instanceof ApiRequestError) {
				return fail(err.status, { summary: [err.message] });
			}
			return fail(500, { summary: ['Could not delete the case note'] });
		}
		redirect(303, '/');
	}
};
