FROM node:22-bookworm-slim

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

ENV HOST=0.0.0.0
ENV PORT=4000
EXPOSE 4000

WORKDIR /app/apps/mock-api

# Ensure schema + seed data exist, then start.
CMD ["sh", "-c", "pnpm db:migrate && pnpm dev"]
