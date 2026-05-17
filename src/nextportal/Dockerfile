FROM registry.suse.com/bci/nodejs:22 AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

FROM registry.suse.com/bci/nodejs:22 AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM registry.suse.com/bci/nodejs:22 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
    && useradd  --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public
COPY --from=builder --chown=nextjs:nodejs /app/data            ./data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
