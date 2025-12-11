# GitHub Copilot Instructions for Screeps Repository

## Repository Context

This is a Screeps bot repository with a swarm-based architecture. The ROADMAP.md file at the repository root is the single source of truth for how this bot operates.

## Core Principles

1. **Follow the Roadmap**: All code and documentation changes must align with the swarm architecture, lifecycle stages, and design principles defined in ROADMAP.md
2. **Maintain Consistency**: Keep code, tests, and documentation aligned with the established patterns
3. **Respect Constraints**: Adhere to CPU budgets, memory limits, and performance targets outlined in the roadmap

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
