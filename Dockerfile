ARG NODE_IMAGE=node:22-alpine3.21

FROM ${NODE_IMAGE} AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
	&& apk add --no-cache openssl ca-certificates libc6-compat \
	&& apk upgrade --no-cache

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @workspace/types build
RUN pnpm --filter @workspace/database build
RUN pnpm --filter @workspace/widget build
RUN pnpm --filter api build

FROM ${NODE_IMAGE} AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV PORT=8000

RUN corepack enable \
	&& apk add --no-cache openssl ca-certificates \
	&& apk upgrade --no-cache

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN pnpm install --prod --frozen-lockfile --filter api... --ignore-scripts

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/widget/dist ./packages/widget/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json

EXPOSE 8000

CMD ["pnpm", "--filter", "api", "run", "start:all"]
