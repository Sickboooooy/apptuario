# syntax=docker/dockerfile:1.7

FROM node:22.23.2-bookworm-slim AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS builder

COPY . .
RUN npm run build

FROM node:22.23.2-bookworm-slim AS runtime

ENV NODE_ENV=production \
    WRANGLER_SEND_METRICS=false

RUN npm install --global wrangler@4.92.0 \
    && npm cache clean --force

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./dist/server/migrations
COPY docker-entrypoint.sh /usr/local/bin/apptuario-entrypoint
RUN sed -i 's/\r$//' /usr/local/bin/apptuario-entrypoint \
    && chmod +x /usr/local/bin/apptuario-entrypoint

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["apptuario-entrypoint"]
