# Screeps Documentation MCP Server Docker Image
#
# This Dockerfile creates a container for running the Screeps documentation
# MCP server using stdio transport for integration with MCP clients.
# 
# Build the application before building the Docker image:
#   npm ci && npm run build

FROM node:20.19-slim

# Add OCI labels for GitHub Container Registry
LABEL org.opencontainers.image.source=https://github.com/ralphschuler/screeps \
      org.opencontainers.image.description="Screeps Documentation MCP Server" \
      org.opencontainers.image.licenses=MIT

# Install git (required for simple-git to clone repositories)
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy pre-built application
COPY dist/ ./dist/

# The server uses stdio transport for communication
# Environment variables for configuration:
# - DOCS_CACHE_TTL: Cache time-to-live in seconds (default: 3600)

# Run the MCP server
CMD ["node", "dist/server.js"]
