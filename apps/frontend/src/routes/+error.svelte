<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$components/Button.svelte';
</script>

<div class="ui-stack-v gap-6" style="max-width: var(--sr-max-width-prose)">
	<h1 class="sr-heading-l text-fg-default">{$page.status}</h1>
	<p class="sr-body-m text-fg-muted">
		{$page.error?.message ?? 'Something went wrong'}
	</p>
	<div>
		<Button href="/" variant="primary">Back to dashboard</Button>
	</div>
</div>
