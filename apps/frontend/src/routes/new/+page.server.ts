import { fail, redirect } from '@sveltejs/kit';
import { ApiRequestError, createCaseNote } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	/** Register a new case note tracking sequence. */
	create: async ({ request, fetch }) => {
		const data = await request.formData();
		const Nhs = String(data.get('Nhs') ?? '').trim();
		const CaseNo = String(data.get('CaseNo') ?? '').trim();
		const LocHeld = String(data.get('LocHeld') ?? '').trim();
		const Holder = String(data.get('Holder') ?? '').trim();
		const volumeRaw = String(data.get('Volume') ?? '1').trim();
		const AddInfo = String(data.get('AddInfo') ?? '').trim();

		const values = { Nhs, CaseNo, LocHeld, Holder, Volume: volumeRaw, AddInfo };

		const fieldErrors: Record<string, string> = {};
		if (!Nhs) fieldErrors.Nhs = 'Enter an NHS number';
		if (!CaseNo) fieldErrors.CaseNo = 'Enter a tracking ID';
		if (!LocHeld) fieldErrors.LocHeld = 'Select a current location';

		const volume = Number(volumeRaw);
		if (!Number.isInteger(volume) || volume < 1) {
			fieldErrors.Volume = 'Enter a volume number of 1 or more';
		}

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { values, fieldErrors });
		}

		try {
			await createCaseNote(fetch, {
				Nhs,
				CaseNo,
				LocHeld,
				Volume: volume,
				Holder: Holder || null,
				BaseLocation: 'MRL',
				Creator: 'prototype-user',
				AddInfo: AddInfo || null
			});
		} catch (error) {
			if (error instanceof ApiRequestError) {
				return fail(error.status, { values, summary: [error.message, ...error.fieldErrors] });
			}
			return fail(500, { values, summary: ['Could not register the case note'] });
		}

		redirect(303, '/');
	}
};
