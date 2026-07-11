# syntax=docker/dockerfile:1
FROM node:24.11.0 AS base
RUN npm install -g pnpm@10.33.2 --ignore-scripts

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm i --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm orm:sync
RUN pnpm build

# Production deps only
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm i --prod --frozen-lockfile
RUN pnpm orm:sync

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

RUN useradd -ms /bin/bash nestjs

COPY --from=prod-deps --chown=nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs /app/prisma ./prisma
COPY --chown=nestjs package.json pnpm-lock.yaml prisma.config.ts ./

USER nestjs

CMD ["pnpm", "start:prod"]
