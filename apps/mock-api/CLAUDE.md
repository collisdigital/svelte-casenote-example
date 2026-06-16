# CLAUDE.md — apps/mock-api (Fastify + SQLite)

Rules for the mock Case Note Tracking API. Read the root `CLAUDE.md` too.

Stack: **Fastify 5**, **better-sqlite3** (synchronous), TypeScript (strict,
`NodeNext`), run with `tsx`. This is a faithful mock of the WelshPAS REST API,
not a throwaway stub — keep it contract-accurate.

## Contract fidelity

- Routes mirror the WelshPAS shape, mounted under the assigning-authority
  prefix: `/rest/welsh-pas/assigning-authority/:assigningAuthority/case-note`
  (GET list, POST), `/.../case-note/:caseNoteSeq` (GET, PATCH=move, DELETE),
  plus `/rest/welsh-pas/locations` reference data and `/health`.
- `CaseNote` field names are **PascalCase** (`CaseNoteSeq`, `Nhs`, `CaseNo`,
  `Volume`, `LocHeld`, `Holder`, `Status`, `BaseLocation`, `Creator`,
  `CreateDate`, `SyncDate`, `AddInfo`). Do not rename or camelCase them.
- Status codes follow the contract: **201** create, **202** delete, **400**
  validation, **404** not found.
- `SyncDate` is the "last updated" timestamp — refresh it on every mutation.
  A move to a non-base location sets `Status` to `In transit`.

## Code layout

- `src/types.ts` — domain types and input payloads.
- `src/locations.ts` — the canonical clinical location list + helpers
  (`isKnownLocation`, `locationName`). Keep IDs stable; the frontend has a
  matching fallback list.
- `src/db/connection.ts` — single shared WAL-enabled connection; path from
  `DATABASE_PATH` (defaults under `data/`).
- `src/db/migrate.ts` — schema (`--fresh` drops first). `src/db/seed.ts` —
  synthetic seed rows.
- `src/repository.ts` — all SQL lives here. Use **prepared statements** and
  `db.transaction(...)` for multi-row writes. Routes/handlers must not write raw
  SQL inline.
- `src/routes.ts` — route registration + per-route validation.
- `src/server.ts` — Fastify setup, CORS, and the **empty-body JSON content-type
  parser** (so bodyless `DELETE` requests with `content-type: application/json`
  are not rejected). Keep that parser.

## Conventions

- better-sqlite3 is **synchronous** — no `await` on DB calls; handlers can still
  be `async` for Fastify.
- Validate input at the route boundary; return
  `reply.code(400).send({ message, errors })`. Reject unknown `LocHeld` values
  via `isKnownLocation`.
- The DB file persists across runs by design. To reset state use
  `pnpm db:reset` (migrate `--fresh` + seed) — never delete the DB file as a
  shortcut.
- Server binds `0.0.0.0` on `PORT` (default 4000) for port forwarding.

## Dev / verify

- Run: `pnpm --filter @casenote/mock-api dev` (tsx watch). Reset DB:
  `pnpm run db:reset` from the root.
- Type-check before finishing: `pnpm --filter @casenote/mock-api lint`
  (`tsc --noEmit`) — must be clean.
- After route/schema changes, smoke-test the affected endpoint with `curl`
  (include the `X-Requesting-Service` / `X-Requesting-User` headers) and keep
  the frontend's `src/lib/server/api.ts` in sync if the contract shifts.
