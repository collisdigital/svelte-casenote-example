<script lang="ts">
	interface ErrorSummaryProps {
		errors: string[];
		title?: string;
	}

	let { errors, title = 'There is a problem' }: ErrorSummaryProps = $props();
</script>

{#if errors.length > 0}
	<div
		role="alert"
		class="ui-stack-v gap-2 rounded-md border-2 border-status-critical bg-status-critical-surface p-4"
	>
		<p class="sr-heading-xs text-status-critical">{title}</p>
		<ul class="ui-stack-v gap-1">
			{#each errors as error (error)}
				<li class="sr-body-m text-status-critical">{error}</li>
			{/each}
		</ul>
	</div>
{/if}
