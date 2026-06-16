<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';

	interface LayoutProps {
		children: Snippet;
	}

	let { children }: LayoutProps = $props();

	const navItems = [
		{ href: '/', label: 'Dashboard' },
		{ href: '/new', label: 'Register case note' }
	];

	const currentPath = $derived($page.url.pathname);

	// Burger menu state — only reachable below the header container breakpoint.
	let menuOpen = $state(false);

	function isActive(href: string): boolean {
		return href === '/' ? currentPath === '/' : currentPath.startsWith(href);
	}

	function closeMenu(): void {
		menuOpen = false;
	}
</script>

<div class="ui-stack-v min-h-screen bg-neutral-background">
	<header class="border-b border-neutral-muted bg-brand-primary">
		<div class="app-header mx-auto w-full max-w-[1400px] px-4 sm:px-6">
			<div class="ui-stack-h justify-between gap-6 py-4">
				<div class="ui-stack-h gap-3">
					<svg
						width="28"
						height="28"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-fg-inverse"
						aria-hidden="true"
						focusable="false"
					>
						<path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
						<path d="M14 4v6h6" />
						<path d="M8 14h8M8 18h5" />
					</svg>
					<span class="sr-heading-s text-fg-inverse">Case Note Tracking</span>
				</div>

				<!-- Inline navigation — shown while the header has room. -->
				<nav class="primary-nav" aria-label="Primary">
					<ul class="ui-stack-h gap-1">
						{#each navItems as item (item.href)}
							<li>
								<a
									href={item.href}
									aria-current={isActive(item.href) ? 'page' : undefined}
									class="ui-stack-centered rounded-md px-4 py-2 sr-label text-fg-inverse
										{isActive(item.href) ? 'bg-brand-primary-hover' : 'hover:bg-brand-primary-hover'}"
								>
									{item.label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>

				<!-- Burger toggle — shown once the header would otherwise wrap. -->
				<button
					type="button"
					class="menu-toggle ui-stack-centered min-h-[44px] min-w-[44px] rounded-md text-fg-inverse hover:bg-brand-primary-hover"
					aria-controls="mobile-nav"
					aria-expanded={menuOpen}
					aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					onclick={() => (menuOpen = !menuOpen)}
				>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
						focusable="false"
					>
						{#if menuOpen}
							<path d="M18 6 6 18M6 6l12 12" />
						{:else}
							<path d="M3 6h18M3 12h18M3 18h18" />
						{/if}
					</svg>
				</button>
			</div>

			<!-- Collapsed navigation — stacked dropdown for narrow headers. -->
			<nav
				id="mobile-nav"
				class="mobile-nav pb-4"
				data-open={menuOpen}
				aria-label="Primary"
			>
				<ul class="ui-stack-v gap-1">
					{#each navItems as item (item.href)}
						<li>
							<a
								href={item.href}
								aria-current={isActive(item.href) ? 'page' : undefined}
								onclick={closeMenu}
								class="ui-stack-h gap-2 rounded-md px-4 py-3 sr-label text-fg-inverse
									{isActive(item.href) ? 'bg-brand-primary-hover' : 'hover:bg-brand-primary-hover'}"
							>
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</header>

	<main class="mx-auto w-full max-w-[1400px] grow px-4 py-8 sm:px-6 sm:py-12">
		{@render children()}
	</main>

	<footer class="border-t border-neutral-muted bg-neutral-surface">
		<div class="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
			<p class="sr-caption text-fg-muted">
				NHS Wales (DHCW) Single Record — Case Note Tracking prototype. Synthetic data only.
			</p>
		</div>
	</footer>
</div>

<style>
	/* Drive the burger collapse off the header's own width (container query),
	   so the menu appears right as the title + links would start to wrap. */
	.app-header {
		container-type: inline-size;
		container-name: app-header;
	}

	/* Default (roomy header): inline nav visible, burger + dropdown hidden. */
	.menu-toggle,
	.mobile-nav {
		display: none;
	}

	@container app-header (max-width: 34rem) {
		.primary-nav {
			display: none;
		}

		.menu-toggle {
			display: flex;
		}

		.mobile-nav[data-open='true'] {
			display: block;
		}
	}
</style>
