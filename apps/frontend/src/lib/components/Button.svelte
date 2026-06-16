<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'destructive';

	interface ButtonProps {
		variant?: Variant;
		type?: 'button' | 'submit' | 'reset';
		href?: string;
		disabled?: boolean;
		name?: string;
		value?: string;
		formaction?: string;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		type = 'button',
		href,
		disabled = false,
		name,
		value,
		formaction,
		onclick,
		children
	}: ButtonProps = $props();

	const base =
		'ui-stack-centered gap-2 rounded-md px-4 py-2 sr-label min-h-[44px] cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60';

	const variants: Record<Variant, string> = {
		primary: 'bg-brand-primary text-fg-inverse hover:bg-brand-primary-hover',
		secondary:
			'bg-neutral-surface text-brand-primary border border-neutral-strong hover:bg-neutral-subtle',
		destructive: 'bg-status-critical text-fg-inverse hover:opacity-90'
	};

	const classes = $derived(`${base} ${variants[variant]}`);
</script>

{#if href}
	<a {href} class={classes} aria-disabled={disabled}>
		{@render children()}
	</a>
{:else}
	<button {type} {name} {value} {formaction} {disabled} {onclick} class={classes}>
		{@render children()}
	</button>
{/if}
