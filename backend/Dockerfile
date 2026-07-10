# ---------- Base ----------
FROM node:22-alpine AS base
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- Build ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Production dependencies ----------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Production image ----------
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]