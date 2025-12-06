# Screeps Documentation MCP Server

Model Context Protocol (MCP) server for browsing and querying [Screeps](https://screeps.com/) API documentation and game mechanics.

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
import { buildIndex, searchIndex } from "@ralphschuler/screeps-docs-mcp";

// Build documentation index
const index = await buildIndex();

// Search documentation
const results = searchIndex(index, "spawn creep");

// Get specific API documentation
import { getAPIObjectList } from "@ralphschuler/screeps-docs-mcp";
const apis = getAPIObjectList();
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

Documentation is scraped from official Screeps documentation:

- API Reference: https://docs.screeps.com/api/
- Game Mechanics: https://docs.screeps.com/

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run MCP Inspector tests (protocol compliance)
npm run test:inspector
```

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

- [@ralphschuler/screeps-mcp](https://github.com/ralphschuler/.screeps-gpt/tree/main/packages/screeps-mcp) - MCP server for live Screeps game API integration
- [@ralphschuler/screeps-agent](https://github.com/ralphschuler/.screeps-gpt/tree/main/packages/screeps-agent) - Autonomous Screeps AI development agent
