<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$components/Button.svelte';
	import Card from '$components/Card.svelte';
	import CaseNoteDetailModal from '$components/CaseNoteDetailModal.svelte';
	import ConfirmDialog from '$components/ConfirmDialog.svelte';
	import StatusTag from '$components/StatusTag.svelte';
	import Table from '$components/Table.svelte';
	import { formatTimestamp, relativeAge } from '$lib/format';
	import { locationName } from '$lib/locations';
	import type { CaseNote } from '$lib/types';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	// `data` is already reactive in SvelteKit — derive directly so the array
	// stays in sync with server-invalidated loads without a secondary effect.
	const caseNotes = $derived(data.caseNotes);
	const locations = $derived(data.locations);
	const total = $derived(caseNotes.length);

	const tableHeaders = [
		'Patient ID',
		'Tracking ID',
		'Current location',
		'Status',
		'Last updated',
		'Actions'
	];

	// The case note shown in the detail modal.
	let selectedNote = $state<CaseNote | null>(null);

	// The case note awaiting delete confirmation, and the form used to submit it.
	let pendingDelete = $state<CaseNote | null>(null);
	let deleteForm = $state<HTMLFormElement | null>(null);

	/** Strict type guard narrowing a failed delete action to its error shape. */
	function isActionError(value: ActionData): value is { message: string } {
		return value !== null && 'message' in value && typeof value.message === 'string';
	}

	const errorMessage = $derived(isActionError(form) ? form.message : null);
</script>

<svelte:head>
	<title>Case Note Tracking — Dashboard</title>
</svelte:head>

<div class="ui-stack-v gap-8">
	<div class="ui-stack-v gap-2">
		<h1 class="sr-heading-l text-fg-default">Tracked case notes</h1>
		<p class="sr-body-m text-fg-muted">
			{total}
			{total === 1 ? 'folder' : 'folders'} currently tracked across clinical locations.
		</p>
	</div>

	{#if errorMessage}
		<div
			role="alert"
			class="rounded-md border-2 border-status-critical bg-status-critical-surface p-4 sr-body-m text-status-critical"
		>
			{errorMessage}
		</div>
	{/if}

	<Card title="Active case notes">
		{#if total === 0}
			<p class="sr-body-m text-fg-muted">
				No case notes are being tracked. Register a case note to begin.
			</p>
		{:else}
			<Table headers={tableHeaders}>
				{#each caseNotes as note (note.CaseNoteSeq)}
					<tr class="border-b border-neutral-subtle-border hover:bg-neutral-subtle">
						<td data-label="Patient ID" class="px-3 py-3 sr-body-m text-fg-default font-mono">
							{note.Nhs}
						</td>
						<td data-label="Tracking ID" class="px-3 py-3">
						<button
							type="button"
							class="sr-body-m text-brand-link underline-offset-2 hover:underline cursor-pointer"
							onclick={() => (selectedNote = note)}
						>
							{note.CaseNo}
						</button>
					</td>
						<td data-label="Current location" class="px-3 py-3 sr-body-m text-fg-default">
							{locationName(locations, note.LocHeld)}
						</td>
						<td data-label="Status" class="px-3 py-3">
							<StatusTag status={note.Status} />
						</td>
						<td data-label="Last updated" class="px-3 py-3">
							<span class="ui-stack-v">
								<span class="sr-body-s text-fg-default">{formatTimestamp(note.SyncDate)}</span>
								<span class="sr-caption text-fg-muted">{relativeAge(note.SyncDate)}</span>
							</span>
						</td>
						<td data-label="Actions" class="px-3 py-3">
							<div class="ui-stack-h gap-2">
								<Button href={`/notes/${note.CaseNoteSeq}`} variant="secondary">
									Move location
								</Button>
								<Button type="button" variant="destructive" onclick={() => (pendingDelete = note)}>
									Delete
								</Button>
							</div>
						</td>
					</tr>
				{/each}
			</Table>
		{/if}
	</Card>
</div>

<!-- Hidden form is the progressive-enhancement delete path; the dialog submits it. -->
<form
	bind:this={deleteForm}
	method="POST"
	action="?/delete"
	class="hidden"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
			pendingDelete = null;
		};
	}}
>
	<input type="hidden" name="caseNoteSeq" value={pendingDelete?.CaseNoteSeq ?? ''} />
</form>

<CaseNoteDetailModal
	open={selectedNote !== null}
	note={selectedNote}
	{locations}
	onclose={() => (selectedNote = null)}
/>

<ConfirmDialog
	open={pendingDelete !== null}
	title="Delete case note"
	description={pendingDelete
		? `This removes ${pendingDelete.CaseNo} from active tracking. This cannot be undone.`
		: ''}
	confirmLabel="Delete case note"
	cancelLabel="Cancel"
	confirmVariant="destructive"
	onconfirm={() => deleteForm?.requestSubmit()}
	oncancel={() => (pendingDelete = null)}
/>
