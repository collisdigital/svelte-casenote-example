# CLAUDE.md — NHS Case Note Tracking (monorepo root)

Guidance for AI agents working anywhere in this repository. Each app also has
its own `CLAUDE.md` with package-specific rules — read the one nearest the file
you are editing **in addition** to this root file.

## What this is

A production-prototype for tracking physical paper patient folders (**case
notes**) across NHS clinical locations. Two apps in a pnpm workspace:

- `apps/frontend` — SvelteKit 2 + Svelte 5 (runes) + Tailwind v4.
- `apps/mock-api` — Fastify 5 + `better-sqlite3`, mirroring the WelshPAS
  `CaseNote` contract.

This is a healthcare context: accuracy, accessibility (WCAG 2.2 AA), and
consistency are non-negotiable. Use synthetic data only — never real patient
identifiers.

## Toolchain & workspace

- **Package manager: pnpm only** (`pnpm@10.32.1`). Never use `npm`/`yarn` to
  install or add dependencies. Node `>=22`.
- This is a **pnpm workspace**. Run package scripts with filters from the root,
  e.g. `pnpm --filter @casenote/frontend <script>`.
- `better-sqlite3` and `esbuild` are the only approved build scripts
  (`pnpm.onlyBuiltDependencies`). Vite is pinned to v6 via `pnpm.overrides` to
  keep SvelteKit and Vitest on one Vite version — do not remove this override.

## Common commands (run from the repo root)

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install all workspace deps |
| `pnpm run db:reset` | Drop, migrate, re-seed the SQLite database |
| `pnpm run dev` | Run frontend + mock API in parallel |
| `pnpm run dev:api` / `pnpm run dev:frontend` | Run one app |
| `pnpm run check` | `svelte-check` (frontend type check) |
| `pnpm run test` | Vitest unit/component tests |
| `pnpm run test:e2e` | Playwright E2E (self-boots the API + app + seeded test DB) |
| `pnpm run lint` | Type-check both apps |
| `pnpm run format` | Prettier write |

## Definition of done (always do before finishing)

1. `pnpm run check` — zero errors **and** zero warnings.
2. `pnpm run test` — all unit tests pass.
3. For non-trivial UI/server changes, build the affected app
   (`pnpm --filter <pkg> build`).

## House rules

- Keep changes minimal and scoped to the request. Don't refactor, rename, or
  "improve" unrelated code, and don't add comments/types to code you didn't
  touch.
- Don't create Markdown docs to describe your changes unless explicitly asked.
- Prefer editing existing files over creating new ones.
- Formatting: tabs, single quotes, no trailing commas, width 100 (see
  `.prettierrc`). Match the surrounding style.
- Destructive/irreversible actions (deleting files, `git push`, dropping the
  DB outside `db:reset`) require explicit user confirmation.
- The `CaseNote` field names are **PascalCase** (`CaseNoteSeq`, `Nhs`,
  `CaseNo`, `LocHeld`, `SyncDate`, …) because they mirror the upstream WelshPAS
  contract. Keep them exactly as-is across both apps.
