<script lang="ts">
	import type { Snippet } from 'svelte';

	interface CardProps {
		/** Optional heading rendered in a card header row. */
		title?: string;
		/** Right-aligned actions snippet rendered in the header. */
		actions?: Snippet;
		children: Snippet;
	}

	let { title, actions, children }: CardProps = $props();
</script>

<section
	class="ui-stack-v gap-4 rounded-md border border-neutral-muted bg-neutral-surface p-4 sm:p-6"
>
	{#if title || actions}
		<header class="ui-stack-h justify-between gap-4">
			{#if title}
				<h2 class="sr-heading-s text-fg-default">{title}</h2>
			{/if}
			{#if actions}
				<div class="ui-stack-h gap-2">
					{@render actions()}
				</div>
			{/if}
		</header>
	{/if}
	{@render children()}
</section>
