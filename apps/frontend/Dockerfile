# ── base: workspace install (shared layer) ────────────────────────────────────
FROM node:22-bookworm-slim AS base

RUN corepack enable

WORKDIR /app

COPY pnpm-workspace.yaml package.json .npmrc ./
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN pnpm install --filter @casenote/frontend... --frozen-lockfile=false

COPY apps/frontend ./apps/frontend

# ── dev: Vite dev server with HMR ─────────────────────────────────────────────
FROM base AS dev

ENV HOST=0.0.0.0
ENV PORT=5173
EXPOSE 5173

CMD ["pnpm", "--filter", "@casenote/frontend", "dev"]

# ── prod: compiled adapter-node server ────────────────────────────────────────
FROM base AS prod

RUN pnpm --filter @casenote/frontend build

# Cloud Run sets PORT=8080; adapter-node reads it automatically.
ENV HOST=0.0.0.0
EXPOSE 8080

CMD ["node", "/app/apps/frontend/build/index.js"]
