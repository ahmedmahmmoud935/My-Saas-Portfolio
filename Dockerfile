# ViralPX — production image for Coolify (Next.js standalone + Payload + sharp).
# Debian slim base keeps sharp's native libs happy.

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# ---- deps ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build doesn't connect to the DB (DB-touching pages are dynamic); placeholder secret is fine.
ENV PAYLOAD_SECRET=build-time-placeholder
RUN pnpm build

# ---- run ----
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# sharp isn't traced into standalone reliably; ship it explicitly.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm/sharp* ./node_modules/.pnpm/
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
