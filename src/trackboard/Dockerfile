FROM node:20-alpine AS deps

WORKDIR /app

# Install deps separately so this layer is cached unless package*.json changes
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (injected as build-args in CI — see .github/workflows)
# These are baked into the static bundle; do NOT pass secrets here.
ARG VITE_EVENT_NAME="DevOpsDay Geneva"
ARG VITE_EVENT_DATE="May 2026"
ARG VITE_NUM_ROUNDS=6
# VITE_ADMIN_PASSWORD is intentionally NOT defaulted here.
# Supply it via: --build-arg VITE_ADMIN_PASSWORD=<secret>
ARG VITE_ADMIN_PASSWORD

ENV VITE_EVENT_NAME=$VITE_EVENT_NAME \
    VITE_EVENT_DATE=$VITE_EVENT_DATE \
    VITE_NUM_ROUNDS=$VITE_NUM_ROUNDS \
    VITE_ADMIN_PASSWORD=$VITE_ADMIN_PASSWORD

RUN npm run build

FROM nginx:1.27-alpine AS runtime

# Remove default config and default html
RUN rm /etc/nginx/conf.d/default.conf \
    && rm -rf /usr/share/nginx/html/*

# Copy our nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx runs as non-root (pid file and cache dirs need correct ownership)
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
