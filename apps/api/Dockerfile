FROM node:20-alpine AS base

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy source code
COPY apps ./apps
COPY packages ./packages

# Install dependencies
RUN pnpm install

# Build dependencies
RUN pnpm --filter @workspace/database build
RUN pnpm --filter @workspace/widget build

# Build API
RUN pnpm --filter api build

# Expose the API port
EXPOSE 8000

# Start the application
CMD ["node", "apps/api/dist/apps/api/src/index.js"]
