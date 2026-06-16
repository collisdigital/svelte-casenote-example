import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import StatusTag from './StatusTag.svelte';

describe('StatusTag', () => {
	it('renders the status text label alongside the icon (never colour alone)', () => {
		render(StatusTag, { props: { status: 'Active' } });
		expect(screen.getByText('Active')).toBeInTheDocument();
	});

	it('applies the success surface token for an active status', () => {
		const { container } = render(StatusTag, { props: { status: 'Active' } });
		const tag = container.querySelector('span');
		expect(tag?.className).toContain('bg-status-success-surface');
		expect(tag?.className).toContain('text-status-success');
	});

	it('applies the info token for an in-transit status', () => {
		const { container } = render(StatusTag, { props: { status: 'In transit' } });
		const tag = container.querySelector('span');
		expect(tag?.className).toContain('bg-status-info-surface');
	});

	it('marks the icon as decorative for assistive tech', () => {
		const { container } = render(StatusTag, { props: { status: 'Active' } });
		const icon = container.querySelector('svg');
		expect(icon?.getAttribute('aria-hidden')).toBe('true');
	});
});
