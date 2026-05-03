FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (non-secret, baked into the static bundle)
ARG VITE_APP_VERSION=unknown
ENV VITE_APP_VERSION=$VITE_APP_VERSION

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

# Only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile --omit=dev

# App source (server only) and built frontend
COPY server/ ./server/
COPY --from=builder /app/dist ./dist/

# Data directory — will be overridden by a PVC mount in Kubernetes but exists here so the container works standalone (e.g. docker run)
RUN mkdir -p /app/data && chown node:node /app/data

# Run as non-root
USER node

EXPOSE 3000

# HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
#     CMD wget -qO- http://localhost:3000/healthz || exit 1

ENV NODE_ENV=production \
    PORT=3000 \
    DATA_FILE=/app/data/state.json

CMD ["node", "server/index.js"]
