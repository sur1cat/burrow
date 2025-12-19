# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables
ARG NEXT_PUBLIC_GRAPHQL_HTTP=http://localhost:4000/graphql
ARG NEXT_PUBLIC_GRAPHQL_WS=ws://localhost:4000/graphql

ENV NEXT_PUBLIC_GRAPHQL_HTTP=$NEXT_PUBLIC_GRAPHQL_HTTP
ENV NEXT_PUBLIC_GRAPHQL_WS=$NEXT_PUBLIC_GRAPHQL_WS

# Build Next.js
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start server
CMD ["npm", "start"]
