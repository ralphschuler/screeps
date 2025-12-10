# Build stage
FROM node:18-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.docker.json ./tsconfig.json

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY src ./src

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:18-slim

WORKDIR /app

# Install git (required for cloning typed-screeps)
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment variables
ENV NODE_ENV=production
ENV TYPES_CACHE_TTL=3600

# Run the server
ENTRYPOINT ["node", "dist/server.js"]
