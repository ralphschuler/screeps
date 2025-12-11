# GitHub Copilot Instructions for Screeps Repository

## Repository Context

This is a Screeps bot repository with a swarm-based architecture. The ROADMAP.md file at the repository root is the single source of truth for how this bot operates.

## Core Principles

1. **Follow the Roadmap**: All code and documentation changes must align with the swarm architecture, lifecycle stages, and design principles defined in ROADMAP.md
2. **Maintain Consistency**: Keep code, tests, and documentation aligned with the established patterns
3. **Respect Constraints**: Adhere to CPU budgets, memory limits, and performance targets outlined in the roadmap

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
