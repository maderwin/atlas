FROM oven/bun:latest as base

FROM base AS deps
WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .
COPY ./bun.lockb .

RUN bun install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY .env ./.env
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN bun run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY .env ./.env

RUN chmod -R 777 /app/.next/cache

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["bun", "run", "start"]
