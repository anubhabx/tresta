FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable && apk add --no-cache openssl ca-certificates

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY apps ./apps
COPY packages ./packages

RUN pnpm install

RUN pnpm --filter @workspace/types build
RUN pnpm --filter @workspace/database build
RUN pnpm --filter @workspace/widget build

RUN pnpm --filter api build

ENV PORT=8000
EXPOSE 8000

CMD ["pnpm", "--filter", "api", "run", "start:all"]
