<script lang="ts">
	import Button from './Button.svelte';

	interface ConfirmDialogProps {
		/** Whether the dialog is shown. */
		open: boolean;
		/** Dialog heading. */
		title: string;
		/** Supporting body copy. */
		description?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		/** Visual weight of the confirm button. */
		confirmVariant?: 'primary' | 'destructive';
		/** Invoked when the user confirms the action. */
		onconfirm: () => void;
		/** Invoked when the user dismisses (Cancel, Esc, or backdrop). */
		oncancel: () => void;
	}

	let {
		open,
		title,
		description,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		confirmVariant = 'primary',
		onconfirm,
		oncancel
	}: ConfirmDialogProps = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	// Drive the native modal from the `open` prop. showModal() gives us focus
	// trapping, Esc handling and the inert background for free.
	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	const titleId = 'confirm-dialog-title';
	const descId = 'confirm-dialog-desc';

	function onBackdropClick(event: MouseEvent) {
		// A click landing on the <dialog> itself (not its content) is the backdrop.
		if (event.target === dialog) {
			oncancel();
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="confirm-dialog rounded-lg border border-neutral-muted bg-neutral-surface p-0"
	aria-labelledby={titleId}
	aria-describedby={description ? descId : undefined}
	oncancel={(event) => {
		event.preventDefault();
		oncancel();
	}}
	onclick={onBackdropClick}
>
	<div class="ui-stack-v gap-4 p-6">
		<h2 id={titleId} class="sr-heading-s text-fg-default">{title}</h2>
		{#if description}
			<p id={descId} class="sr-body-m text-fg-muted">{description}</p>
		{/if}
		<div class="ui-stack-h justify-end gap-3">
			<Button variant="secondary" type="button" onclick={oncancel}>{cancelLabel}</Button>
			<Button variant={confirmVariant} type="button" onclick={onconfirm}>{confirmLabel}</Button>
		</div>
	</div>
</dialog>

<style>
	/* Solid scrim — clinical legibility over blur (design system rule). */
	.confirm-dialog::backdrop {
		background: rgba(27, 41, 74, 0.45);
	}

	.confirm-dialog {
		width: min(28rem, calc(100vw - 2 * var(--space-4)));
		box-shadow: var(--sr-elevation-overlay);
		/* Tailwind preflight resets the UA `margin: auto` that centres a modal
		   <dialog>, so restore centring explicitly. */
		position: fixed;
		inset: 0;
		margin: auto;
	}
</style>
