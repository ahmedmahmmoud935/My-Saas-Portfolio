# ViralPX — production image (Next.js 16 + Payload 3).
# Runs DB migrations on startup, then serves with `next start`.
# Debian slim base keeps sharp's native libs happy.
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# ---- dependencies ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholder secret so the config loads at build; real values injected at runtime.
ENV PAYLOAD_SECRET=build-time-placeholder
RUN pnpm build

# ---- runner ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/next.config.mjs /app/tsconfig.json ./
EXPOSE 3000
# Apply pending migrations, then start the server.
CMD ["sh", "-c", "pnpm migrate && pnpm start"]
