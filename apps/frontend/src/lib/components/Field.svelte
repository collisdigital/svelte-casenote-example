<script lang="ts">
	interface FieldProps {
		label: string;
		name: string;
		value?: string;
		hint?: string;
		error?: string;
		required?: boolean;
		type?: 'text' | 'number';
		placeholder?: string;
		inputmode?: 'text' | 'numeric';
	}

	let {
		label,
		name,
		value = '',
		hint,
		error,
		required = false,
		type = 'text',
		placeholder,
		inputmode
	}: FieldProps = $props();

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
	<input
		{type}
		{name}
		{placeholder}
		{inputmode}
		id={name}
		{value}
		{required}
		aria-describedby={describedBy}
		aria-invalid={error ? 'true' : undefined}
		class="min-h-[44px] rounded-sm border bg-neutral-surface px-3 py-2 sr-body-m text-fg-default
			{error ? 'border-status-critical border-2' : 'border-neutral-strong'}"
	/>
</div>
