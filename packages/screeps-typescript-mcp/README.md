# Screeps TypeScript MCP Server

Model Context Protocol (MCP) server for browsing and querying TypeScript type definitions from [typed-screeps](https://github.com/screepers/typed-screeps).

> Part of the [ralphschuler/screeps](https://github.com/ralphschuler/screeps) monorepo.

## Features

- **🔍 Type Search**: Search TypeScript type definitions by name or keyword
- **📖 Type Documentation**: Get complete type definitions with descriptions and examples
- **🔗 Type Relationships**: Discover related types through extends, implements, and references
- **📁 File-based Navigation**: Browse types by their source file
- **🏷️ Categorization**: Types are automatically categorized (Game, Room, Creep, Structure, etc.)
- **⚡ Caching**: Efficient in-memory caching with configurable TTL
- **🔧 MCP Tools**: Programmatic access via MCP protocol for AI-assisted development

## Installation

```bash
npm install @ralphschuler/screeps-typescript-mcp
```

## Usage

### As MCP Server

Configure in your MCP client (e.g., Claude Desktop, GitHub Copilot):

```json
{
  "mcpServers": {
    "screeps-types": {
      "command": "npx",
      "args": ["-y", "@ralphschuler/screeps-typescript-mcp@latest"],
      "env": {
        "TYPES_CACHE_TTL": "3600"
      }
    }
  }
}
```

### Docker Usage

The MCP server is available as a Docker image for containerized deployments.

**Pull from GHCR:**

```bash
docker pull ghcr.io/ralphschuler/screeps-typescript-mcp:latest
```

**Run with environment variables:**

```bash
docker run --rm -i \
  -e TYPES_CACHE_TTL=3600 \
  ghcr.io/ralphschuler/screeps-typescript-mcp:latest
```

**Build locally:**

```bash
cd packages/screeps-typescript-mcp
npm run docker:build
npm run docker:run
```

### Docker stdio Transport Configuration

For MCP clients like Claude Desktop or Cursor, configure the Docker-based server:

```json
{
  "mcpServers": {
    "screeps-types-docker": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "TYPES_CACHE_TTL=${TYPES_CACHE_TTL:-3600}",
        "ghcr.io/ralphschuler/screeps-typescript-mcp:latest"
      ]
    }
  }
}
```

### Programmatic Usage

```typescript
import { buildIndex, searchIndex, getTypeByName } from "@ralphschuler/screeps-typescript-mcp";

// Build type index
const index = await buildIndex();

// Search for types
const results = searchIndex(index, "creep");

// Get specific type
const creepType = getTypeByName(index, "Creep");
console.log(creepType.content);
```

## MCP Resources

The server exposes the following resources:

- `screeps-types://list` - List all available TypeScript types
- `screeps-types://files/list` - List all source files in typed-screeps
- `screeps-types://type/{typeName}` - Get specific type definition (e.g., `Creep`, `Room`, `Structure`)

## MCP Tools

The server provides the following tools:

### screeps_types_search

Search for TypeScript type definitions by name or keyword.

```json
{
  "query": "structure tower",
  "limit": 10
}
```

### screeps_types_get

Get the full TypeScript type definition for a specific type.

```json
{
  "name": "StructureTower"
}
```

Returns the complete type definition including:
- Type content (full TypeScript definition)
- Description (JSDoc comments)
- Related types
- File location
- Category

### screeps_types_list

List all available TypeScript types with optional filtering.

```json
{
  "filter": "structure"
}
```

Filter can match:
- Category (game, room, creep, structure, resource, etc.)
- File name
- Type kind (interface, class, type, enum, etc.)

### screeps_types_related

Get types related to a specific type through extends, implements, or references.

```json
{
  "name": "Creep"
}
```

### screeps_types_by_file

Get all TypeScript types defined in a specific source file.

```json
{
  "fileName": "creep.ts"
}
```

## Configuration

### Environment Variables

- `TYPES_CACHE_TTL` - Cache time-to-live in seconds (default: 3600)

## Type Categories

Types are automatically categorized into:

- **game** - Game-related types (Game, CPU, etc.)
- **room** - Room-related types (Room, RoomPosition, RoomVisual, etc.)
- **creep** - Creep-related types (Creep, BodyPartConstant, etc.)
- **structure** - Structure types (StructureTower, StructureSpawn, etc.)
- **resource** - Resource and mineral types
- **pathfinding** - PathFinder and related types
- **memory** - Memory-related types
- **market** - Market system types
- **power** - Power creeps and related types
- **constants** - Game constants and literals
- **visual** - RoomVisual and related types
- **other** - Other types

## Available Types

The server provides access to all TypeScript type definitions from typed-screeps, including:

### Game Objects
- Game, Room, RoomPosition, RoomObject
- Creep, PowerCreep
- Structure (and all structure types)
- Source, Mineral, Deposit
- Flag, ConstructionSite

### Path Finding
- PathFinder, CostMatrix
- RoomPosition methods

### Memory
- Memory, RawMemory, InterShardMemory
- CreepMemory, RoomMemory, FlagMemory, SpawnMemory

### Market
- Game.market, Order, Transaction

### Constants
- All game constants (FIND_*, LOOK_*, STRUCTURE_*, etc.)
- BodyPartConstant, ResourceConstant, DirectionConstant, etc.

### Visual
- RoomVisual, Map Visual

## Documentation Source

Type definitions are sourced from the official typed-screeps repository:

- Repository: https://github.com/screepers/typed-screeps
- Branch: master

The server clones the repository during build time to include the type definitions in the distribution. This ensures fast startup and eliminates runtime dependencies on git.

## Development

```bash
# Install dependencies
npm install

# Build (includes cloning typed-screeps repository)
npm run build

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run MCP Inspector tests (protocol compliance)
npm run test:inspector
```

**Note:** The build process automatically clones the typed-screeps repository into the `typed-screeps/` directory. This directory is excluded from version control but included in the distribution package.

### MCP Inspector Testing

This package includes integration tests that use the MCP SDK client to validate protocol compliance.

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

- [screeps-docs-mcp](../screeps-docs-mcp) - MCP server for Screeps API documentation
- [screeps-mcp](../screeps-mcp) - MCP server for live Screeps game API integration
- [screeps-wiki-mcp](../screeps-wiki-mcp) - MCP server for accessing the Screeps community wiki
- [screeps-bot](../screeps-bot) - Advanced Screeps AI using swarm intelligence

## Credits

This MCP server provides access to TypeScript type definitions from [typed-screeps](https://github.com/screepers/typed-screeps), maintained by the Screepers community.

## Testing

This package has comprehensive test coverage with unit, integration, and inspector tests.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only inspector tests
npm run test:inspector
```

### Test Structure

- `tests/unit/` - Unit tests for type parser and handlers
- `tests/integration/` - Integration tests for MCP server
- `tests/inspector/` - MCP inspector integration tests

### Coverage Requirements

- Overall: >80%
- Type parser: >80%
- Handlers: >90%
- All tests must pass before merging

