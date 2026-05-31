# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache postgresql-client

COPY package*.json ./
RUN npm ci --omit=dev && npm install prisma@6 --no-save

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/docs ./src/docs
COPY --from=builder /app/src/prisma ./src/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
