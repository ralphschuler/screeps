# GitHub Copilot Instructions for Screeps Repository

## Repository Context

This is a Screeps bot repository with a swarm-based architecture. The ROADMAP.md file at the repository root is the single source of truth for how this bot operates.

## Core Principles

1. **Follow the Roadmap**: All code and documentation changes must align with the swarm architecture, lifecycle stages, and design principles defined in ROADMAP.md
2. **Maintain Consistency**: Keep code, tests, and documentation aligned with the established patterns
3. **Respect Constraints**: Adhere to CPU budgets, memory limits, and performance targets outlined in the roadmap
4. **Verify with MCP Servers**: Always fact-check Screeps-related decisions using the available MCP servers before implementing or documenting

## TODO Comment Protocol

This repository uses TODO comments that are automatically parsed and converted into GitHub issues by the `todo-to-issue` workflow. **Use TODO comments liberally** when appropriate - they are a feature, not a code smell.

### When to Use TODO Comments

It is **acceptable and encouraged** to create comprehensive TODO comments in these situations:

1. **Placeholders**: When setting up code structure but full implementation is out of scope
2. **Out of Scope Work**: When you identify work that should be done but exceeds the current task's boundaries
3. **Partial Implementations**: When delivering a minimal working solution with clear next steps documented
4. **Future Enhancements**: When you identify improvements during implementation
5. **Complex Features**: When breaking down large features into smaller, trackable pieces
6. **Error Documentation**: When encountering errors that need separate investigation (see Error Handling section)

### Guidelines

- **Don't feel pressured to implement everything immediately** - if something is getting out of scope or would require significant additional work, add a comprehensive TODO comment instead
- **Be descriptive** - the TODO comment will become a GitHub issue, so include enough context for someone to pick up the work later
- **Include relevant details** - reference ROADMAP.md sections, explain design decisions, suggest implementation approaches
- **Use TODO comments to maintain focus** - they help you stay on track with the current task while documenting future work

### TODO Comment Format

```typescript
// TODO: Brief description of what needs to be done
// Optional: Additional context, details, or implementation notes
// Can span multiple lines for comprehensive information
```

### Examples

#### Example 1: Out of Scope Feature
```typescript
function processRemoteMining(room: Room) {
  // TODO: Implement automatic road building for remote mining routes
  // This is out of scope for the current mining implementation task
  // Should use Dijkstra to find optimal paths and build roads gradually
  // See ROADMAP.md Section 20 for pathfinding requirements
  const resources = room.find(FIND_SOURCES);
  // ... minimal implementation without roads
}
```

#### Example 2: Placeholder for Complex Logic
```typescript
class DefenseCoordinator {
  assessThreat(hostiles: Creep[]): ThreatLevel {
    // TODO: Implement sophisticated threat assessment algorithm
    // Should consider: hostile body parts, damage potential, distance to critical structures
    // Should integrate with military system (see MILITARY_SYSTEM.md)
    // For now, using simple count-based assessment
    return hostiles.length > 5 ? 'high' : 'low';
  }
}
```

#### Example 3: Breaking Down Large Features
```typescript
// TODO: Implement advanced spawn queue with priority system
// Features needed:
// - Priority-based queueing (emergency > defense > economy)
// - Energy availability prediction
// - Body part optimization based on available energy
// - Queue persistence across global resets
// Current implementation uses simple FIFO queue
class SpawnQueue {
  // ... minimal implementation
}
```

## Error Handling Protocol

When you encounter errors in source code that originates from this repository (including MCP servers, bot code, utilities, etc.):

### Process

1. **Identify the Error Source**: Locate the exact file and line number where the error occurs
2. **Add a TODO Comment**: Insert a structured TODO comment at the error location
3. **Document Thoroughly**: Include all relevant context to help resolve the issue

### TODO Comment Format

```typescript
// TODO: [Error Type] - [Brief Description]
// Details: [Full error message and context]
// Encountered: [Context or scenario when error was found]
// Suggested Fix: [If you have ideas for resolution]
```

### Examples

#### Example 1: Null Reference Error
```typescript
async function getRoomData(roomName: string) {
  // TODO: TypeError - Cannot read property 'controller' of undefined
  // Details: Room object is undefined when room is not visible
  // Encountered: During MCP server room status request for invisible rooms
  // Suggested Fix: Add visibility check before accessing room properties
  
  const room = Game.rooms[roomName];
  if (!room) {
    throw new Error(`Room ${roomName} is not visible`);
  }
  return room.controller;
}
```

#### Example 2: API Error
```typescript
try {
  await api.memory.get(path);
} catch (error) {
  // TODO: API Error - Memory path access failed
  // Details: Screeps API returned 401 unauthorized
  // Encountered: When accessing Memory.rooms.W1N1 via MCP
  // Suggested Fix: Verify authentication token and API permissions
  
  console.error('Memory access failed:', error);
  throw error;
}
```

#### Example 3: Logic Error
```typescript
function calculatePathCost(path: PathStep[]): number {
  // TODO: Logic Error - Incorrect cost calculation for swamp terrain
  // Details: Swamp terrain costs 5 not 10, causing suboptimal pathfinding
  // Encountered: During remote mining route calculation
  // Suggested Fix: Update terrain cost matrix to use correct swamp cost of 5
  
  return path.reduce((cost, step) => {
    const terrain = step.terrain;
    return cost + (terrain === TERRAIN_MASK_SWAMP ? 10 : 1); // Should be 5
  }, 0);
}
```

## When NOT to Add TODOs

- **External Library Errors**: Don't add TODOs to third-party dependencies
- **Expected Errors**: Don't add TODOs for intentional error handling (validation, user input errors)
- **Fixed Errors**: Remove the TODO comment once the error is resolved

## Best Practices

1. **Be Specific**: Include exact error messages and line numbers
2. **Provide Context**: Explain when and how the error occurs
3. **Suggest Solutions**: If you understand the fix, document it
4. **Link Related Issues**: Reference GitHub issues if they exist
5. **Update Regularly**: Remove TODOs when errors are fixed

## Additional Guidelines

- **Test MCP Servers**: When working on MCP server code, test error scenarios
- **Validate Input**: Always validate inputs from external sources (API, user commands)
- **Handle Async Errors**: Properly catch and handle async/await errors
- **Log Appropriately**: Use structured logging for debugging errors

## Repository-Specific Patterns

### MCP Error Handling
```typescript
server.registerTool(
  "tool_name",
  schema,
  async (args: unknown) => {
    try {
      await ensureConnected();
      const validated = schema.parse(args);
      return await handler(client, validated);
    } catch (error) {
      // TODO: [If error is in our code, add structured comment here]
      console.error('Tool execution failed:', error);
      throw error;
    }
  }
);
```

### Bot Code Error Handling
```typescript
try {
  // Bot logic
} catch (error) {
  // TODO: [If error reveals a bug in our code, document it]
  console.log(`Error in ${roomName}:`, error);
  // Ensure bot continues running
}
```

This protocol helps maintain code quality and makes debugging more efficient by documenting errors at their source.

## MCP Servers for Screeps

This repository provides five MCP (Model Context Protocol) servers that you **MUST** use for fact-checking and verifying your decisions about Screeps. These servers provide authoritative information about the game API, documentation, TypeScript types, community strategies, and operational monitoring.

### Mandatory Fact-Checking

**ALWAYS** verify Screeps-related information using MCP servers before:
- Writing or modifying bot code that uses Screeps API
- Making assertions about game mechanics, constants, or behavior  
- Implementing features that interact with game objects (Creeps, Rooms, Structures, etc.)
- Discussing or documenting Screeps API methods or properties
- Making decisions about optimal strategies or approaches
- Adding or modifying Screeps constants in code

**NEVER** assume or guess Screeps API details - always verify with MCP tools first.

### Available MCP Servers

#### 1. screeps-mcp (Live Game API)
**Purpose**: Real-time game state, memory inspection, console commands, and live data

**Key Tools**:
- `screeps_console` - Execute console commands and get responses
- `screeps_memory_get` / `screeps_memory_set` - Read/write bot memory
- `screeps_room_terrain` / `screeps_room_objects` / `screeps_room_status` - Room data
- `screeps_market_orders` / `screeps_market_stats` - Market information
- `screeps_game_time` - Current game tick
- `screeps_stats` - Performance metrics (CPU, GCL, entity counts)
- Plus 20+ additional tools for comprehensive game data access

**When to Use**:
- Testing code behavior in the live game environment
- Debugging memory or state issues
- Checking current market conditions
- Verifying room status and ownership
- Monitoring performance and resource usage

**Example**:
```typescript
// Before implementing tower logic, verify structure properties
// Use: screeps_room_objects with room: "W1N1"
// Verify: Tower structure format, energy levels, etc.
const towers = room.find(FIND_MY_STRUCTURES, {
  filter: s => s.structureType === STRUCTURE_TOWER
});
```

#### 2. screeps-docs-mcp (Official Documentation)
**Purpose**: Official API documentation, game mechanics, and authoritative references

**Key Tools**:
- `screeps_docs_search` - Search documentation by keyword
- `screeps_docs_get_api` - Get API docs for Game, Room, Creep, Structures, etc.
- `screeps_docs_get_mechanics` - Get game mechanics (control, market, power, etc.)
- `screeps_docs_list_apis` - List all API objects
- `screeps_docs_list_mechanics` - List all mechanics topics

**When to Use**:
- Verifying API method signatures and return values
- Understanding game mechanics and rules
- Checking constant values and enums
- Learning about object properties and methods
- Confirming behavior of Screeps functions

**Example**:
```typescript
// Before using Creep.moveTo(), verify its signature
// Use: screeps_docs_get_api with objectName: "Creep"
// Verify: moveTo(x, y, [opts]) or moveTo(target, [opts])
// Verify: Returns OK, ERR_NOT_OWNER, ERR_BUSY, ERR_NOT_FOUND, ERR_INVALID_TARGET
const result = creep.moveTo(target, {
  reusePath: 50,
  visualizePathStyle: {stroke: '#ffffff'}
});
```

#### 3. screeps-typescript-mcp (Type Definitions)
**Purpose**: TypeScript type checking, interfaces, and type relationships

**Key Tools**:
- `screeps_types_search` - Search for type definitions by keyword
- `screeps_types_get` - Get complete type definition for a specific type
- `screeps_types_list` - List available types with optional filtering
- `screeps_types_related` - Get related types through extends/implements
- `screeps_types_by_file` - Get types from specific source files

**When to Use**:
- Writing TypeScript bot code
- Verifying structure/object interfaces
- Checking available properties and methods
- Understanding type hierarchies and relationships
- Ensuring type safety in implementations

**Example**:
```typescript
// Before implementing spawn logic, verify StructureSpawn interface
// Use: screeps_types_get with name: "StructureSpawn"
// Verify: spawnCreep method signature and return type
const spawn = Game.spawns['Spawn1'];
const result = spawn.spawnCreep(
  [WORK, CARRY, MOVE],
  'Harvester1',
  { memory: { role: 'harvester' } }
);
```

#### 4. screeps-wiki-mcp (Community Wiki)
**Purpose**: Community strategies, bot architectures, optimization patterns, and best practices

**Key Tools**:
- `screeps_wiki_search` - Search wiki articles by keyword
- `screeps_wiki_get_article` - Get full article content as markdown
- `screeps_wiki_list_categories` - Browse wiki categories (Bots, Strategies, etc.)
- `screeps_wiki_get_table` - Extract structured data from wiki tables

**When to Use**:
- Researching proven bot architectures and patterns
- Learning optimization techniques from the community
- Understanding advanced strategies (remote harvesting, defense, etc.)
- Discovering best practices for specific game scenarios
- Avoiding common pitfalls documented by experienced players

**Example**:
```typescript
// Before implementing a new architecture, research community solutions
// Use: screeps_wiki_search with query: "bot architecture"
// Review: Articles about Overmind, other proven architectures
// Use: screeps_wiki_get_article with title: "Overmind"
// Learn: Established patterns before implementing your own
```

#### 5. grafana-mcp (Monitoring and Observability)
**Purpose**: Performance monitoring, alerting, dashboard management, and operational visibility for bot health and metrics

**Key Tools**:
- `search_dashboards` / `get_dashboard_by_uid` - Access Grafana dashboards displaying bot performance
- `list_alert_rules` / `get_alert_rule_by_uid` - Monitor configured alerts for anomaly detection
- `query_prometheus` - Query time-series metrics (CPU usage, memory, creep counts, etc.)
- `query_loki_logs` - Search and analyze bot logs for errors and debugging
- `list_datasources` / `get_datasource_by_uid` - Access configured Prometheus, Loki, and other data sources
- `get_sift_investigation` / `find_slow_requests` / `find_error_pattern_logs` - AI-powered performance analysis
- `list_incidents` / `get_incident` - Track operational incidents and outages
- `generate_deeplink` - Create direct links to specific dashboards and panels
- Plus 50+ additional tools for comprehensive observability and monitoring

**When to Use**:
- Investigating performance degradation or CPU usage spikes
- Analyzing historical bot behavior and trends
- Debugging errors by correlating logs with metrics
- Monitoring alert status and incident response
- Creating or updating dashboards for new metrics
- Validating that code changes improve performance

**Example**:
```typescript
// Before optimizing pathfinding, analyze current performance
// Use: query_prometheus with expr: "screeps_cpu_usage" to check baseline CPU
// Use: query_loki_logs with logql: '{job="screeps-bot"} |= "pathfinding"' to find bottlenecks
// Use: get_dashboard_by_uid to view "CPU & Performance Monitor" dashboard
// Verify: Current metrics before and after optimization

class PathfindingOptimizer {
  async analyzePerformance() {
    // Implementation informed by Grafana metrics showing
    // pathfinding consumes 40% of CPU budget
  }
}
```

### Fact-Checking Workflow

#### Step 1: Identify Information Needs
Before writing Screeps code or documentation, identify what you need to verify:
- API methods and their parameters
- Game constants and their values
- Object properties and types
- Game mechanics and rules
- Community best practices
- Performance metrics and operational health

#### Step 2: Select Appropriate MCP Server
Choose the right server for your needs:
- **Uncertain about API?** → Use `screeps-docs-mcp`
- **Need type definitions?** → Use `screeps-typescript-mcp`
- **Want to test live?** → Use `screeps-mcp`
- **Looking for strategies?** → Use `screeps-wiki-mcp`
- **Debugging performance?** → Use `grafana-mcp`

#### Step 3: Execute Verification
Use the appropriate MCP tool to verify:
```typescript
// Example verification workflow:
// 1. Check if Room.find() method exists and its signature
//    Tool: screeps_docs_get_api with objectName: "Room"
// 2. Verify FIND_MY_CREEPS constant value
//    Tool: screeps_types_search with query: "FIND_"
// 3. Test the actual implementation
//    Tool: screeps_console with command: "Game.rooms['W1N1'].find(FIND_MY_CREEPS)"
```

#### Step 4: Apply Verified Information
Only after verification, implement using the confirmed information:
```typescript
// Verified that Room.find(type, [opts]) exists
// Verified that FIND_MY_CREEPS is a valid constant
// Tested in console successfully
const myCreeps = room.find(FIND_MY_CREEPS);
```

### Common Verification Scenarios

#### Scenario 1: Implementing New Feature
```typescript
// Task: Implement tower defense logic

// Step 1: Verify StructureTower exists and its methods
// Tool: screeps_docs_get_api with objectName: "StructureTower"
// Learn: attack(), heal(), repair() methods available

// Step 2: Check TypeScript interface
// Tool: screeps_types_get with name: "StructureTower"  
// Verify: energy property, attack method signature

// Step 3: Research best practices
// Tool: screeps_wiki_search with query: "tower defense"
// Learn: Optimal targeting strategies from community

// Step 4: Implement with verified information
class TowerDefense {
  run(tower: StructureTower) {
    const hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (hostile) {
      tower.attack(hostile);
    }
  }
}
```

#### Scenario 2: Debugging Existing Code
```typescript
// Problem: Code using Memory.creeps is failing

// Step 1: Check live memory state
// Tool: screeps_memory_get with path: "creeps"
// Discover: Memory structure doesn't match assumptions

// Step 2: Verify Memory interface
// Tool: screeps_types_get with name: "Memory"
// Confirm: Expected structure and types

// Step 3: Test in console
// Tool: screeps_console with command: "JSON.stringify(Memory.creeps)"
// Validate: Actual runtime structure

// Step 4: Fix based on verified information
```

#### Scenario 3: Optimizing Performance
```typescript
// Goal: Reduce CPU usage in creep logic

// Step 1: Check current CPU usage with detailed historical context
// Tool: query_prometheus with datasourceUid and expr: "screeps_cpu_usage"
// Tool: get_dashboard_by_uid for "CPU & Performance Monitor"
// Baseline: Historical CPU trends and current usage patterns

// Step 2: Analyze logs for performance bottlenecks
// Tool: query_loki_logs with logql: '{job="screeps-bot"} |= "CPU"'
// Tool: find_slow_requests to identify performance issues
// Discover: Specific functions consuming excessive CPU

// Step 3: Research optimization techniques
// Tool: screeps_wiki_search with query: "cpu optimization"
// Learn: Community-tested optimization patterns

// Step 4: Verify API for efficient alternatives
// Tool: screeps_docs_get_api with objectName: "PathFinder"
// Discover: More efficient pathfinding options

// Step 5: Implement optimizations and validate improvements
// Tool: query_prometheus again to measure impact
// Tool: get_dashboard_by_uid to visualize performance gains
// Validate: CPU reduction confirmed in Grafana metrics
```

### Error Prevention with MCP Servers

Many common errors can be prevented by proper MCP server usage:

#### Preventing Type Errors
```typescript
// ❌ BAD: Assuming property exists
const controller = room.controller;
const level = controller.level; // May crash if controller is undefined

// ✅ GOOD: Verify with MCP first
// Tool: screeps_types_get with name: "Room"
// Verified: controller is Room['controller']?: StructureController
const controller = room.controller;
if (controller) {
  const level = controller.level; // Safe
}
```

#### Preventing Constant Errors
```typescript
// ❌ BAD: Guessing constant names
if (creep.memory.role === 'HARVESTER') { } // Wrong: should be lowercase

// ✅ GOOD: Verify constants
// Tool: screeps_types_search with query: "ROLE"
// Or use: screeps_docs_search with query: "constants"
if (creep.memory.role === 'harvester') { } // Correct
```

#### Preventing Logic Errors
```typescript
// ❌ BAD: Assuming game mechanics
const path = room.findPath(start, goal, { ignoreCreeps: true });
// Assumption: ignoreCreeps means path ignores all creeps

// ✅ GOOD: Verify mechanics
// Tool: screeps_docs_get_api with objectName: "Room"
// Verified: ignoreCreeps only ignores creeps for pathfinding, not for validity
const path = room.findPath(start, goal, { ignoreCreeps: true });
// Now understand: Still need to handle creeps blocking the path at runtime
```

### Integration with Development Process

Incorporate MCP verification at every stage:

1. **Planning Phase**
   - Use `screeps_wiki_search` to research architectures
   - Use `screeps_docs_list_apis` to review available APIs
   - Use `screeps_types_list` to understand available types

2. **Design Phase**
   - Use `screeps_docs_get_mechanics` to understand game rules
   - Use `screeps_wiki_get_article` to study proven patterns
   - Use `screeps_types_related` to understand type relationships

3. **Implementation Phase**
   - Use `screeps_docs_get_api` before using any Screeps object
   - Use `screeps_types_get` to verify interfaces while coding
   - Use `screeps_console` to test code snippets in real-time

4. **Testing Phase**
   - Use `screeps_memory_get` to inspect runtime state
   - Use `screeps_room_objects` to verify structure placement
   - Use `query_prometheus` to measure performance metrics
   - Use `get_dashboard_by_uid` to visualize test results

5. **Debugging Phase**
   - Use `screeps_console` to execute diagnostic commands
   - Use `screeps_memory_get` to inspect problematic state
   - Use `screeps_room_status` to verify room conditions
   - Use `query_loki_logs` to search error logs
   - Use `find_error_pattern_logs` for AI-powered error analysis

6. **Monitoring Phase**
   - Use `list_alert_rules` to review active alerts
   - Use `get_dashboard_by_uid` to check operational dashboards
   - Use `query_prometheus` to track KPIs and trends
   - Use `get_incident` to review and learn from past incidents

### Priority and Authority

- **MCP server data is authoritative** - always trust it over assumptions
- **When in doubt, verify** - it's faster than debugging incorrect assumptions
- **Document your verification** - note which MCP tools you used in code comments
- **Update understanding** - when MCP data conflicts with your knowledge, update your mental model
- **Never claim certainty** - about Screeps details without MCP verification

### Limitations and Fallbacks

If MCP servers are unavailable:
1. Clearly state that verification was not possible
2. Mark any Screeps-specific code with TODO comments noting needed verification
3. Request user to enable or configure MCP servers
4. Avoid making definitive statements about Screeps API behavior

### Examples in Practice

#### Example 1: Adding a New Creep Role
```typescript
// REQUIRED VERIFICATION STEPS:
// 1. screeps_types_get with name: "Creep" - verify available methods
// 2. screeps_docs_get_api with objectName: "Creep" - confirm method behaviors
// 3. screeps_wiki_search with query: "creep roles" - learn role patterns

class HarvesterRole {
  run(creep: Creep) {
    // Verified: harvest() returns OK, ERR_NOT_OWNER, ERR_BUSY, ERR_NOT_FOUND, etc.
    const source = creep.pos.findClosestByPath(FIND_SOURCES);
    if (source) {
      const result = creep.harvest(source);
      if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
  }
}
```

#### Example 2: Implementing Market Trading
```typescript
// REQUIRED VERIFICATION STEPS:
// 1. screeps_docs_get_api with objectName: "Game.market" - verify trading API
// 2. screeps_market_orders - check current market state
// 3. screeps_market_stats with resourceType: "energy" - analyze price trends
// 4. screeps_wiki_search with query: "market trading" - learn strategies

class MarketManager {
  analyzeMarket() {
    // Verified via screeps_market_orders and screeps_market_stats
    const orders = Game.market.getAllOrders({ resourceType: RESOURCE_ENERGY });
    // Implementation based on verified market structure...
  }
}
```

#### Example 3: Optimizing Pathfinding
```typescript
// REQUIRED VERIFICATION STEPS:
// 1. screeps_docs_get_api with objectName: "PathFinder" - verify PathFinder API
// 2. screeps_docs_get_mechanics with topic: "cpu" - understand CPU costs
// 3. screeps_wiki_search with query: "pathfinding optimization" - learn techniques
// 4. screeps_stats - measure current pathfinding CPU usage

class PathOptimizer {
  findOptimalPath(start: RoomPosition, goal: RoomPosition) {
    // Verified: PathFinder.search() signature and CostMatrix usage
    const result = PathFinder.search(start, goal, {
      roomCallback: (roomName) => {
        // Verified: CostMatrix methods via screeps_types_get
        const costs = new PathFinder.CostMatrix();
        // ... implementation based on verified API
        return costs;
      }
    });
    return result.path;
  }
}
```

### Conclusion

The MCP servers are not optional tools - they are **required infrastructure** for responsible Screeps development in this repository. Treat them as you would official documentation, type checkers, or linters. Always verify, never assume.
