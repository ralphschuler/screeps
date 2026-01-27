# Screeps Wiki MCP Server Docker Image
#
# This Dockerfile creates a container for running the Screeps wiki
# MCP server using stdio transport for integration with MCP clients.
#
# Build the application before building the Docker image:
#   npm ci && npm run build

FROM node:25.4-slim

# Add OCI labels for GitHub Container Registry
LABEL org.opencontainers.image.source=https://github.com/ralphschuler/screeps \
      org.opencontainers.image.description="Screeps Wiki MCP Server" \
      org.opencontainers.image.licenses=MIT

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
# - WIKI_CACHE_TTL: Cache time-to-live in seconds (default: 3600)

# Run the MCP server
CMD ["node", "dist/server.js"]
