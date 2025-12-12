# Screeps MCP Server Docker Image
#
# This Dockerfile creates a container for running the Screeps MCP server
# using stdio transport for integration with MCP clients like Claude Desktop.
#
# Build the application before building the Docker image:
#   npm ci && npm run build

FROM node:20.19-slim

# Add OCI labels for GitHub Container Registry
LABEL org.opencontainers.image.source=https://github.com/ralphschuler/screeps \
      org.opencontainers.image.description="Screeps MCP Server" \
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
# - SCREEPS_TOKEN: Screeps API token (required)
# - SCREEPS_HOST: Screeps server host (default: screeps.com)
# - SCREEPS_SHARD: Shard name (default: shard3)

# Run the MCP server
CMD ["node", "dist/server.js"]
