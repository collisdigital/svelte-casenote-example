[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/collisdigital/svelte-casenote-example)

# NHS Case Note Tracking

A production-prototype web application for tracking physical paper patient
folders (**case notes**) as they move across clinical locations — Medical
Records Library, Ward 4, Main Theatre, Outpatients, and so on.

Built on the **NHS Wales (DHCW) Single Record** design language, with a
SvelteKit frontend and a contract-aligned mock API backed by SQLite.

## Quick Start

> Requires Node 22+ and `pnpm`. In a Codespace / devcontainer these are
> provisioned automatically.

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Run local SQLite migrations + seed data
pnpm run db:reset

# 3. Start the full development loop (frontend + mock API together)
pnpm run dev
```

- Frontend: <http://localhost:5173>
- Mock API: <http://localhost:4000> (health: `/health`)

> `pnpm run setup` runs steps 1 and 2 in one command.

### Run with Docker instead

```bash
docker compose up --build
```

Runs the frontend and mock API side-by-side; the SQLite database persists in a
named volume across runs.

---

## What's inside

```
.
├── apps/
│   ├── frontend/          # SvelteKit 2 + Svelte 5 (runes) + Tailwind v4
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/        # Button, Card, StatusTag, Field, …
│   │   │   │   ├── design-system/     # vendored SR tokens + icons + logos
│   │   │   │   ├── server/api.ts      # server-only API client (no loose fetches)
│   │   │   │   ├── format.ts          # status tone + timestamp helpers
│   │   │   │   ├── locations.ts       # clinical location reference
│   │   │   │   └── types.ts           # CaseNote contract types
│   │   │   ├── routes/
│   │   │   │   ├── +layout.svelte     # app shell + nav
│   │   │   │   ├── +page.svelte       # Dashboard (list + delete action)
│   │   │   │   ├── new/               # Register a case note (create action)
│   │   │   │   └── notes/[seq]/       # Move location + delete (named actions)
│   │   │   └── app.css                # Tailwind v4 @theme — semantic tokens
│   │   ├── tests/e2e/                 # Playwright workflows
│   │   └── playwright.config.ts
│   └── mock-api/          # Fastify + better-sqlite3
│       ├── src/
│       │   ├── db/        # connection, migrate, seed
│       │   ├── routes.ts  # WelshPAS-aligned CaseNote CRUD
│       │   └── server.ts
│       └── Dockerfile
├── design-system.md       # architectural styling rules (read this!)
├── docker-compose.yml
└── .devcontainer/
```

## Engineering standards

- **Svelte 5 runes only** — `$state`, `$derived`, `$props`, `$effect`,
  `$state.raw`. No `export let`, no `$:` reactive statements.
- **`$state.raw`** is used for Case Note API arrays to avoid proxy overhead.
- **SvelteKit form actions** drive every mutation (create / move / delete) with
  native progressive enhancement via `use:enhance`. No loose client-side write
  fetches.
- **Strict TypeScript** throughout, including modern Svelte 5 `Snippet` types.
- **Tokenized styling** — components use only semantic design tokens
  (`text-brand-primary`, `bg-status-critical`, …). No literal Tailwind colours.
  See [design-system.md](design-system.md).
- **Layout stacks** — `ui-stack-v`, `ui-stack-h`, `ui-stack-centered` only.

## API contract

The mock API mirrors the WelshPAS `CaseNote` schema, mounted under the
assigning-authority prefix:

| Method | Path                                                                  | Action            |
| ------ | --------------------------------------------------------------------- | ----------------- |
| GET    | `/rest/welsh-pas/assigning-authority/:aa/case-note`                   | List case notes   |
| GET    | `/rest/welsh-pas/assigning-authority/:aa/case-note/:caseNoteSeq`      | Get one           |
| POST   | `/rest/welsh-pas/assigning-authority/:aa/case-note`                   | Register new      |
| PATCH  | `/rest/welsh-pas/assigning-authority/:aa/case-note/:caseNoteSeq`      | Move location     |
| DELETE | `/rest/welsh-pas/assigning-authority/:aa/case-note/:caseNoteSeq`      | Delete            |
| GET    | `/rest/welsh-pas/locations`                                           | Location reference|

## Scripts

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `pnpm run dev`       | Run frontend + mock API in parallel               |
| `pnpm run dev:api`   | Run the mock API only                             |
| `pnpm run db:reset`  | Drop, migrate, and re-seed the SQLite database    |
| `pnpm run build`     | Build both apps                                   |
| `pnpm run check`     | `svelte-check` type checking                      |
| `pnpm run test`      | Vitest unit tests                                 |
| `pnpm run test:e2e`  | Playwright end-to-end tests                       |

## Testing

```bash
pnpm run test       # Vitest + Svelte Testing Library (unit/component)
pnpm run test:e2e   # Playwright (self-boots the mock API + app on a seeded test DB)
```

---

*Synthetic data only — fabricated NHS numbers and names for prototyping. Not
real patient information.*