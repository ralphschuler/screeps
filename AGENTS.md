# Agent Instructions

- The ROADMAP.md at repository root is the single source of truth for how this bot operates and must be followed for all code and documentation changes.
- Keep code, tests, and documentation aligned with the roadmap's swarm architecture, lifecycle stages, and design principles.
- Update this file whenever roadmap-driven constraints change.

## MCP Servers for Screeps

This repository provides four MCP (Model Context Protocol) servers that you **MUST** use for fact-checking and verifying your decisions about Screeps. These servers provide authoritative information about the game API, documentation, TypeScript types, and community strategies.

### When to Use MCP Servers

**ALWAYS** use the appropriate MCP server to fact-check before:
- Writing or modifying bot code that uses Screeps API
- Making assertions about game mechanics, constants, or behavior
- Implementing features that interact with game objects (Creeps, Rooms, Structures, etc.)
- Discussing or documenting Screeps API methods or properties
- Making decisions about optimal strategies or approaches

### Available MCP Servers

#### 1. screeps-mcp (Live Game API)
**Use for**: Real-time game state, memory inspection, console commands, and live data

Tools include:
- `screeps_console` - Execute console commands and get responses
- `screeps_memory_get` / `screeps_memory_set` - Read/write bot memory
- `screeps_room_terrain` / `screeps_room_objects` / `screeps_room_status` - Room information
- `screeps_market_orders` / `screeps_market_stats` - Market data
- `screeps_user_info` / `screeps_user_rooms` - User and room ownership
- `screeps_game_time` - Current game tick
- And 20+ more tools for live game data

**Example**: Before implementing a market trading feature, use `screeps_market_orders` to check current market state and `screeps_market_stats` to verify resource pricing patterns.

#### 2. screeps-docs-mcp (Official Documentation)
**Use for**: Official API documentation, game mechanics explanations, and authoritative references

Tools include:
- `screeps_docs_search` - Search documentation by keyword
- `screeps_docs_get_api` - Get API documentation for specific objects (Game, Room, Creep, etc.)
- `screeps_docs_get_mechanics` - Get game mechanics documentation (control, market, power, etc.)
- `screeps_docs_list_apis` - List all available API objects
- `screeps_docs_list_mechanics` - List all mechanics topics

**Example**: Before implementing creep movement logic, use `screeps_docs_get_api` with `objectName: "Creep"` to verify available methods like `moveTo`, `move`, and their parameters.

#### 3. screeps-typescript-mcp (Type Definitions)
**Use for**: TypeScript type checking, interface definitions, and type relationships

Tools include:
- `screeps_types_search` - Search for TypeScript type definitions
- `screeps_types_get` - Get complete type definition for a specific type
- `screeps_types_list` - List all available types with optional filtering
- `screeps_types_related` - Get types related through extends/implements
- `screeps_types_by_file` - Get types defined in a specific source file

**Example**: When writing TypeScript bot code, use `screeps_types_get` with `name: "StructureTower"` to verify the correct properties and methods available on tower structures.

#### 4. screeps-wiki-mcp (Community Wiki)
**Use for**: Community strategies, bot architectures, optimization patterns, and best practices

Tools include:
- `screeps_wiki_search` - Search wiki articles by keyword
- `screeps_wiki_get_article` - Get full article content in markdown
- `screeps_wiki_list_categories` - Browse wiki categories
- `screeps_wiki_get_table` - Extract structured data from wiki tables

**Example**: When designing a new bot architecture, use `screeps_wiki_search` with `query: "bot architecture"` to learn from community-proven approaches like Overmind or other established patterns.

### Fact-Checking Protocol

Follow this protocol when working on Screeps-related tasks:

1. **Before Coding**: Verify API methods, properties, and constants using `screeps-docs-mcp` or `screeps-typescript-mcp`
2. **During Development**: Check game state and test assumptions using `screeps-mcp` live tools
3. **For Strategy**: Consult community wisdom using `screeps-wiki-mcp` to avoid reinventing solutions
4. **When Uncertain**: Use search tools (`screeps_docs_search`, `screeps_types_search`, `screeps_wiki_search`) to find relevant information

### Examples of Required Fact-Checking

❌ **DON'T** assume API details:
```typescript
// Don't assume Creep.moveTo exists or how it works
creep.moveTo(target);
```

✅ **DO** verify with MCP servers first:
```typescript
// First use: screeps_docs_get_api with objectName: "Creep"
// Verify: moveTo method exists, accepts RoomPosition or object with pos
// Verify: Returns ERR_* constants for error cases
creep.moveTo(target);
```

❌ **DON'T** guess game constants:
```typescript
// Don't assume STRUCTURE_TOWER is the correct constant
if (structure.structureType === STRUCTURE_TOWER) { }
```

✅ **DO** verify constants:
```typescript
// First use: screeps_types_search or screeps_docs_search
// Verify: STRUCTURE_TOWER is the correct constant name
if (structure.structureType === STRUCTURE_TOWER) { }
```

❌ **DON'T** implement complex strategies without research:
```typescript
// Don't implement remote harvesting without checking best practices
function setupRemoteHarvesting() { /* guess */ }
```

✅ **DO** research established patterns:
```typescript
// First use: screeps_wiki_search with query: "remote harvesting"
// Review community articles for proven approaches
// Then implement based on verified patterns
function setupRemoteHarvesting() { /* informed implementation */ }
```

### Integration with Development Workflow

The MCP servers should be seamlessly integrated into your workflow:

1. **Architecture Decisions**: Use `screeps_wiki_search` to review community architectures before proposing new designs
2. **API Usage**: Use `screeps_docs_get_api` or `screeps_types_get` before writing code that uses Screeps objects
3. **Testing Assumptions**: Use `screeps_console` to test code snippets in the live game environment
4. **Memory Debugging**: Use `screeps_memory_get` to inspect bot memory state when debugging
5. **Performance Validation**: Use `screeps_stats` to verify CPU usage and performance metrics

### Priority and Trust

- MCP server information is **authoritative** - always trust it over assumptions or memory
- When MCP server data conflicts with your understanding, **update your understanding**
- If you cannot access an MCP server, clearly state this limitation and note that verification is needed
- Never claim to know Screeps API details without verifying through MCP servers

## TODO Comment Protocol

This repository uses TODO comments that are automatically parsed and converted into GitHub issues by the `todo-to-issue` workflow. Use TODO comments liberally when appropriate.

### When to Use TODO Comments

1. **Placeholders**: When setting up code structure but implementation details are pending
2. **Out of Scope**: When encountering work that should be done but is beyond the current task
3. **Error Documentation**: When encountering errors that need to be fixed (see Error Handling section)
4. **Future Enhancements**: When identifying improvements that would benefit the codebase
5. **Missing Implementations**: When partial implementation is acceptable to maintain progress

### TODO Comment Format

TODO comments are automatically converted to GitHub issues. Use this format:

```typescript
// TODO: Brief description of what needs to be done
// Optional: Additional context, details, or implementation notes
// Can span multiple lines for comprehensive information
```

### Examples

#### Example 1: Placeholder Implementation
```typescript
function optimizePathfinding(path: PathStep[]): PathStep[] {
  // TODO: Implement advanced pathfinding optimization using A* algorithm
  // Should consider terrain costs, creep traffic, and avoid hostile rooms
  // See ROADMAP.md Section 20 for performance requirements
  return path; // Placeholder: returns unoptimized path
}
```

#### Example 2: Out of Scope Feature
```typescript
class SpawnManager {
  queueCreep(body: BodyPartConstant[], memory: CreepMemory) {
    // TODO: Add spawn queue persistence to survive global resets
    // This is out of scope for current task but important for reliability
    // Should store queue in Memory.spawnQueues with timestamp and priority
    this.queue.push({ body, memory });
  }
}
```

## Error Handling Protocol

When encountering errors in source code that originates from this repository:

1. **Locate the Error Source**: Identify the exact file and line where the error occurs
2. **Create a TODO Comment**: Add a TODO comment at the location of the error with the following format:
   ```typescript
   // TODO: [Error Type] - [Brief Description]
   // Details: [Full error message and context]
   // Encountered: [Context or scenario when error was found]
   // Suggested Fix: [If you have ideas for resolution]
   ```
3. **Include Context**: The TODO should contain:
   - The specific error message or exception
   - The conditions that triggered the error
   - Any relevant stack trace information
   - Suggestions for fixing the issue (if known)

### Example

```typescript
// TODO: TypeError - Cannot read property 'x' of undefined
// Details: Attempting to access position.x when position is undefined
// Encountered: During MCP server room terrain request
// Suggested Fix: Add null check before accessing position properties
if (!position) {
  throw new Error("Position is required");
}
const x = position.x;
```

## Best Practices

- **Be Descriptive**: Write clear, actionable TODO comments that explain what needs to be done and why
- **Add Context**: Include relevant references to ROADMAP.md sections, related files, or design decisions
- **Keep Updated**: Remove TODO comments once the work is completed
- **Don't Overuse**: While TODO comments are encouraged for legitimate cases, don't use them to defer necessary work that should be done immediately

This protocol ensures that incomplete work is tracked systematically and automatically converted into actionable GitHub issues.
