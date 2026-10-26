FROM node:22-alpine AS base
RUN apk add --no-cache tzdata postgresql-client

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Development stage
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"
ARG SERVER_URL=http://localhost:3000
ENV NEXT_PUBLIC_SERVER_URL=$SERVER_URL
ENV PAYLOAD_PUBLIC_SERVER_URL=$SERVER_URL

RUN PAYLOAD_SECRET="build-time-placeholder-not-real" \
    DATABASE_URI="postgres://noop:noop@localhost:5432/noop" \
    npm run build
# The webpack cache only speeds up subsequent builds. It is not used at runtime
# and can add hundreds of megabytes to the image layer.
RUN rm -rf .next/cache
RUN npm prune --omit=dev --legacy-peer-deps

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app ./

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "start"]
