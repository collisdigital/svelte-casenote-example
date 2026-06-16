import { describe, expect, it } from 'vitest';
import { formatTimestamp, statusTone } from './format';

describe('statusTone', () => {
	it('maps active to success', () => {
		expect(statusTone('Active')).toBe('success');
	});

	it('maps in transit to info', () => {
		expect(statusTone('In transit')).toBe('info');
	});

	it('maps missing to critical', () => {
		expect(statusTone('Missing')).toBe('critical');
	});

	it('falls back to neutral for unknown statuses', () => {
		expect(statusTone('Archived')).toBe('neutral');
	});
});

describe('formatTimestamp', () => {
	it('formats an ISO date as DD MMM YYYY, HH:mm', () => {
		const formatted = formatTimestamp('2026-03-15T09:30:00.000Z');
		expect(formatted).toMatch(/2026/);
		expect(formatted).toMatch(/Mar/);
	});

	it('returns the original string for invalid input', () => {
		expect(formatTimestamp('not-a-date')).toBe('not-a-date');
	});
});
