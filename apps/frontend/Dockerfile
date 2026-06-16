FROM node:22-bookworm-slim

RUN corepack enable

WORKDIR /app

COPY pnpm-workspace.yaml package.json .npmrc ./
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN pnpm install --filter @casenote/frontend... --frozen-lockfile=false

COPY apps/frontend ./apps/frontend

ENV HOST=0.0.0.0
ENV PORT=5173
EXPOSE 5173

WORKDIR /app/apps/frontend

# Dev server bound to 0.0.0.0 for port forwarding.
CMD ["pnpm", "dev"]
