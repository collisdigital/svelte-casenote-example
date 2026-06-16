/** Maps a tracking status to a Single Record status token group. */
export type StatusTone = 'success' | 'info' | 'warning' | 'critical' | 'neutral';

export function statusTone(status: string): StatusTone {
	switch (status.toLowerCase()) {
		case 'active':
			return 'success';
		case 'in transit':
			return 'info';
		case 'requested':
			return 'warning';
		case 'missing':
		case 'overdue':
			return 'critical';
		default:
			return 'neutral';
	}
}

/** Formats an ISO timestamp as `DD MMM YYYY, HH:mm` per SR number conventions. */
export function formatTimestamp(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return iso;
	}
	return new Intl.DateTimeFormat('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

/** Concise relative age, e.g. "2 hours ago", "3 days ago". */
export function relativeAge(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return '';
	}
	const seconds = Math.round((Date.now() - date.getTime()) / 1000);
	const rtf = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });

	const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
		[60, 'second'],
		[60, 'minute'],
		[24, 'hour'],
		[7, 'day'],
		[4.345, 'week'],
		[12, 'month'],
		[Number.POSITIVE_INFINITY, 'year']
	];

	let value = -seconds;
	for (const [amount, unit] of divisions) {
		if (Math.abs(value) < amount) {
			return rtf.format(Math.round(value), unit);
		}
		value /= amount;
	}
	return rtf.format(Math.round(value), 'year');
}
