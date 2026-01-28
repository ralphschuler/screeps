# Screeps TypeScript MCP Server Docker Image
#
# This Dockerfile creates a container for running the Screeps TypeScript types
# MCP server using stdio transport for integration with MCP clients.
#
# Build the application before building the Docker image:
#   npm ci && npm run build

FROM node:22-slim

# Add OCI labels for GitHub Container Registry
LABEL org.opencontainers.image.source=https://github.com/ralphschuler/screeps \
      org.opencontainers.image.description="Screeps TypeScript MCP Server" \
      org.opencontainers.image.licenses=MIT

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV TYPES_CACHE_TTL=3600

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy pre-built application
COPY dist/ ./dist/

# Copy pre-cloned typed-screeps repository
COPY typed-screeps/ ./typed-screeps/

# Run the server
ENTRYPOINT ["node", "dist/server.js"]
