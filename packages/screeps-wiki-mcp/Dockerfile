# Screeps Wiki MCP Server Docker Image
#
# This Dockerfile creates a container for running the Screeps wiki
# MCP server using stdio transport for integration with MCP clients.

FROM node:20.19-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json ./
COPY tsconfig.docker.json ./tsconfig.json

# Install all dependencies (including dev for build)
RUN npm install --ignore-scripts

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev

# Set environment variables with defaults
ENV NODE_ENV=production

# The server uses stdio transport for communication
# Environment variables for configuration:
# - WIKI_CACHE_TTL: Cache time-to-live in seconds (default: 3600)

# Run the MCP server
CMD ["node", "dist/server.js"]
