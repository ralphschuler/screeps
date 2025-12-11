# Agent Instructions

- The ROADMAP.md at repository root is the single source of truth for how this bot operates and must be followed for all code and documentation changes.
- Keep code, tests, and documentation aligned with the roadmap's swarm architecture, lifecycle stages, and design principles.
- Update this file whenever roadmap-driven constraints change.

## Error Handling Protocol

When encountering errors in source code that originates from this repository:

1. **Locate the Error Source**: Identify the exact file and line where the error occurs
2. **Create a TODO Comment**: Add a TODO comment at the location of the error with the following format:
   ```typescript
   // TODO: [Error Type] - [Brief Description]
   // Details: [Full error message and context]
   // Encountered: [Date/Context when error was found]
   ```
3. **Include Context**: The TODO should contain:
   - The specific error message or exception
   - The conditions that triggered the error
   - Any relevant stack trace information
   - Suggestions for fixing the issue (if apparent)

### Example

```typescript
// TODO: TypeError - Cannot read property 'x' of undefined
// Details: Attempting to access position.x when position is undefined
// Encountered: During MCP server room terrain request
// Fix: Add null check before accessing position properties
if (!position) {
  throw new Error("Position is required");
}
const x = position.x;
```

This protocol ensures that errors are documented at their source, making it easier for developers to identify and fix issues systematically.
