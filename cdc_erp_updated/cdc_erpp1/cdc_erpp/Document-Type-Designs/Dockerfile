FROM node:24-alpine AS base
RUN npm install -g pnpm@latest
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
# Remove preinstall check and add onlyBuiltDependencies so esbuild can build
RUN sed -i '/"preinstall":/d' package.json && \
    sed -i '/"private": true/a\  "pnpm": {\n    "onlyBuiltDependencies": ["@swc/core", "esbuild", "msw", "unrs-resolver"]\n  },' package.json
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/cdc-erp/package.json ./artifacts/cdc-erp/
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY scripts/package.json ./scripts/
RUN pnpm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./
COPY tsconfig.base.json tsconfig.json ./
COPY attached_assets ./attached_assets
COPY artifacts/ ./artifacts/
COPY lib/ ./lib/
COPY scripts/ ./scripts/
RUN pnpm --filter @workspace/api-server run build

ENV PORT=8080
ENV BASE_PATH=/
RUN pnpm --filter @workspace/cdc-erp run build

FROM base AS runner
RUN apk add --no-cache tini netcat-openbsd
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/cdc-erp/dist ./artifacts/cdc-erp/dist
COPY lib/db/drizzle.config.ts lib/db/package.json ./lib/db/
COPY lib/db/src/ ./lib/db/src/
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["tini", "--", "docker-entrypoint.sh"]
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
