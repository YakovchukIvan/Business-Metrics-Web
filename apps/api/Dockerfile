# ---------- Base ----------
FROM node:22-alpine AS base
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json ./
# Змінено ci на install
RUN npm install --ignore-scripts 

# ---------- Build ----------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Production dependencies ----------
FROM base AS prod-deps
COPY package.json package-lock.json ./
# Змінено ci на install
RUN npm install --omit=dev --ignore-scripts 

# ---------- Production image ----------
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER node
ENV PORT=5000
EXPOSE $PORT

CMD ["node", "dist/main.js"]