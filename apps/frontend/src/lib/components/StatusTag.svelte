<script lang="ts">
	import { statusTone, type StatusTone } from '$lib/format';

	interface StatusTagProps {
		status: string;
	}

	let { status }: StatusTagProps = $props();

	const tone = $derived(statusTone(status));

	// Explicit class strings per tone — required so Tailwind can statically
	// detect the semantic utilities (no literal colours).
	const toneClasses: Record<StatusTone, string> = {
		success: 'bg-status-success-surface text-status-success',
		info: 'bg-status-info-surface text-status-info',
		warning: 'bg-status-warning-surface text-status-warning',
		critical: 'bg-status-critical-surface text-status-critical',
		neutral: 'bg-neutral-subtle text-fg-muted'
	};
</script>

<!-- Colour is never used alone: an icon and the text label always accompany it. -->
<span
	class={`ui-stack-h gap-2 rounded-full px-3 py-1 sr-label ${toneClasses[tone]}`}
>
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		{#if tone === 'success'}
			<path d="M20 6 9 17l-5-5" />
		{:else if tone === 'info'}
			<circle cx="12" cy="12" r="9" />
			<path d="M12 16v-4M12 8h.01" />
		{:else if tone === 'warning'}
			<path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
			<path d="M12 9v4M12 17h.01" />
		{:else if tone === 'critical'}
			<circle cx="12" cy="12" r="9" />
			<path d="M15 9l-6 6M9 9l6 6" />
		{:else}
			<circle cx="12" cy="12" r="9" />
		{/if}
	</svg>
	{status}
</span>
