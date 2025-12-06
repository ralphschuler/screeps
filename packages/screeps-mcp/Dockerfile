# Screeps MCP Server Docker Image
#
# This Dockerfile creates a container for running the Screeps MCP server
# using stdio transport for integration with MCP clients like Claude Desktop.

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
# - SCREEPS_TOKEN: Screeps API token (required)
# - SCREEPS_HOST: Screeps server host (default: screeps.com)
# - SCREEPS_SHARD: Shard name (default: shard3)

# Run the MCP server
CMD ["node", "dist/server.js"]
