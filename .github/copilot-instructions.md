# GitHub Copilot Instructions for Screeps Repository

## Repository Context

This is a Screeps bot repository with a swarm-based architecture. The ROADMAP.md file at the repository root is the single source of truth for how this bot operates.

**Important**: This repository supports both **manual development** (human-guided) and **autonomous development** (AI-driven continuous improvement). See AGENTS.md for complete autonomous development workflows.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Code Philosophy](#code-philosophy)
3. [TODO Comment Protocol](#todo-comment-protocol)
4. [Error Handling Protocol](#error-handling-protocol)
5. [MCP Servers](#mcp-servers-for-screeps)
6. [**Autonomous Development Mode**](#autonomous-development-mode) ⭐
7. [Development Patterns](#development-patterns)

---

## Core Principles

1. **Follow the Roadmap**: All code and documentation changes must align with the swarm architecture, lifecycle stages, and design principles defined in ROADMAP.md
2. **Maintain Consistency**: Keep code, tests, and documentation aligned with the established patterns
3. **Respect Constraints**: Adhere to CPU budgets, memory limits, and performance targets outlined in the roadmap
4. **Verify with MCP Servers**: Always fact-check Screeps-related decisions using the available MCP servers before implementing or documenting
5. **Required Code Only**: Keep only code that is actively used. Remove disabled or unused features completely rather than keeping them with config flags
6. **Non-Aggression with Allies**: **NEVER** attack or target allied players (TooAngel, TedRoastBeef) or their creeps/structures - these players are permanent allies and cooperative partners (see ROADMAP Section 25)

---

## Code Philosophy: Required Code Only

**Keep only code that is actively used and required.** When a feature is disabled or not needed:

- **Remove it completely** - Don't just disable it with flags or comments
- **No dead code** - Unused functions, classes, or modules should be deleted
- **Reimplementation is acceptable** - If a feature is needed later, it can be reimplemented from scratch or from git history
- **Simplicity over flexibility** - A smaller, focused codebase is easier to maintain and understand than one full of "just in case" code

### Examples

- ❌ Don't add config flags to disable features - remove the feature entirely
- ❌ Don't keep "commented out" code for future reference - use git history
- ❌ Don't implement features "just in case they're needed someday"
- ✅ Remove unused imports, functions, and classes immediately
- ✅ Delete entire subsystems if they're not being used
- ✅ Trust that git history and documentation preserve removed functionality

---

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

---

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

### When NOT to Add TODOs

- **External Library Errors**: Don't add TODOs to third-party dependencies
- **Expected Errors**: Don't add TODOs for intentional error handling (validation, user input errors)
- **Fixed Errors**: Remove the TODO comment once the error is resolved

---

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

**AI Agent Guide**: `packages/screeps-mcp/AI_AGENT_GUIDE.md`

#### 2. screeps-docs-mcp (Official Documentation)

**Purpose**: Official API documentation, game mechanics explanations, and authoritative references

**Key Tools**:
- `screeps_docs_search` - Search documentation by keyword
- `screeps_docs_get_api` - Get API documentation for specific objects
- `screeps_docs_get_mechanics` - Get game mechanics documentation
- `screeps_docs_list_apis` - List all available API objects

**AI Agent Guide**: `packages/screeps-docs-mcp/AI_AGENT_GUIDE.md`

#### 3. screeps-typescript-mcp (Type Definitions)

**Purpose**: TypeScript type checking, interface definitions, and type relationships

**Key Tools**:
- `screeps_types_search` - Search for TypeScript type definitions
- `screeps_types_get` - Get complete type definition for a specific type
- `screeps_types_list` - List all available types with optional filtering
- `screeps_types_related` - Get types related through extends/implements

**AI Agent Guide**: `packages/screeps-typescript-mcp/AI_AGENT_GUIDE.md`

#### 4. screeps-wiki-mcp (Community Wiki)

**Purpose**: Community strategies, bot architectures, optimization patterns, and best practices

**Key Tools**:
- `screeps_wiki_search` - Search wiki articles by keyword
- `screeps_wiki_get_article` - Get full article content in markdown
- `screeps_wiki_list_categories` - Browse wiki categories
- `screeps_wiki_get_table` - Extract structured data from wiki tables

**AI Agent Guide**: `packages/screeps-wiki-mcp/AI_AGENT_GUIDE.md`

#### 5. grafana-mcp (Monitoring and Observability)

**Purpose**: Performance monitoring, alerting, dashboard management, and operational visibility

**Key Tools**:
- `search_dashboards` / `get_dashboard_by_uid` - Access Grafana dashboards
- `list_alert_rules` / `get_alert_rule_by_uid` - Monitor alert configurations
- `query_prometheus` / `query_loki_logs` - Query metrics and logs
- `get_sift_investigation` / `find_slow_requests` - AI-powered performance debugging

### Fact-Checking Workflow

```
1. Before Coding → Verify API with screeps-docs-mcp or screeps-typescript-mcp
2. During Development → Test with screeps-mcp live tools
3. For Strategy → Research with screeps-wiki-mcp
4. For Performance → Monitor with grafana-mcp
5. When Uncertain → Search across all MCP servers
```

### Examples

#### ❌ DON'T assume API details

```typescript
// Don't assume Creep.moveTo exists or how it works
creep.moveTo(target);
```

#### ✅ DO verify with MCP servers first

```typescript
// First use: screeps_docs_get_api with objectName: "Creep"
// Verify: moveTo method exists, accepts RoomPosition or object with pos
// Verify: Returns ERR_* constants for error cases
const result = creep.moveTo(target);
if (result === ERR_NOT_IN_RANGE) {
  // Handle error
}
```

---

## Autonomous Development Mode

### Overview

This repository supports **autonomous development** where AI agents can continuously improve the bot without human intervention. This mode enables:

1. **Self-directed improvements** based on performance metrics
2. **Automated testing and deployment** with safety checks
3. **Continuous monitoring** of impact
4. **Learning from outcomes** to improve future decisions

See **AGENTS.md** for complete autonomous development workflows.

### When to Use Autonomous Mode

**Use Autonomous Mode** for:

- ✅ Performance optimizations with proven techniques
- ✅ Bug fixes with clear root cause
- ✅ Code cleanup and refactoring (well-tested)
- ✅ Implementing established patterns from wiki
- ✅ Incremental improvements to existing systems

**Require Human Review** for:

- ⚠️ New game mechanics or strategies
- ⚠️ Major architectural changes
- ⚠️ Changes affecting multiple systems
- ⚠️ Experimental or unproven approaches
- ⚠️ Changes with unclear impact

**Never Autonomous** for:

- ❌ Changes that could cause global reset
- ❌ Modifications to critical safety systems
- ❌ Changes without proper testing
- ❌ Deployments during active combat
- ❌ Changes that violate ROADMAP.md
- ❌ **Any code that would attack or harm allied players (TooAngel, TedRoastBeef) or their entities**

### Autonomous Development Loop

```
OBSERVE → ANALYZE → PLAN → IMPLEMENT → VALIDATE → DEPLOY → MONITOR
```

#### 1. OBSERVE: Gather Data

```typescript
// Query performance metrics
const metrics = {
  cpu: await query_prometheus('screeps_cpu_used'),
  gcl: await query_prometheus('screeps_gcl_progress'),
  errors: await query_loki_logs('screeps_errors')
};

// Check game state
const gameState = {
  time: await screeps_game_time(),
  rooms: await screeps_user_rooms(),
  stats: await screeps_stats()
};
```

**Look for**:
- High CPU usage (> 80%)
- Slow GCL progress (< 0.01/tick)
- Errors in logs (> 1/tick)
- Inefficient resource usage (< 80%)

#### 2. ANALYZE: Identify Opportunities

**Priority Matrix**:

| Impact | Effort | Priority | Action |
|--------|--------|----------|--------|
| High | Low | **P0** | Implement immediately |
| High | Medium | **P1** | Implement soon |
| High | High | **P2** | Plan carefully |
| Medium | Low | **P1** | Quick wins |

**Common Improvements**:
- Performance optimization (hot paths)
- Feature gaps (remote mining, trading)
- Bug fixes (errors, stuck creeps)
- Strategic improvements (GCL, efficiency)

#### 3. PLAN: Design Solution

```typescript
// Research best practices
const strategies = await screeps_wiki_search('optimization techniques');
const api = await screeps_docs_get_api('Creep');
const types = await screeps_types_get('Creep');

// Define success criteria
const successCriteria = {
  cpu_reduction: '> 10%',
  test_coverage: '> 80%',
  no_regressions: true
};
```

**Decision Criteria**:
- Problem well-defined? → Proceed
- Solution proven? → Proceed
- Low risk? → Proceed
- High confidence? → Proceed
- Aligned with roadmap? → Proceed
- Otherwise → Create TODO/issue

#### 4. IMPLEMENT: Write Code

**Implementation Checklist**:

Before:
- [ ] Verify API with `screeps_docs_get_api`
- [ ] Check types with `screeps_types_get`
- [ ] Review patterns with `screeps_wiki_search`

During:
- [ ] Follow code philosophy (required code only)
- [ ] Add comprehensive tests
- [ ] Use TypeScript strict mode
- [ ] Handle edge cases

After:
- [ ] Run linter
- [ ] Verify compilation
- [ ] Run all tests
- [ ] Update documentation

#### 5. VALIDATE: Test Changes

```bash
# Automated validation
npm run build          # TypeScript compilation
npm test               # Unit tests
npm run lint           # Code quality
```

**Manual Testing**:
```typescript
// Test in game console
await screeps_console(`
  const creep = Game.creeps['Worker1'];
  const result = optimizedMoveTo(creep, target);
  console.log('Result:', result);
`);
```

**Validation Criteria**:
- [ ] All tests pass
- [ ] TypeScript compiles
- [ ] ROADMAP compliant
- [ ] No breaking changes
- [ ] Backward compatible

#### 6. DEPLOY: Create PR

```bash
# Create feature branch
git checkout -b feature/optimize-pathfinding

# Commit changes
git commit -m "feat: Optimize creep pathfinding with caching

- Add path caching to reduce CPU usage
- Implement traffic avoidance
- Add unit tests for path validation
- Reduces CPU usage by ~15% in testing

Fixes #123"

# Create PR
gh pr create \
  --title "feat: Optimize creep pathfinding with caching" \
  --body "## Overview
  
Implements path caching to reduce CPU usage.

## Metrics
- CPU reduction: ~15%
- Test coverage: 85%
- No breaking changes

## Validation
- ✅ All tests pass
- ✅ TypeScript compiles
- ✅ ROADMAP compliant"
```

#### 7. MONITOR: Track Impact

**Monitoring Period**: 24-48 hours

```typescript
// Compare metrics before/after
const impact = {
  cpu: calculateChange(before.cpu, after.cpu),
  gcl: calculateChange(before.gcl, after.gcl),
  errors: calculateChange(before.errors, after.errors)
};

// Evaluate success
if (impact.cpu_reduction > 0.10) {
  console.log('✅ Success: Significant improvement');
  documentSuccess();
} else if (impact.cpu_reduction < -0.05) {
  console.log('❌ Regression: Initiating rollback');
  initiateRollback();
}
```

**Rollback Triggers**:
- ❌ CPU usage > 100 (bucket draining)
- ❌ Error rate > 10 per tick
- ❌ Critical metric degradation > 20%
- ❌ Bot stops functioning

### Autonomous Workflow Examples

#### Example 1: Fix High CPU Usage

```
1. OBSERVE: Grafana shows CPU at 95%
2. ANALYZE: Pathfinding uses 40% of CPU
3. PLAN: Implement path caching (proven from wiki)
4. IMPLEMENT: Add caching with 5-tick reuse
5. VALIDATE: Test shows 15% reduction
6. DEPLOY: Create PR, auto-merge
7. MONITOR: Confirm CPU drops to 80%
   → Success!
```

#### Example 2: Improve GCL Progress

```
1. OBSERVE: GCL at 0.008/tick (target: 0.015)
2. ANALYZE: Only 2 upgraders, energy surplus
3. PLAN: Increase to 4 upgraders, optimize bodies
4. IMPLEMENT: Adjust spawn logic
5. VALIDATE: Test in console
6. DEPLOY: Create PR with metrics
7. MONITOR: GCL increases to 0.014/tick
   → 75% improvement!
```

### Continuous Learning

After each cycle, record outcomes:

```typescript
const outcome = {
  change: 'Implemented path caching',
  predicted_impact: { cpu: '-15%' },
  actual_impact: { cpu: '-17%' },
  success: true,
  lessons: [
    'Caching more effective than predicted',
    'No negative side effects',
    'Pattern applicable elsewhere'
  ],
  next_steps: [
    'Apply to hauler movement',
    'Consider tower targeting cache'
  ]
};
```

**Update Knowledge**:
- ✅ Successful patterns → Document and reuse
- ❌ Failed approaches → Avoid in future
- 📊 Impact predictions → Refine estimates
- 🎯 Decision criteria → Improve judgment

---

## Development Patterns

### Repository-Specific Patterns

#### MCP Error Handling

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

#### Bot Code Error Handling

```typescript
try {
  // Bot logic
} catch (error) {
  // TODO: [If error reveals a bug in our code, document it]
  console.log(`Error in ${roomName}:`, error);
  // Ensure bot continues running
}
```

#### Performance-Critical Code

```typescript
/**
 * Optimized function for high-frequency operations
 * Verified with: screeps_docs_get_api, screeps_types_get
 * Benchmarked: ~0.05 CPU per call
 */
export function optimizedFunction() {
  // Cache frequently accessed data
  const cached = getCachedData();
  if (cached) return cached;
  
  // Minimize object creation
  // Avoid expensive operations in loops
  // Use early returns
  
  const result = performCalculation();
  setCachedData(result);
  return result;
}
```

### Code Quality Standards

#### ✅ Good Code Example

```typescript
/**
 * Optimizes creep pathfinding by caching paths and avoiding traffic
 * @param creep - The creep to move
 * @param target - The target position
 * @returns Error code (OK, ERR_NOT_IN_RANGE, etc.)
 * 
 * Verified with screeps_docs_get_api("Creep")
 * Performance: ~0.1 CPU per call (cached), ~0.5 CPU (new path)
 */
export function optimizedMoveTo(
  creep: Creep, 
  target: RoomPosition
): ScreepsReturnCode {
  // Check cache first
  const cachedPath = getPathFromCache(creep, target);
  if (cachedPath && isPathValid(cachedPath)) {
    return creep.moveByPath(cachedPath);
  }
  
  // Calculate new path with optimization options
  const result = creep.moveTo(target, {
    reusePath: 5,
    visualizePathStyle: { stroke: '#ffffff' }
  });
  
  // Cache successful paths
  if (result === OK) {
    cachePathForCreep(creep, target);
  }
  
  return result;
}
```

#### ❌ Bad Code Example

```typescript
// Don't do this: No verification, no error handling, no caching
function moveCreep(creep, target) {
  creep.moveTo(target); // What if this fails?
}
```

### Testing Patterns

#### Unit Test Example

```typescript
describe('optimizedMoveTo', () => {
  it('should use cached path when available', () => {
    const creep = mockCreep();
    const target = mockPosition();
    
    // First call calculates path
    const result1 = optimizedMoveTo(creep, target);
    expect(result1).toBe(OK);
    
    // Second call uses cache
    const result2 = optimizedMoveTo(creep, target);
    expect(result2).toBe(OK);
    expect(creep.moveByPath).toHaveBeenCalled();
  });
  
  it('should handle invalid paths', () => {
    const creep = mockCreep();
    const target = mockPosition();
    
    // Simulate blocked path
    mockPathBlocked();
    
    const result = optimizedMoveTo(creep, target);
    expect(result).toBe(ERR_NO_PATH);
  });
});
```

---

## Best Practices Summary

### For Manual Development

- ✅ Use TODO comments liberally for out-of-scope work
- ✅ Verify all Screeps API usage with MCP servers
- ✅ Follow code philosophy (required code only)
- ✅ Write comprehensive tests
- ✅ Document decisions and rationale

### For Autonomous Development

- ✅ Start with low-risk, high-confidence improvements
- ✅ Measure everything (before/after metrics)
- ✅ Learn from outcomes (document successes/failures)
- ✅ Respect boundaries (know when to ask for review)
- ✅ Maintain quality (never skip testing)
- ✅ Stay aligned (always follow ROADMAP.md)

### For All Development

- ✅ **Verify with MCP**: Always fact-check Screeps API usage
- ✅ **Test thoroughly**: Write comprehensive tests
- ✅ **Document decisions**: Explain why, not just what
- ✅ **Monitor impact**: Track the effect of changes
- ✅ **Iterate quickly**: Small, frequent improvements over large changes

---

## Conclusion

This repository supports both manual and autonomous development modes. Use the appropriate mode based on the task:

- **Manual Mode**: Human-guided development with AI assistance
- **Autonomous Mode**: Self-directed continuous improvement

Both modes follow the same core principles:
- 📋 Follow ROADMAP.md
- 🧹 Required code only
- ✅ Verify with MCP servers
- 📝 Document with TODOs
- 📊 Measure impact

For complete autonomous development workflows, see **AGENTS.md**.
