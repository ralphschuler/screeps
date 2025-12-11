# Agent Instructions

- The ROADMAP.md at repository root is the single source of truth for how this bot operates and must be followed for all code and documentation changes.
- Keep code, tests, and documentation aligned with the roadmap's swarm architecture, lifecycle stages, and design principles.
- Update this file whenever roadmap-driven constraints change.

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
