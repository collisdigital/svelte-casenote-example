<script lang="ts">
	import type { Snippet } from 'svelte';

	interface TableProps {
		/** Column headers rendered in the table head. */
		headers: string[];
		/**
		 * Table body rows. Consumers render `<tr>` data rows only. Each `<td>`
		 * should carry a `data-label` matching its column so the responsive
		 * card layout can surface the column name per cell. Use `data-label=""`
		 * to opt a cell out of the inline label.
		 */
		children: Snippet;
	}

	let { headers, children }: TableProps = $props();
</script>

<!--
	Structural table tokens (overflow-x-auto, border-neutral-muted, sr-label)
	are isolated here so consumer pages only supply semantic data rows.

	A CSS container query (not a viewport media query) drives the responsive
	layout: below the breakpoint each row collapses into a stacked card,
	keyed off the table's own width so it adapts inside any column or panel.
-->
<div class="table-shell overflow-x-auto">
	<table class="responsive-table w-full border-collapse">
		<thead>
			<tr class="border-b border-neutral-muted text-left">
				{#each headers as header (header)}
					<th class="px-3 py-2 sr-label text-fg-muted">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{@render children()}
		</tbody>
	</table>
</div>

<style>
	/* Establish a query container so rows respond to the table's own inline
	   size rather than the viewport. */
	.table-shell {
		container-type: inline-size;
		container-name: casenote-table;
	}

	/* Below the breakpoint each row becomes a stacked card and the header row
	   is hidden; the column name is surfaced per-cell via data-label. All
	   colour/spacing comes from Single Record tokens. */
	@container casenote-table (max-width: 48rem) {
		.responsive-table :global(thead) {
			display: none;
		}

		.responsive-table,
		.responsive-table :global(tbody),
		.responsive-table :global(tr),
		.responsive-table :global(td) {
			display: block;
			width: 100%;
		}

		.responsive-table :global(tr) {
			margin-bottom: var(--space-3);
			padding: var(--space-2) var(--space-4);
			border: var(--sr-border-width-default) solid var(--sr-color-border-default);
			border-radius: var(--sr-radius-md);
			background: var(--sr-color-surface-small-cards);
		}

		.responsive-table :global(td) {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: space-between;
			gap: var(--space-2) var(--space-4);
			padding: var(--space-2) 0;
			border: 0;
			text-align: right;
		}

		/* Inline column label, drawn from the cell's data-label. */
		.responsive-table :global(td)::before {
			content: attr(data-label);
			flex: 0 0 auto;
			text-align: left;
			font: var(--sr-font-label);
			letter-spacing: var(--sr-type-label-tracking);
			color: var(--sr-color-text-secondary);
		}

		/* A cell can opt out of the label with data-label="". */
		.responsive-table :global(td[data-label=''])::before {
			content: none;
		}
	}
</style>
