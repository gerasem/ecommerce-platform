FROM node:22-alpine AS base

FROM base AS deps
RUN npm install --global npm@11.12.1
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG PAYLOAD_URL
ENV PAYLOAD_URL=$PAYLOAD_URL
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run typecheck && npm test && npm run build

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output

EXPOSE 3001
ENV PORT=3001
ENV HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
