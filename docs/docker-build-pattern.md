# Docker Build Pattern

This document describes the standard Docker build pattern used for all TypeScript packages in this repository.

## Overview

All TypeScript packages follow a **pre-build pattern** where the application is built **before** creating the Docker image, not during the Docker build process. This approach provides several benefits:

1. **Smaller images** - Only production dependencies are included, no TypeScript compiler or dev tools
2. **Faster builds** - No compilation happening inside Docker, only copying pre-built files
3. **Simpler Dockerfiles** - Single-stage builds instead of multi-stage
4. **Better CI/CD** - Build artifacts can be tested before creating images
5. **Avoids config issues** - No problems with tsconfig.json that extends parent configs

## Build Workflow

### 1. Local Development

```bash
# Install dependencies
npm ci

# Build the TypeScript application
npm run build

# Build the Docker image (uses pre-built dist/ folder)
docker build -t my-package:latest .
```

### 2. CI/CD Pipeline

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci
  
- name: Build application
  run: npm run build
  
- name: Build Docker image
  run: docker build -t my-package:${{ github.sha }} .
  
- name: Push to registry
  run: docker push my-package:${{ github.sha }}
```

## Standard Dockerfile Structure

All TypeScript packages should use this Dockerfile template:

```dockerfile
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy pre-built application
COPY dist/ ./dist/

CMD ["node", "dist/index.js"]
```

### For MCP Servers (requiring git)

```dockerfile
FROM node:20.19-slim

# Add OCI labels for GitHub Container Registry
LABEL org.opencontainers.image.source=https://github.com/<your-org>/<your-repo> \
      org.opencontainers.image.description="<Your Package Description>" \
      org.opencontainers.image.licenses=MIT

# Install git if needed (e.g., for cloning repos at runtime)
RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy pre-built application
COPY dist/ ./dist/

CMD ["node", "dist/server.js"]
```

## Standard .dockerignore

All packages should exclude source files from the Docker build context:

```
# Dependencies (will be installed in Docker)
node_modules

# Source files (already compiled to dist/)
src
tsconfig.json
tsconfig.docker.json

# Test files
tests
coverage
*.test.ts
*.test.js

# Development files
.git
.gitignore
.vscode
.idea

# Documentation (optional, include README.md if needed)
*.md
!README.md
```

## Package Types

### Simple Exporters/Services

Packages like `screeps-loki-exporter` and `screeps-graphite-exporter`:
- Use `node:20-alpine` base image (~140MB final size)
- Only need Node.js runtime
- Minimal dependencies

### MCP Servers

Packages like `screeps-mcp`, `screeps-docs-mcp`, etc.:
- Use `node:20.19-slim` base image
- May need additional tools (git, etc.)
- Larger due to dependencies (~230-320MB final size)

## Migration Guide

To convert an existing package to this pattern:

### 1. Update Dockerfile

Replace multi-stage build:
```dockerfile
# OLD - Multi-stage build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
```

With single-stage build:
```dockerfile
# NEW - Expects pre-built dist/
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY dist/ ./dist/

CMD ["node", "dist/index.js"]
```

### 2. Update .dockerignore

Add source file exclusions:
```
src
tsconfig.json
tsconfig.docker.json
```

### 3. Update Build Instructions

Add a comment at the top of the Dockerfile:
```dockerfile
# Build the application before building the Docker image:
#   npm ci && npm run build
```

### 4. Update CI/CD

Ensure your CI/CD pipeline builds before creating images:
```yaml
- run: npm ci
- run: npm run build
- run: docker build -t image:tag .
```

## Benefits Demonstrated

### Before (Multi-stage Build)

**Dockerfile size**: ~30 lines with complex multi-stage setup
**Build time**: ~60 seconds (includes npm install + TypeScript compilation)
**Image size**: Varies, but includes build artifacts
**Issues**: tsconfig.json extends breaking Docker builds

### After (Pre-build Pattern)

**Dockerfile size**: ~15 lines, simple and clear
**Build time**: ~5 seconds (just copying files + prod dependencies)
**Image size**: Smaller (no dev dependencies)
**Issues**: None! Clean separation of concerns

## Examples in This Repository

All packages now follow this pattern:
- `packages/screeps-loki-exporter/`
- `packages/screeps-graphite-exporter/`
- `packages/screeps-mcp/`
- `packages/screeps-docs-mcp/`
- `packages/screeps-wiki-mcp/`
- `packages/screeps-typescript-mcp/`

## Troubleshooting

### "Cannot read file '/tsconfig.json'"

**Cause**: Dockerfile trying to build TypeScript inside container with extends reference

**Solution**: Follow the pre-build pattern - build before Docker, not during

### "dist folder not found"

**Cause**: Forgot to build before running `docker build`

**Solution**: Run `npm ci && npm run build` before building the image

### "npm ci requires package-lock.json"

**Cause**: Missing package-lock.json in COPY command

**Solution**: Use `COPY package*.json ./` instead of `COPY package.json ./`

## Notes

- Always commit `package-lock.json` to ensure reproducible builds
- The `dist/` folder should be in `.gitignore` but NOT in `.dockerignore`
- Run `npm ci` not `npm install` in Dockerfiles for reproducible installs
- Use `--omit=dev` to exclude dev dependencies from the image
