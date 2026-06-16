<script lang="ts">
	import Button from './Button.svelte';
	import StatusTag from './StatusTag.svelte';
	import { formatTimestamp } from '$lib/format';
	import { locationName } from '$lib/locations';
	import type { CaseNote, ClinicalLocation } from '$lib/types';

	interface Props {
		/** Whether the dialog is shown. */
		open: boolean;
		note: CaseNote | null;
		locations: ClinicalLocation[];
		/** Invoked when the user dismisses the modal. */
		onclose: () => void;
	}

	let { open, note, locations, onclose }: Props = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	const titleId = 'case-note-detail-title';

	function onBackdropClick(event: MouseEvent) {
		if (event.target === dialog) {
			onclose();
		}
	}

	const detailRows = $derived(
		note
			? [
					{ label: 'Patient ID', value: note.Nhs },
					{ label: 'Tracking ID', value: note.CaseNo },
					{ label: 'Volume', value: String(note.Volume) },
					{ label: 'Current location', value: locationName(locations, note.LocHeld) },
					{ label: 'Base location', value: locationName(locations, note.BaseLocation) },
					{ label: 'Holder', value: note.Holder ?? '—' },
					{ label: 'Creator', value: note.Creator },
					{ label: 'Created', value: formatTimestamp(note.CreateDate) },
					{ label: 'Last updated', value: formatTimestamp(note.SyncDate) },
					{ label: 'Additional info', value: note.AddInfo ?? '—' }
				]
			: []
	);
</script>

<dialog
	bind:this={dialog}
	class="case-note-modal rounded-lg border border-neutral-muted bg-neutral-surface p-0"
	aria-labelledby={titleId}
	oncancel={(event) => {
		event.preventDefault();
		onclose();
	}}
	onclick={onBackdropClick}
>
	{#if note}
		<div class="ui-stack-v gap-4 p-6">
			<div class="ui-stack-h justify-between gap-4">
				<h2 id={titleId} class="sr-heading-s text-fg-default">{note.CaseNo}</h2>
				<StatusTag status={note.Status} />
			</div>

			<dl class="ui-stack-v gap-0">
				{#each detailRows as row (row.label)}
					<div class="ui-stack-h justify-between gap-4 border-b border-neutral-subtle-border py-2">
						<dt class="sr-label text-fg-muted">{row.label}</dt>
						<dd class="sr-body-m text-fg-default text-right">{row.value}</dd>
					</div>
				{/each}
			</dl>

			<div class="ui-stack-h justify-end gap-3">
				<Button href={`/notes/${note.CaseNoteSeq}`} variant="secondary">Move location</Button>
				<Button variant="primary" type="button" onclick={onclose}>Close</Button>
			</div>
		</div>
	{/if}
</dialog>

<style>
	.case-note-modal::backdrop {
		background: rgba(27, 41, 74, 0.45);
	}

	.case-note-modal {
		width: min(36rem, calc(100vw - 2 * var(--space-4)));
		box-shadow: var(--sr-elevation-overlay);
		position: fixed;
		inset: 0;
		margin: auto;
	}
</style>
