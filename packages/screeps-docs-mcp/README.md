# Screeps Documentation MCP Server

Model Context Protocol (MCP) server for browsing and querying [Screeps](https://screeps.com/) API documentation and game mechanics.

> Part of the [ralphschuler/screeps](https://github.com/ralphschuler/screeps) monorepo.

## Features

- **📚 API Reference**: Browse complete Screeps API documentation for Game, Room, Creep, Structures, and more
- **🎮 Game Mechanics**: Access documentation for room control, market system, power creeps, and other game mechanics
- **🔍 Full-Text Search**: Search across all documentation with keyword matching
- **⚡ Caching**: Efficient in-memory caching with configurable TTL
- **🔧 MCP Tools**: Programmatic access via MCP protocol for AI-assisted development

## Installation

```bash
npm install @ralphschuler/screeps-docs-mcp
```

## Usage

### As MCP Server

Configure in your MCP client (e.g., Claude Desktop, GitHub Copilot):

```json
{
  "mcpServers": {
    "screeps-docs": {
      "command": "npx",
      "args": ["-y", "@ralphschuler/screeps-docs-mcp@latest"],
      "env": {
        "DOCS_CACHE_TTL": "3600"
      }
    }
  }
}
```

### Docker Usage

The MCP server is available as a Docker image for containerized deployments.

**Pull from GHCR:**

```bash
docker pull ghcr.io/ralphschuler/screeps-docs-mcp:latest
```

**Run with environment variables:**

```bash
docker run --rm -i \
  -e DOCS_CACHE_TTL=3600 \
  ghcr.io/ralphschuler/screeps-docs-mcp:latest
```

**Build locally:**

```bash
cd packages/screeps-docs-mcp
npm run docker:build
npm run docker:run
```

### Docker stdio Transport Configuration

For MCP clients like Claude Desktop or Cursor, configure the Docker-based server:

```json
{
  "mcpServers": {
    "screeps-docs-docker": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "DOCS_CACHE_TTL=${DOCS_CACHE_TTL:-3600}",
        "ghcr.io/ralphschuler/screeps-docs-mcp:latest"
      ]
    }
  }
}
```

### Programmatic Usage

```typescript
import { buildIndex, searchIndex, getEntryById } from "@ralphschuler/screeps-docs-mcp";

// Load the pre-built documentation index
const index = await buildIndex();

// Search documentation
const results = searchIndex(index, "spawn creep");
console.log(`Found ${results.length} results`);

// Get a specific documentation entry by ID
const gameDoc = getEntryById(index, "api-game");
console.log(gameDoc?.title); // "Game"
```

## MCP Resources

The server exposes the following resources:

- `screeps-docs://api/list` - List all API objects
- `screeps-docs://mechanics/list` - List all mechanics topics
- `screeps-docs://api/{objectName}` - Get specific API documentation (e.g., `Game`, `Room`, `Creep`)
- `screeps-docs://mechanics/{topic}` - Get specific mechanics documentation (e.g., `control`, `market`, `power`)

## MCP Tools

The server provides the following tools:

### screeps-docs.search

Search documentation by keyword or phrase.

```json
{
  "query": "spawn creep"
}
```

### screeps-docs.getAPI

Get API reference for a specific object.

```json
{
  "objectName": "Creep"
}
```

### screeps-docs.getMechanics

Get game mechanics documentation.

```json
{
  "topic": "market"
}
```

### screeps-docs.listAPIs

List all available API objects.

### screeps-docs.listMechanics

List all available game mechanics topics.

## Configuration

### Environment Variables

- `DOCS_CACHE_TTL` - Cache time-to-live in seconds (default: 3600)

## Available API Objects

- Game
- Room
- RoomObject
- RoomPosition
- Creep
- Structure (and all Structure types)
- Source
- Mineral
- Deposit
- Flag
- PathFinder
- Memory
- RawMemory
- InterShardMemory
- Constants

## Available Mechanics Topics

- Room Control
- Creeps
- Defense
- Market
- Power
- Minerals
- Respawn
- Invaders
- CPU Limit
- Global Control Level (GCL)
- Simultaneous Actions

## Documentation Source

Documentation is sourced from the official Screeps documentation repository:

- Repository: https://github.com/screeps/docs
- Branch: master

**Build-Time Documentation Parsing:**

The documentation is parsed at **build time** (not runtime) to ensure instant access without network dependencies:

1. The docs repository is included as a git submodule at `docs-repo/`
2. During the build process, the documentation is parsed into a JSON index
3. The pre-built index is bundled with the package
4. At runtime, the server loads the pre-built index directly (no cloning needed)

This approach eliminates SSL certificate issues, reduces startup time, and removes the runtime dependency on `simple-git`.

## Development

```bash
# Clone with submodules (first time)
git clone --recursive https://github.com/ralphschuler/screeps.git
# OR update submodules in existing clone
git submodule update --init --recursive

# Install dependencies
npm install

# Build (includes parsing docs from submodule)
npm run build

# Build just the documentation index
npm run build:index

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run MCP Inspector tests (protocol compliance)
npm run test:inspector
```

### Build Process Details

The build happens in three stages:

1. **`npm run build:scripts`** - Compiles the build-time TypeScript scripts
2. **`npm run build:index`** - Parses documentation from the submodule and generates `dist/docs-index.json`
3. **`npm run build`** - Compiles the runtime TypeScript code that loads the pre-built index

The submodule (`docs-repo/`) contains the official Screeps documentation and is only needed at build time, not runtime.

### MCP Inspector Testing

This package includes integration tests that use the MCP SDK client to validate protocol compliance. The tests are inspired by the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) approach.

**Interactive inspection:**

```bash
# Launch the MCP Inspector UI (requires Node.js 22.7.5+)
npm run inspect

# CLI mode for quick testing
npm run inspect:cli
```

**Note:** The `inspect` command requires Node.js 22.7.5 or higher. The automated tests (`test:inspector`) work with Node.js 18+.

## License

MIT

## Related Packages

- [screeps-mcp](../screeps-mcp) - MCP server for live Screeps game API integration
- [screeps-wiki-mcp](../screeps-wiki-mcp) - MCP server for accessing the Screeps community wiki
- [screeps-bot](../screeps-bot) - Advanced Screeps AI using swarm intelligence
