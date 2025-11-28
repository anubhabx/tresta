FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

# Workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Monorepo sources (requires build context = repo root)
COPY apps ./apps
COPY packages ./packages

# Install deps for all workspaces
RUN pnpm install

# Build shared packages (Order matters!)
RUN pnpm --filter @workspace/types build
RUN pnpm --filter @workspace/database build
RUN pnpm --filter @workspace/widget build

# Build API
RUN pnpm --filter api build

ENV PORT=8000
EXPOSE 8000

# Adjust this path to whatever your actual output is
CMD ["pnpm", "--filter", "api", "run", "start:all"]
