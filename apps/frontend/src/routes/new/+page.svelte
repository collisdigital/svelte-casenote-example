<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$components/Button.svelte';
	import Card from '$components/Card.svelte';
	import ErrorSummary from '$components/ErrorSummary.svelte';
	import Field from '$components/Field.svelte';
	import SelectField from '$components/SelectField.svelte';
	import type { PageData, ActionData } from './$types';

	interface Props {
		data: PageData;
		form: ActionData;
	}

	let { data, form }: Props = $props();

	const locations = $derived(data.locations);
	const values = $derived(form?.values);
	const fieldErrors = $derived(form && 'fieldErrors' in form ? form.fieldErrors : undefined);
	const summary = $derived(form && 'summary' in form ? (form.summary ?? []) : []);
</script>

<svelte:head>
	<title>Register a case note — Case Note Tracking</title>
</svelte:head>

<div class="ui-stack-v gap-8" style="max-width: var(--sr-max-width-form)">
	<div class="ui-stack-v gap-2">
		<a href="/" class="sr-label text-brand-link">Back to dashboard</a>
		<h1 class="sr-heading-l text-fg-default">Register a case note</h1>
		<p class="sr-body-m text-fg-muted">
			Create a new tracking sequence for a physical patient folder.
		</p>
	</div>

	<ErrorSummary errors={summary} />

	<Card>
		<form
			method="POST"
			action="?/create"
			class="ui-stack-v gap-6"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
				};
			}}
		>
			<Field
				label="Patient NHS number"
				name="Nhs"
				required
				value={values?.Nhs ?? ''}
				error={fieldErrors?.Nhs}
				hint="Grouped as XXX XXX XXXX"
				placeholder="000 000 0000"
			/>
			<Field
				label="Tracking ID"
				name="CaseNo"
				required
				value={values?.CaseNo ?? ''}
				error={fieldErrors?.CaseNo}
				hint="The case number printed on the folder"
				placeholder="CN-000000"
			/>
			<Field
				label="Volume"
				name="Volume"
				type="number"
				inputmode="numeric"
				value={values?.Volume ?? '1'}
				error={fieldErrors?.Volume}
			/>
			<SelectField
				label="Current location"
				name="LocHeld"
				required
				options={locations}
				placeholder="Select a location"
				value={values?.LocHeld ?? ''}
				error={fieldErrors?.LocHeld}
			/>
			<Field
				label="Holder"
				name="Holder"
				value={values?.Holder ?? ''}
				hint="Person or role currently responsible for the folder (optional)"
			/>
			<Field
				label="Additional information"
				name="AddInfo"
				value={values?.AddInfo ?? ''}
				hint="Optional notes, e.g. reason for request"
			/>

			<div class="ui-stack-h gap-3">
				<Button type="submit" variant="primary">Register case note</Button>
				<Button href="/" variant="secondary">Cancel</Button>
			</div>
		</form>
	</Card>
</div>
