# CLAUDE.md — apps/frontend (SvelteKit)

Rules for the Case Note Tracking web app. Read the root `CLAUDE.md` too.

Stack: **SvelteKit 2.65.1**, **Svelte 5.56.3**, **TailwindCSS v4**, TypeScript
(strict), `@sveltejs/adapter-node`. Tests: Vitest + Svelte Testing Library
(unit/component), Playwright (E2E).

## Svelte 5 — runes only

- Use runes exclusively: `$state`, `$derived`, `$props`, `$effect`,
  `$state.raw`. **Never** use legacy `export let` or `$:` reactive statements.
- Props are typed via an interface and `let { ... }: Props = $props()`.
- Snippets use the `Snippet` type and are rendered with `{@render children()}`.
- **`data` from load functions is already reactive** — derive from it with
  `const x = $derived(data.x)`. Do **not** copy `data` into `$state` and sync it
  with an `$effect`; that re-introduces the anti-pattern we removed.
- Reach for `$state.raw` only for genuinely immutable, read-mostly arrays where
  proxy overhead matters — not as a default.

## SvelteKit data flow

- **All writes (create / move / delete) go through named form actions** in
  `+page.server.ts`, enhanced with `use:enhance`. Never do loose client-side
  `fetch` calls for mutations.
- Server-only API access lives in `src/lib/server/api.ts` (the `$server`
  alias). It must only be imported from `+page.server.ts` / `+layout.server.ts`.
  Keep API base URL + assigning-authority handling there.
- Validate form input in the action; return `fail(status, { ... })` with field
  errors, and use a type guard when reading `form`/`ActionData` (no loose
  `'message' in form` checks).
- Path aliases: `$components` → `src/lib/components`, `$server` →
  `src/lib/server`, plus the standard `$lib`.

## Design system (STRICT — see `/design-system.md`)

- **Tokenized colours only.** Use semantic utilities (`text-brand-primary`,
  `bg-status-critical`, `border-neutral-muted`, `text-fg-muted`, …). **Never**
  use literal Tailwind colours (`red-500`, `blue-600`, `green-100`, …) anywhere.
- **Layout via stack utilities only:** `ui-stack-v`, `ui-stack-h`,
  `ui-stack-centered`. Never write raw `flex flex-col items-center` soup.
- **Typography via `sr-*` utilities** (`sr-heading-l`, `sr-body-m`, `sr-label`,
  `sr-caption`, …) — not ad-hoc `text-[18px]`.
- Spacing on the 4px grid (`gap-2`, `gap-4`, `p-6`, …). In scoped `<style>`,
  use SR token vars (`--space-*`, `--sr-color-*`, `--sr-radius-*`,
  `--sr-font-*`).
- Responsiveness is **mobile-first**: smaller base value, scale up with `sm:`
  etc. Prefer **container queries** (`container-type: inline-size`) when a
  component should respond to its own width (see `Table.svelte`, the header
  burger menu). Don't shrink large-screen spacing to fix small screens.
- Status is **never colour alone** — always pair an icon + text label (see
  `StatusTag.svelte`).
- Copy: sentence case; imperative action labels ("Move location", "Register
  case note"); specific, non-blaming errors; no emoji.

## Components

Reusable primitives in `src/lib/components/` already honour these rules: prefer
them over hand-rolling. `Button`, `Card`, `Table` (responsive, container-query
card layout via `data-label` cells), `StatusTag`, `Field`, `SelectField`,
`ErrorSummary`. Keep structural/styling tokens inside the component so consumer
pages only deal with semantic data.

## Dev / verify

- Dev server binds `0.0.0.0:5173` (port forwarding). `API_BASE_URL` points at
  the mock API; production Node build also needs `ORIGIN` set for form-action
  CSRF.
- Before finishing: `pnpm --filter @casenote/frontend check` (0/0) and
  `pnpm --filter @casenote/frontend test`. Add/adjust unit tests for new logic
  and an E2E spec for new user workflows.
