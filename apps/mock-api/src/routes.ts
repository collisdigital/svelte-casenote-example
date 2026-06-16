import type { FastifyInstance } from 'fastify';
import { isKnownLocation, LOCATIONS } from './locations.js';
import { isKnownStatus, TRACKING_STATUSES } from './statuses.js';
import {
	createCaseNote,
	deleteCaseNote,
	getCaseNote,
	listCaseNotes,
	moveCaseNote
} from './repository.js';
import type { CreateCaseNoteInput, MoveCaseNoteInput } from './types.js';

interface SeqParams {
	caseNoteSeq: string;
}

/**
 * Case Note tracking CRUD routes, mounted under the assigning-authority
 * prefix to mirror the WelshPAS contract:
 *   /rest/welsh-pas/assigning-authority/:assigningAuthority/case-note
 */
export async function caseNoteRoutes(app: FastifyInstance): Promise<void> {
	const base = '/rest/welsh-pas/assigning-authority/:assigningAuthority/case-note';

	// Reference data — clinical locations a folder can move between.
	app.get('/rest/welsh-pas/locations', async () => LOCATIONS);

	// Reference data — the tracking-status vocabulary.
	app.get('/rest/welsh-pas/statuses', async () => TRACKING_STATUSES);

	// GET all
	app.get(base, async () => listCaseNotes());

	// GET one
	app.get<{ Params: SeqParams }>(`${base}/:caseNoteSeq`, async (request, reply) => {
		const seq = Number(request.params.caseNoteSeq);
		const record = getCaseNote(seq);
		if (!record) {
			return reply.code(404).send({ message: 'Case note not found' });
		}
		return record;
	});

	// POST — register a new tracking sequence
	app.post<{ Body: CreateCaseNoteInput }>(base, async (request, reply) => {
		const body = request.body ?? ({} as CreateCaseNoteInput);
		const errors = validateCreate(body);
		if (errors.length > 0) {
			return reply.code(400).send({ message: 'Validation failed', errors });
		}
		const created = createCaseNote(body);
		return reply.code(201).send(created);
	});

	// PATCH — move location
	app.patch<{ Params: SeqParams; Body: MoveCaseNoteInput }>(
		`${base}/:caseNoteSeq`,
		async (request, reply) => {
			const seq = Number(request.params.caseNoteSeq);
			const body = request.body ?? ({} as MoveCaseNoteInput);

			if (!body.LocHeld || !isKnownLocation(body.LocHeld)) {
				return reply.code(400).send({
					message: 'Validation failed',
					errors: ['Select a valid destination location']
				});
			}

			if (body.Status && !isKnownStatus(body.Status)) {
				return reply.code(400).send({
					message: 'Validation failed',
					errors: ['Select a valid status']
				});
			}

			const updated = moveCaseNote(seq, body);
			if (!updated) {
				return reply.code(404).send({ message: 'Case note not found' });
			}
			return updated;
		}
	);

	// DELETE
	app.delete<{ Params: SeqParams }>(`${base}/:caseNoteSeq`, async (request, reply) => {
		const seq = Number(request.params.caseNoteSeq);
		const removed = deleteCaseNote(seq);
		if (!removed) {
			return reply.code(404).send({ message: 'Case note not found' });
		}
		return reply.code(202).send();
	});
}

function validateCreate(body: CreateCaseNoteInput): string[] {
	const errors: string[] = [];
	if (!body.Nhs || body.Nhs.trim().length === 0) {
		errors.push('Enter an NHS number');
	}
	if (!body.CaseNo || body.CaseNo.trim().length === 0) {
		errors.push('Enter a tracking ID');
	}
	if (!body.LocHeld || !isKnownLocation(body.LocHeld)) {
		errors.push('Select a valid current location');
	}
	return errors;
}
