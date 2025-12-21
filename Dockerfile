FROM node:20-bullseye AS base

WORKDIR /usr/src/app

ARG NPM_REGISTRY=https://registry.npmmirror.com
ARG PNPM_VERSION=10.22.0

RUN npm config set registry "$NPM_REGISTRY" \
  && npm i -g "pnpm@${PNPM_VERSION}" \
  && pnpm config set registry "$NPM_REGISTRY"

FROM base AS builder

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

RUN pnpm run build

FROM base

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/next.config.js ./next.config.js

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "start"]
