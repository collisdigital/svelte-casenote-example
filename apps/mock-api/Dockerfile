# ── base: workspace install (shared layer) ────────────────────────────────────
FROM node:22-bookworm-slim AS base

# better-sqlite3 builds native bindings; provide the toolchain.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

# Workspace manifests first for better layer caching.
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY apps/mock-api/package.json ./apps/mock-api/package.json

RUN pnpm install --filter @casenote/mock-api... --frozen-lockfile=false

COPY apps/mock-api ./apps/mock-api

# ── dev: tsx watch (live-reload via tsx) ──────────────────────────────────────
FROM base AS dev

ENV HOST=0.0.0.0
ENV PORT=4000
EXPOSE 4000

CMD ["sh", "-c", "pnpm --filter @casenote/mock-api db:migrate && pnpm --filter @casenote/mock-api db:seed && pnpm --filter @casenote/mock-api dev"]

# ── prod: compiled JS, migrate + seed on first boot ───────────────────────────
FROM base AS prod

RUN pnpm --filter @casenote/mock-api build

ENV HOST=0.0.0.0
ENV PORT=4000
EXPOSE 4000

CMD ["sh", "-c", "node /app/apps/mock-api/dist/db/migrate.js && node /app/apps/mock-api/dist/db/seed.js && node /app/apps/mock-api/dist/server.js"]
