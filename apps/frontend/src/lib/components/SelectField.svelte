<script lang="ts">
	import type { ClinicalLocation } from '$lib/types';

	interface SelectFieldProps {
		label: string;
		name: string;
		options: ClinicalLocation[];
		value?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		/** Text for the empty placeholder option. */
		placeholder?: string;
	}

	let {
		label,
		name,
		options,
		value = '',
		hint,
		error,
		required = false,
		placeholder = 'Select an option'
	}: SelectFieldProps = $props();

	const describedBy = $derived(
		[hint ? `${name}-hint` : null, error ? `${name}-error` : null].filter(Boolean).join(' ') ||
			undefined
	);
</script>

<div class="ui-stack-v gap-2">
	<label for={name} class="sr-label text-fg-default">
		{label}{#if required}<span class="text-status-critical"> *</span>{/if}
	</label>
	{#if hint}
		<p id={`${name}-hint`} class="sr-body-s text-fg-muted">{hint}</p>
	{/if}
	{#if error}
		<p id={`${name}-error`} class="sr-label text-status-critical">{error}</p>
	{/if}
	<select
		{name}
		id={name}
		{required}
		aria-describedby={describedBy}
		aria-invalid={error ? 'true' : undefined}
		class="min-h-[44px] rounded-sm border bg-neutral-surface px-3 py-2 sr-body-m text-fg-default
			{error ? 'border-status-critical border-2' : 'border-neutral-strong'}"
	>
		<option value="" disabled selected={value === ''}>{placeholder}</option>
		{#each options as option (option.id)}
			<option value={option.id} selected={option.id === value}>{option.name}</option>
		{/each}
	</select>
</div>
