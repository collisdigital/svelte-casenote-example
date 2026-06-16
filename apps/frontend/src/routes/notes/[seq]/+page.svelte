<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$components/Button.svelte';
	import Card from '$components/Card.svelte';
	import ConfirmDialog from '$components/ConfirmDialog.svelte';
	import ErrorSummary from '$components/ErrorSummary.svelte';
	import SelectField from '$components/SelectField.svelte';
	import Field from '$components/Field.svelte';
	import StatusTag from '$components/StatusTag.svelte';
	import { formatTimestamp } from '$lib/format';
	import { locationName } from '$lib/locations';
	import { TRACKING_STATUSES } from '$lib/statuses';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const note = $derived(data.caseNote);
	const locations = $derived(data.locations);
	const values = $derived(form && 'values' in form ? form.values : undefined);
	const fieldErrors = $derived(form && 'fieldErrors' in form ? form.fieldErrors : undefined);
	const summary = $derived(form && 'summary' in form ? (form.summary ?? []) : []);

	// Delete confirmation state + the hidden form the dialog submits.
	let confirmingDelete = $state(false);
	let deleteForm = $state<HTMLFormElement | null>(null);

	const detailRows = $derived([
		{ label: 'Patient ID', value: note.Nhs },
		{ label: 'Tracking ID', value: note.CaseNo },
		{ label: 'Volume', value: String(note.Volume) },
		{ label: 'Current location', value: locationName(locations, note.LocHeld) },
		{ label: 'Base location', value: locationName(locations, note.BaseLocation) },
		{ label: 'Holder', value: note.Holder ?? '—' },
		{ label: 'Last updated', value: formatTimestamp(note.SyncDate) }
	]);
</script>

<svelte:head>
	<title>Move {note.CaseNo} — Case Note Tracking</title>
</svelte:head>

<div class="ui-stack-v gap-8" style="max-width: var(--sr-max-width-form)">
	<div class="ui-stack-v gap-2">
		<a href="/" class="sr-label text-brand-link">Back to dashboard</a>
		<div class="ui-stack-h justify-between gap-4">
			<h1 class="sr-heading-l text-fg-default">Move case note</h1>
			<StatusTag status={note.Status} />
		</div>
		<p class="sr-body-m text-fg-muted">
			Record the folder’s new location. The Last Updated time is set automatically.
		</p>
	</div>

	<ErrorSummary errors={summary} />

	<Card title="Folder details">
		<dl class="ui-stack-v gap-3">
			{#each detailRows as row (row.label)}
				<div class="ui-stack-h justify-between gap-4 border-b border-neutral-subtle-border pb-2">
					<dt class="sr-label text-fg-muted">{row.label}</dt>
					<dd class="sr-body-m text-fg-default">{row.value}</dd>
				</div>
			{/each}
		</dl>
	</Card>

	<Card title="Transfer to new location">
		<form
			method="POST"
			action="?/move"
			class="ui-stack-v gap-6"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
				};
			}}
		>
			<SelectField
				label="Destination location"
				name="LocHeld"
				required
				options={locations}
				placeholder="Select a location"
				value={values?.LocHeld ?? note.LocHeld}
				error={fieldErrors?.LocHeld}
			/>
			<SelectField
				label="Status"
				name="Status"
				options={TRACKING_STATUSES}
				placeholder="Set automatically from location"
				value={values?.Status ?? ''}
				hint="Leave unset to derive the status from the destination"
			/>
			<Field
				label="Receiving holder"
				name="Holder"
				value={values?.Holder ?? ''}
				hint="Person or role receiving the folder (optional)"
			/>
			<Field
				label="Transfer note"
				name="AddInfo"
				value={values?.AddInfo ?? ''}
				hint="Optional reason for the move"
			/>

			<div class="ui-stack-h gap-3">
				<Button type="submit" variant="primary">Move location</Button>
				<Button href="/" variant="secondary">Cancel</Button>
			</div>
		</form>
	</Card>

	<Card title="Remove tracking record">
		<p class="sr-body-m text-fg-muted">
			Deleting removes this folder from active tracking. This cannot be undone.
		</p>
		<form
			bind:this={deleteForm}
			method="POST"
			action="?/delete"
			class="hidden"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
				};
			}}
		></form>
		<div>
			<Button type="button" variant="destructive" onclick={() => (confirmingDelete = true)}>
				Delete case note
			</Button>
		</div>
	</Card>
</div>

<ConfirmDialog
	open={confirmingDelete}
	title="Delete case note"
	description={`This removes ${note.CaseNo} from active tracking. This cannot be undone.`}
	confirmLabel="Delete case note"
	cancelLabel="Cancel"
	confirmVariant="destructive"
	onconfirm={() => deleteForm?.requestSubmit()}
	oncancel={() => (confirmingDelete = false)}
/>
