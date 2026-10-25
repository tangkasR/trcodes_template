# Stage 1: Base runtime environment (Node 22 LTS untuk Prisma 7 & Next.js 16)
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Stage 2: Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
# Gunakan --ignore-scripts agar postinstall (prisma generate) ditunda hingga builder stage
RUN npm ci --ignore-scripts

# Stage 3: Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

# Stage 4: Production runner
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root security user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Pastikan folder upload ada dan memiliki izin tulis untuk user nextjs
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/app/generated ./app/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=builder /app/config.ts ./config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# WAJIB: next start membaca next.config.ts saat runtime. Tanpa file ini,
# cacheComponents nonaktif di runtime (beda dengan saat build) sehingga
# halaman dinamis (/dashboard) gagal dengan digest DYNAMIC_SERVER_USAGE.
COPY --from=builder /app/next.config.ts ./next.config.ts

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
