import { env } from '$env/dynamic/private';
import type {
	CaseNote,
	ClinicalLocation,
	CreateCaseNotePayload,
	MoveCaseNotePayload
} from '$lib/types';

/**
 * Server-side client for the mock Case Note API. All write paths go through
 * SvelteKit form actions (never loose client fetches), so this module is only
 * ever imported from `+page.server.ts` / `+layout.server.ts`.
 */

/** Base URL of the mock API. Overridable for container networking. */
function apiBaseUrl(): string {
	return env.API_BASE_URL ?? 'http://localhost:4000';
}

/** Assigning authority segment of the WelshPAS contract. */
const ASSIGNING_AUTHORITY = env.ASSIGNING_AUTHORITY ?? 'AA149';

function caseNotePath(seq?: number): string {
	const base = `/rest/welsh-pas/assigning-authority/${ASSIGNING_AUTHORITY}/case-note`;
	return seq === undefined ? base : `${base}/${seq}`;
}

export class ApiRequestError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly fieldErrors: string[] = []
	) {
		super(message);
		this.name = 'ApiRequestError';
	}
}

async function request<T>(
	fetchFn: typeof fetch,
	path: string,
	init?: RequestInit
): Promise<T> {
	const headers: Record<string, string> = {
		// Audit headers required by the WelshPAS contract.
		'X-Requesting-Service': 'casenote-tracking-ui',
		'X-Requesting-User': 'prototype-user',
		...((init?.headers as Record<string, string>) ?? {})
	};

	// Only declare a JSON content-type when we actually send a body, so
	// bodyless requests (DELETE) are not rejected by strict body parsers.
	if (init?.body !== undefined) {
		headers['content-type'] = 'application/json';
	}

	const response = await fetchFn(`${apiBaseUrl()}${path}`, {
		...init,
		headers
	});

	if (response.status === 202 || response.status === 204) {
		return undefined as T;
	}

	const text = await response.text();
	const payload = text ? JSON.parse(text) : undefined;

	if (!response.ok) {
		const message = payload?.message ?? `Request failed (${response.status})`;
		throw new ApiRequestError(message, response.status, payload?.errors ?? []);
	}

	return payload as T;
}

export async function fetchCaseNotes(fetchFn: typeof fetch): Promise<CaseNote[]> {
	return request<CaseNote[]>(fetchFn, caseNotePath());
}

export async function fetchCaseNote(fetchFn: typeof fetch, seq: number): Promise<CaseNote> {
	return request<CaseNote>(fetchFn, caseNotePath(seq));
}

export async function fetchLocations(fetchFn: typeof fetch): Promise<ClinicalLocation[]> {
	return request<ClinicalLocation[]>(fetchFn, '/rest/welsh-pas/locations');
}

export async function createCaseNote(
	fetchFn: typeof fetch,
	payload: CreateCaseNotePayload
): Promise<CaseNote> {
	return request<CaseNote>(fetchFn, caseNotePath(), {
		method: 'POST',
		body: JSON.stringify(payload)
	});
}

export async function moveCaseNote(
	fetchFn: typeof fetch,
	seq: number,
	payload: MoveCaseNotePayload
): Promise<CaseNote> {
	return request<CaseNote>(fetchFn, caseNotePath(seq), {
		method: 'PATCH',
		body: JSON.stringify(payload)
	});
}

export async function deleteCaseNote(fetchFn: typeof fetch, seq: number): Promise<void> {
	await request<void>(fetchFn, caseNotePath(seq), { method: 'DELETE' });
}
