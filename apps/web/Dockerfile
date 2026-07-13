# ---------- Base ----------
FROM node:22-alpine AS base
# Next.js рекомендує libc6-compat для Alpine, щоб уникнути проблем з деякими C-залежностями
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ---------- Build ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Вимикаємо телеметрію Next.js під час білду
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- Production image (Runner) ----------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Створюємо непривілейованого користувача для безпеки
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копіюємо статику (вона потрібна для роздачі)
COPY --from=builder /app/public ./public

# Копіюємо згенеровані standalone файли та встановлюємо правильні права
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

ENV PORT=3000
EXPOSE $PORT
ENV HOSTNAME="0.0.0.0"

# В standalone режимі Next.js генерує власний мінімальний server.js
CMD ["node", "server.js"]