# AI Agent Guide for Screeps MCP Server

This guide provides comprehensive information for AI agents using the Screeps MCP Server to interact with the Screeps game API.

## Overview

The Screeps MCP Server exposes **27 tools** that enable AI agents to interact with Screeps game state, memory, market data, and more. This server implements the Model Context Protocol (MCP) for standardized AI-tool communication.

## Connection and Authentication

### Environment Variables

The server requires the following environment variables for authentication:

```bash
SCREEPS_TOKEN="your-screeps-api-token"  # Preferred method
SCREEPS_HOST="screeps.com"              # or your private server
SCREEPS_SHARD="shard3"                  # Target shard
```

**Alternative authentication** (less secure):
```bash
SCREEPS_USERNAME="your-username"
SCREEPS_PASSWORD="your-password"
```

### Connection Lifecycle

The server uses **lazy connection initialization**. The connection to Screeps API is established on the first tool invocation, not at server startup. This means:

- First tool call may take slightly longer (connection establishment)
- Subsequent calls reuse the established connection
- Connection errors will appear on first tool use, not at startup

## Tool Categories and Usage

### 1. Console Operations

#### `screeps_console`

Execute console commands in the Screeps game environment.

**Parameters:**
- `command` (string, required): The JavaScript command to execute in the game console

**Use Cases:**
- Testing code snippets before deployment
- Debugging bot behavior in real-time
- Inspecting game state interactively
- Triggering one-time operations

**Example:**
```json
{
  "command": "Game.rooms['W1N1'].find(FIND_MY_CREEPS).length"
}
```

**Response Format:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Command executed successfully\nResponse: 5"
    }
  ]
}
```

**Important Notes:**
- Commands execute in the game's JavaScript environment
- Responses are retrieved via WebSocket subscription (may take 1-2 ticks)
- Syntax errors will be returned in the response
- Commands can modify game state (use with caution)

**Error Scenarios:**
- Invalid JavaScript syntax → Returns syntax error message
- Connection timeout → Returns timeout error
- API authentication failure → Returns auth error

---

### 2. Memory Operations

#### `screeps_memory_get`

Read data from the bot's Memory object.

**Parameters:**
- `path` (string, required): Dot-notation path to memory location (e.g., `"rooms.W1N1.sources"`)

**Use Cases:**
- Inspect bot configuration
- Debug memory structure
- Retrieve cached game data
- Analyze bot decision-making state

**Example:**
```json
{
  "path": "rooms.W1N1"
}
```

**Response Format:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"level\": 8, \"sources\": [...], \"controller\": {...}}"
    }
  ]
}
```

**Path Format:**
- Use dot notation: `"rooms.W1N1.level"`
- Empty string `""` returns entire Memory object
- Non-existent paths return `undefined`

**Performance Considerations:**
- Memory reads are fast (cached on server)
- Large memory objects may take longer to serialize
- Avoid reading entire Memory if only subset is needed

---

#### `screeps_memory_set`

Write data to the bot's Memory object.

**Parameters:**
- `path` (string, required): Dot-notation path to memory location
- `value` (any, required): Value to store (must be JSON-serializable)

**Use Cases:**
- Update bot configuration
- Store analysis results
- Modify cached data
- Set flags or triggers for bot behavior

**Example:**
```json
{
  "path": "config.autoBuild",
  "value": true
}
```

**Response Format:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Memory updated successfully at path: config.autoBuild"
    }
  ]
}
```

**Important Warnings:**
- ⚠️ **Destructive operation**: Overwrites existing data at path
- ⚠️ **No undo**: Changes are immediate and permanent
- ⚠️ **Type safety**: Ensure value matches expected structure
- ⚠️ **Size limits**: Memory is limited to 2MB per shard

**Best Practices:**
- Always read before write to understand current structure
- Use specific paths to avoid overwriting unrelated data
- Validate value structure before writing
- Consider using memory segments for large datasets

---

### 3. Memory Segments

#### `screeps_segment_get`

Read a memory segment (0-99).

**Parameters:**
- `segment` (number, required): Segment number (0-99)

**Use Cases:**
- Access large datasets stored outside main Memory
- Retrieve historical data or logs
- Read shared data between multiple bots
- Access persistent storage

**Example:**
```json
{
  "segment": 0
}
```

**Response Format:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"historicalData\": [...]}"
    }
  ]
}
```

**Segment Characteristics:**
- Each segment can store up to 100KB of string data
- Segments are persistent across global resets
- Access requires explicit activation in bot code
- Segments can be shared between users (with permissions)

---

#### `screeps_segment_set`

Write data to a memory segment.

**Parameters:**
- `segment` (number, required): Segment number (0-99)
- `data` (string, required): String data to store (max 100KB)

**Use Cases:**
- Store large datasets outside main Memory
- Persist historical data across resets
- Share data with other bots
- Archive logs or statistics

**Example:**
```json
{
  "segment": 0,
  "data": "{\"logs\": [...]}"
}
```

**Constraints:**
- Maximum size: 100KB per segment
- Data must be a string (use JSON.stringify for objects)
- Overwrites entire segment content
- Requires segment to be activated in bot code

---

### 4. Room Information

#### `screeps_room_terrain`

Get terrain data for a room (walls, plains, swamps).

**Parameters:**
- `room` (string, required): Room name (e.g., `"W1N1"`, `"E5S10"`)

**Use Cases:**
- Pathfinding optimization
- Room layout analysis
- Strategic planning
- Build placement validation

**Example:**
```json
{
  "room": "W1N1"
}
```

**Response Format:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"terrain\": [[0,0,1,...], ...], \"room\": \"W1N1\"}"
    }
  ]
}
```

**Terrain Encoding:**
- `0` = plain
- `1` = wall
- `2` = swamp

**Notes:**
- Terrain is static and never changes
- Data is 50x50 grid (2500 tiles per room)
- Useful for caching (terrain doesn't change)

---

#### `screeps_room_objects`

Get all objects in a room (creeps, structures, resources, etc.).

**Parameters:**
- `room` (string, required): Room name

**Use Cases:**
- Analyze room contents
- Find specific structures or creeps
- Assess threat level
- Resource availability check

**Example:**
```json
{
  "room": "W1N1"
}
```

**Response Format:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"objects\": [{\"type\": \"creep\", \"_id\": \"...\", ...}, ...]}"
    }
  ]
}
```

**Object Types Included:**
- Creeps (owned and hostile)
- Structures (spawns, extensions, towers, etc.)
- Resources (energy, minerals)
- Construction sites
- Tombstones and ruins

**Performance:**
- Can return large datasets for busy rooms
- Consider filtering on client side
- Data is current as of last game tick

---

#### `screeps_room_status`

Get room ownership and reservation status.

**Parameters:**
- `room` (string, required): Room name

**Use Cases:**
- Check if room is owned
- Verify reservation status
- Assess expansion opportunities
- Identify neutral/hostile rooms

**Example:**
```json
{
  "room": "W1N1"
}
```

**Response Format:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"room\": \"W1N1\", \"status\": \"normal\", \"owner\": {\"username\": \"Player1\"}, ...}"
    }
  ]
}
```

**Status Values:**
- `"normal"` - Regular room
- `"closed"` - Inaccessible room
- `"novice"` - Novice area (protected)
- `"respawn"` - Respawn area

---

#### `screeps_room_decorations`

Get room visual decorations and effects.

**Parameters:**
- `room` (string, required): Room name

**Use Cases:**
- Check for power effects
- Identify special room states
- Visual debugging

---

### 5. Market Operations

#### `screeps_market_orders`

Get market orders, optionally filtered by resource type.

**Parameters:**
- `resourceType` (string, optional): Filter by resource (e.g., `"energy"`, `"H"`, `"XGHO2"`)

**Use Cases:**
- Find buy/sell opportunities
- Price analysis
- Market trend monitoring
- Automated trading decisions

**Example:**
```json
{
  "resourceType": "energy"
}
```

**Response Format:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"orders\": [{\"id\": \"...\", \"type\": \"sell\", \"price\": 0.01, ...}]}"
    }
  ]
}
```

**Order Properties:**
- `type`: "buy" or "sell"
- `price`: Credits per unit
- `amount`: Remaining amount
- `roomName`: Order location

---

#### `screeps_my_market_orders`

Get your own active market orders.

**Use Cases:**
- Monitor your orders
- Track order fulfillment
- Manage active trades

**Example:**
```json
{}
```

---

#### `screeps_market_stats`

Get historical market statistics for a resource.

**Parameters:**
- `resourceType` (string, required): Resource type
- `shard` (string, optional): Shard name (defaults to configured shard)

**Use Cases:**
- Price trend analysis
- Historical data for ML models
- Market forecasting

**Example:**
```json
{
  "resourceType": "energy",
  "shard": "shard3"
}
```

---

### 6. User and World Information

#### `screeps_user_info`

Get information about a user.

**Parameters:**
- `username` (string, required): Username to look up

**Use Cases:**
- Player research
- Alliance verification
- Reputation checking

**Example:**
```json
{
  "username": "Player1"
}
```

---

#### `screeps_user_rooms`

Get list of rooms owned by a user.

**Parameters:**
- `userId` (string, required): User ID (not username)

**Use Cases:**
- Territory mapping
- Expansion planning
- Threat assessment

**Example:**
```json
{
  "userId": "5a5b1c2d3e4f5a6b7c8d9e0f"
}
```

**Note:** Requires user ID, not username. Get ID from `screeps_user_info` first.

---

#### `screeps_user_world_status`

Get your world status (spawn status, rooms, etc.).

**Parameters:**
- `shard` (string, optional): Shard name

**Use Cases:**
- Check if you have spawns
- Verify respawn status
- Monitor account state

---

#### `screeps_user_world_start_room`

Get recommended starting room for respawn.

**Use Cases:**
- Automated respawn logic
- Optimal spawn location selection

---

#### `screeps_user_overview`

Get comprehensive user overview (stats, badges, etc.).

**Use Cases:**
- Profile analysis
- Achievement tracking

---

#### `screeps_user_money_history`

Get credit transaction history.

**Use Cases:**
- Financial tracking
- Market analysis
- Budget monitoring

---

### 7. Game State

#### `screeps_game_time`

Get current game tick/time.

**Use Cases:**
- Timestamp operations
- Synchronization
- Performance measurement

**Example:**
```json
{}
```

**Response Format:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"time\": 12345678}"
    }
  ]
}
```

---

#### `screeps_shard_info`

Get information about all shards.

**Use Cases:**
- Multi-shard coordination
- Shard selection for expansion

---

### 8. Leaderboard

#### `screeps_leaderboard_seasons`

List available leaderboard seasons.

---

#### `screeps_leaderboard_find`

Find a user's position in the leaderboard.

**Parameters:**
- `username` (string, required): Username to find
- `season` (string, optional): Season ID
- `mode` (string, optional): Leaderboard mode

---

#### `screeps_leaderboard_list`

Get leaderboard rankings.

**Parameters:**
- `season` (string, optional): Season ID
- `limit` (number, optional): Results to return (1-100, default 20)
- `offset` (number, optional): Pagination offset
- `mode` (string, optional): Leaderboard mode

---

### 9. Experimental Data

#### `screeps_experimental_pvp`

Get PVP statistics.

**Parameters:**
- `interval` (number, optional): Time interval (8=1h, 180=24h, 1440=7d)

---

#### `screeps_experimental_nukes`

Get active nuke information.

---

#### `screeps_respawn_prohibited_rooms`

Get list of rooms where respawn is prohibited.

---

### 10. Statistics

#### `screeps_stats`

Get performance metrics and statistics.

**Use Cases:**
- Performance monitoring
- CPU usage analysis
- Bot health checking

**Example:**
```json
{}
```

---

## Error Handling

### Common Error Types

1. **Authentication Errors**
   - Cause: Invalid token or credentials
   - Solution: Verify environment variables

2. **Connection Errors**
   - Cause: Network issues or server unavailable
   - Solution: Retry with exponential backoff

3. **Validation Errors**
   - Cause: Invalid parameters
   - Solution: Check parameter types and formats

4. **API Errors**
   - Cause: Screeps API issues
   - Solution: Check API status, retry later

### Error Response Format

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: [error message]"
    }
  ],
  "isError": true
}
```

## Best Practices for AI Agents

### 1. Tool Selection Strategy

**Decision Tree:**
1. Need to execute code? → `screeps_console`
2. Need to read data? → Check what type:
   - Bot memory → `screeps_memory_get`
   - Room info → `screeps_room_*` tools
   - Market data → `screeps_market_*` tools
   - User data → `screeps_user_*` tools
3. Need to modify state? → Check what:
   - Memory → `screeps_memory_set`
   - Segments → `screeps_segment_set`
   - Game actions → `screeps_console` (execute code)

### 2. Performance Optimization

- **Cache static data**: Terrain never changes, cache it
- **Batch operations**: Use console commands for multiple operations
- **Avoid polling**: Don't repeatedly call tools in tight loops
- **Use specific paths**: Read only needed memory paths, not entire Memory

### 3. Safety Guidelines

- **Read before write**: Always check current state before modifying
- **Validate inputs**: Ensure room names, paths, and values are valid
- **Handle errors**: Implement retry logic with backoff
- **Respect limits**: Don't exceed API rate limits

### 4. Common Patterns

**Pattern 1: Safe Memory Update**
```
1. Call screeps_memory_get with path
2. Validate current value
3. Prepare new value
4. Call screeps_memory_set with path and value
5. Optionally verify with another get
```

**Pattern 2: Room Analysis**
```
1. Call screeps_room_status to check ownership
2. Call screeps_room_terrain for layout
3. Call screeps_room_objects for contents
4. Analyze and make decisions
```

**Pattern 3: Market Trading**
```
1. Call screeps_market_stats for price history
2. Call screeps_market_orders for current orders
3. Analyze best opportunities
4. Use screeps_console to execute trades
```

## Troubleshooting

### Issue: Tool calls timeout

**Possible causes:**
- Network connectivity issues
- Screeps API slow response
- Large data transfer

**Solutions:**
- Increase timeout settings
- Use more specific queries (e.g., specific memory paths)
- Check Screeps API status

### Issue: Memory operations fail

**Possible causes:**
- Invalid path format
- Memory size exceeded (2MB limit)
- Invalid JSON in value

**Solutions:**
- Validate path format (dot notation)
- Check Memory size before writing
- Ensure value is JSON-serializable

### Issue: Console commands don't return results

**Possible causes:**
- WebSocket subscription delay
- Command syntax error
- API connection issues

**Solutions:**
- Wait 1-2 ticks for response
- Validate JavaScript syntax
- Check connection status

## Resources

- **Screeps API Documentation**: https://docs.screeps.com/
- **MCP Protocol Specification**: https://modelcontextprotocol.io/
- **Repository**: https://github.com/ralphschuler/screeps
- **Issues**: https://github.com/ralphschuler/screeps/issues

## Version Information

- **Server Version**: 0.1.0
- **MCP SDK Version**: 1.23.0
- **Node.js Requirement**: >=18.0.0

## Support

For issues, questions, or contributions:
1. Check existing documentation
2. Search GitHub issues
3. Create new issue with detailed description
4. Include error messages and reproduction steps
