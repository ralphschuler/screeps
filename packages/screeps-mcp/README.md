# @ralphschuler/screeps-mcp

Model Context Protocol (MCP) server integration for Screeps bot development.

> Part of the [ralphschuler/screeps](https://github.com/ralphschuler/screeps) monorepo.

## Overview

This package provides a standardized MCP server that exposes Screeps game data, memory, and operations via the Model Context Protocol. It enables AI-assisted development workflows, advanced automation, and seamless integration with modern AI tools like Claude, ChatGPT, and Cursor.

## Features

- **MCP Protocol Compliance**: Full implementation of Model Context Protocol server interface
- **Screeps API Integration**: Secure connection to Screeps servers with token or email/password authentication
- **WebSocket Console Support**: Automatically retrieves console command responses via WebSocket subscription
- **Resource Providers**: Expose Screeps game objects, memory, and stats via MCP resources
- **Comprehensive Tool Set**: 27 MCP tools covering:
  - Console commands with live response
  - Memory and segment operations
  - Room data (terrain, objects, status, decorations)
  - Market orders, trading, and market statistics
  - User information, rooms, and world status
  - Leaderboard queries (seasons, find, list)
  - Experimental data (PVP, nukes)
  - Money/credit history and user overview
  - Game state queries and shard information
- **Comprehensive Testing**: 100% test coverage with unit, integration, and e2e tests
- **Type Safety**: Full TypeScript support with strict type checking

## Installation

```bash
npm install @ralphschuler/screeps-mcp
```

## Usage

### As a Standalone Server

Run the MCP server using environment variables for configuration:

```bash
export SCREEPS_TOKEN="your-screeps-token"
export SCREEPS_HOST="screeps.com"
export SCREEPS_SHARD="shard3"

npx screeps-mcp
```

### Programmatic Usage

```typescript
import { createMCPServer } from "@ralphschuler/screeps-mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const config = {
    name: "my-screeps-mcp",
    version: "1.0.0",
    screeps: {
      token: process.env.SCREEPS_TOKEN,
      host: "screeps.com",
      port: 443,
      protocol: "https",
      shard: "shard3"
    }
  };

  const server = createMCPServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

## Configuration

### Environment Variables

- `SCREEPS_TOKEN` - Screeps API token (recommended)
- `SCREEPS_EMAIL` - Screeps account email (alternative to token)
- `SCREEPS_PASSWORD` - Screeps account password (alternative to token)
- `SCREEPS_HOST` - Screeps server host (default: "screeps.com")
- `SCREEPS_PORT` - Screeps server port (default: 443)
- `SCREEPS_PROTOCOL` - Protocol to use: "http" or "https" (default: "https")
- `SCREEPS_SHARD` - Shard name (default: "shard3")

### MCP Server Configuration

```json
{
  "mcpServers": {
    "screeps-mcp": {
      "command": "npx",
      "args": ["-y", "@ralphschuler/screeps-mcp@latest"],
      "env": {
        "SCREEPS_TOKEN": "${SCREEPS_TOKEN}",
        "SCREEPS_HOST": "${SCREEPS_HOST:-screeps.com}",
        "SCREEPS_SHARD": "${SCREEPS_SHARD:-shard3}"
      }
    }
  }
}
```

### Docker Usage

The MCP server is available as a Docker image for containerized deployments.

**Pull from GHCR:**

```bash
docker pull ghcr.io/ralphschuler/screeps-mcp:latest
```

**Run with environment variables:**

```bash
docker run --rm -i \
  -e SCREEPS_TOKEN=${SCREEPS_TOKEN} \
  -e SCREEPS_HOST=screeps.com \
  -e SCREEPS_SHARD=shard3 \
  ghcr.io/ralphschuler/screeps-mcp:latest
```

**Build locally:**

```bash
cd packages/screeps-mcp
npm run docker:build
npm run docker:run
```

### Docker stdio Transport Configuration

For MCP clients like Claude Desktop or Cursor, configure the Docker-based server:

```json
{
  "mcpServers": {
    "screeps-mcp-docker": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "SCREEPS_TOKEN=${SCREEPS_TOKEN}",
        "-e",
        "SCREEPS_HOST=${SCREEPS_HOST:-screeps.com}",
        "-e",
        "SCREEPS_SHARD=${SCREEPS_SHARD:-shard3}",
        "ghcr.io/ralphschuler/screeps-mcp:latest"
      ]
    }
  }
}
```

## MCP Resources

The server exposes the following Screeps data as MCP resources:

### `screeps://game/rooms`

Room state and structures including controller levels, energy availability, and capacity.

**Example:**

```json
[
  {
    "name": "W1N1",
    "controller": {
      "level": 3,
      "progress": 1000,
      "progressTotal": 10000
    },
    "energyAvailable": 300,
    "energyCapacityAvailable": 550
  }
]
```

### `screeps://game/creeps`

Creep status including roles, room assignments, health, and TTL.

**Example:**

```json
[
  {
    "name": "Harvester1",
    "role": "harvester",
    "room": "W1N1",
    "hits": 100,
    "hitsMax": 100,
    "ticksToLive": 1500
  }
]
```

### `screeps://game/spawns`

Spawn queue, energy levels, and spawning status.

**Example:**

```json
[
  {
    "name": "Spawn1",
    "room": "W1N1",
    "spawning": {
      "name": "Harvester2",
      "needTime": 15,
      "remainingTime": 5
    },
    "energy": 300,
    "energyCapacity": 300
  }
]
```

### `screeps://memory`

Bot memory structure at the root or specified path.

**Example:**

```json
{
  "success": true,
  "path": "rooms.W1N1",
  "value": {
    "sources": ["5a..."],
    "harvesterCount": 2
  }
}
```

### `screeps://stats`

Performance and telemetry data including CPU, GCL, and entity counts.

**Example:**

```json
{
  "cpu": {
    "used": 10.5,
    "limit": 20,
    "bucket": 5000
  },
  "gcl": {
    "level": 3,
    "progress": 15000,
    "progressTotal": 100000
  },
  "rooms": 1,
  "creeps": 5
}
```

## MCP Tools

The server provides the following tools for Screeps operations:

### `screeps.console`

Execute console commands in Screeps and automatically receive the response via WebSocket.

**Features:**
- Sends console command to Screeps server
- Waits for and returns the console response (5 second timeout)
- Returns both log messages and results
- Handles console errors gracefully
- Falls back to old behavior if WebSocket is unavailable

**Input:**

```json
{
  "command": "Game.time"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "12345"
    }
  ]
}
```

**Error Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": ""
    }
  ],
  "isError": true
}
```

**Note:** The console response is retrieved via WebSocket subscription. If the WebSocket connection is unavailable or times out, the tool will indicate this in the response.

### `screeps.memory.get`

Read Memory objects from Screeps.

**Input:**

```json
{
  "path": "rooms.W1N1"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"path\": \"rooms.W1N1\", \"value\": {...}}"
    }
  ]
}
```

### `screeps.memory.set`

Update Memory in Screeps with safety checks to prevent prototype pollution.

**Input:**

```json
{
  "path": "myData.config",
  "value": { "setting": 123 }
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"path\": \"myData.config\", \"value\": {...}}"
    }
  ]
}
```

**Safety:** This tool rejects paths containing `__proto__`, `constructor`, or `prototype` to prevent security vulnerabilities.

### `screeps.stats`

Query performance metrics from Screeps.

**Input:**

```json
{}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"cpu\": {...}, \"gcl\": {...}, \"rooms\": 1, \"creeps\": 5}"
    }
  ]
}
```

### `screeps.segment.get`

Read a memory segment from Screeps.

**Input:**

```json
{
  "segment": 0
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": \"segment content...\"}"
    }
  ]
}
```

### `screeps.segment.set`

Write a memory segment to Screeps (max 100KB).

**Input:**

```json
{
  "segment": 0,
  "data": "segment content..."
}
```

### `screeps.game.time`

Get the current game time/tick.

**Input:**

```json
{}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"time\": 12345678}"
    }
  ]
}
```

### `screeps.room.terrain`

Get room terrain data.

**Input:**

```json
{
  "room": "W1N1"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"terrain\": \"encoded terrain string\"}"
    }
  ]
}
```

### `screeps.room.objects`

Get all objects in a room.

**Input:**

```json
{
  "room": "W1N1"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"objects\": [...]}"
    }
  ]
}
```

### `screeps.room.status`

Get room status (owner, reservation, sign, etc.).

**Input:**

```json
{
  "room": "W1N1"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": {\"status\": \"normal\", \"owner\": \"username\"}}"
    }
  ]
}
```

### `screeps.market.orders`

Get market orders, optionally filtered by resource type.

**Input:**

```json
{
  "resourceType": "energy"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"orders\": [...]}"
    }
  ]
}
```

### `screeps.my.market.orders`

Get your own market orders.

**Input:**

```json
{}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"orders\": [...]}"
    }
  ]
}
```

### `screeps.user.info`

Get user information by username.

**Input:**

```json
{
  "username": "someUser"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": {\"username\": \"someUser\", \"gcl\": {...}}}"
    }
  ]
}
```

### `screeps.shard.info`

Get information about all shards.

**Input:**

```json
{}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": [{\"name\": \"shard0\", ...}, {...}]}"
    }
  ]
}
```

### `screeps.user.world.status`

Get user world status for a specific shard.

**Input:**

```json
{
  "shard": "shard3"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": {...}}"
    }
  ]
}
```

### `screeps.user.world.start.room`

Get user start room information.

**Input:**

```json
{}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": {...}}"
    }
  ]
}
```

### `screeps.user.rooms`

Get rooms owned by a specific user.

**Input:**

```json
{
  "userId": "588d50e64b9e9fe43a40ebb5"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": [...]}"
    }
  ]
}
```

### `screeps.market.stats`

Get market statistics for a resource type.

**Input:**

```json
{
  "resourceType": "energy",
  "shard": "shard3"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": {...}}"
    }
  ]
}
```

### `screeps.leaderboard.seasons`

Get list of available leaderboard seasons.

**Input:**

```json
{}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": [...]}"
    }
  ]
}
```

### `screeps.leaderboard.find`

Find a user in the leaderboard.

**Input:**

```json
{
  "username": "someUser",
  "season": "2024-01",
  "mode": "world"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": {...}}"
    }
  ]
}
```

### `screeps.leaderboard.list`

Get leaderboard list with pagination.

**Input:**

```json
{
  "season": "2024-01",
  "limit": 20,
  "offset": 0,
  "mode": "world"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": [...]}"
    }
  ]
}
```

### `screeps.experimental.pvp`

Get experimental PVP data for different time intervals.

**Input:**

```json
{
  "interval": 8
}
```

**Note:** `interval` can be `8` for 1 hour, `180` for 24 hours, or `1440` for 7 days.

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": {...}}"
    }
  ]
}
```

### `screeps.experimental.nukes`

Get experimental nukes data for different time intervals.

**Input:**

```json
{
  "interval": 8
}
```

**Note:** `interval` can be `8` for 1 hour, `180` for 24 hours, or `1440` for 7 days.

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": {...}}"
    }
  ]
}
```

### `screeps.user.money.history`

Get user money/credit transaction history.

**Input:**

```json
{
  "page": 0
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": [...]}"
    }
  ]
}
```

### `screeps.room.decorations`

Get room decorations (visual customizations).

**Input:**

```json
{
  "room": "W1N1",
  "shard": "shard3"
}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": {...}}"
    }
  ]
}
```

### `screeps.user.overview`

Get user overview with statistics.

**Input:**

```json
{
  "interval": 8,
  "statName": "energyHarvested"
}
```

**Note:** `interval` can be `8` for 1 hour, `180` for 24 hours, or `1440` for 7 days. `statName` options include: `creepsLost`, `creepsProduced`, `energyConstruction`, `energyControl`, `energyCreeps`, `energyHarvested`.

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": {...}}"
    }
  ]
}
```

### `screeps.respawn.prohibited.rooms`

Get list of rooms where respawning is prohibited.

**Input:**

```json
{}
```

**Output:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"success\": true, \"data\": [...]}"
    }
  ]
}
```

## Security

### Authentication

The server supports two authentication methods:

1. **API Token** (recommended): Set `SCREEPS_TOKEN` environment variable
2. **Email/Password**: Set `SCREEPS_EMAIL` and `SCREEPS_PASSWORD` environment variables

API tokens are preferred for production use as they can be easily revoked and don't expose account credentials.

### Memory Safety

The `screeps.memory.set` tool includes built-in safety checks to prevent prototype pollution attacks. Paths containing `__proto__`, `constructor`, or `prototype` are automatically rejected.

### Access Controls

- All operations require valid Screeps authentication
- Read operations are safe and non-destructive
- Write operations (console, memory.set) should be used with caution
- Consider implementing additional access controls in production environments

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

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

**Automated tests verify:**

- MCP connection establishment
- Tool registration and listing
- Resource registration and listing
- Protocol schema compliance

### Test Coverage

The package maintains comprehensive test coverage:

- **Unit Tests**: Test individual components (ScreepsClient, handlers)
- **Integration Tests**: Validate MCP server initialization and configuration
- **E2E Tests**: Verify MCP protocol compliance and data formats

Current coverage: >95% across all modules.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Write tests for new features
2. Maintain test coverage above 95%
3. Follow existing code style (ESLint/Prettier)
4. Update documentation for API changes

## License

MIT © OpenAI Automations

## Related Packages

- [screeps-docs-mcp](../screeps-docs-mcp) - MCP server for official Screeps documentation
- [screeps-wiki-mcp](../screeps-wiki-mcp) - MCP server for accessing the Screeps community wiki
- [screeps-bot](../screeps-bot) - Advanced Screeps AI using swarm intelligence

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/) - Official MCP specification
- [screeps-api](https://github.com/screepers/node-screeps-api) - Node.js Screeps API client
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - Official MCP SDK

## Changelog

See [CHANGELOG.md](../../CHANGELOG.md) for version history and updates.

## Testing

This package has comprehensive test coverage with unit, integration, and e2e tests.

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

- `tests/unit/` - Unit tests for handlers and client
- `tests/integration/` - Integration tests for MCP server
- `tests/e2e/` - End-to-end protocol tests
- `tests/inspector/` - MCP inspector integration tests

### Coverage Requirements

- Overall: >70%
- Critical paths: >80%
- All tests must pass before merging

