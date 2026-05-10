# Agent Instructions

## Overview

This document provides instructions for AI agents working on the Screeps bot repository. It covers both **manual development** (human-guided tasks) and **autonomous development** (self-directed bot improvement).

**Key Principle**: The ROADMAP.md at repository root is the single source of truth for how this bot operates and must be followed for all code and documentation changes.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Code Philosophy](#code-philosophy)
3. [Screeps Skills and References](#screeps-skills-and-references)
4. [TODO Comment Protocol](#todo-comment-protocol)
5. [Error Handling Protocol](#error-handling-protocol)
6. [**Autonomous Development System**](#autonomous-development-system) ⭐
7. [Best Practices](#best-practices)

---

## Core Principles

1. **Follow the Roadmap**: Keep code, tests, and documentation aligned with the roadmap's swarm architecture, lifecycle stages, and design principles
2. **Required Code Only**: Remove unused features completely rather than disabling them
3. **Fact-Check Everything**: Always verify Screeps API details using local types, official docs, and private-server tests
4. **Document Decisions**: Use TODO comments for future work and architectural decisions
5. **Measure Impact**: Base decisions on metrics and performance data
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

## Screeps Skills and References

This repository uses local agent skills and the Dockerized private-server test harness instead of repo-local protocol servers.

### Required Skills

Use these project skills when their descriptions match the work:

- `screeps-world` - general Screeps gameplay, strategy, safety, and runtime validation workflow
- `screeps-api-reference` - API/type/mechanics fact-checking through local types, local docs, and official docs
- `screeps-private-server` - local/CI private-server startup, smoke/long simulations, artifacts, auth/binding, and `screepsmod-testing` assertions

### Fact-Checking Protocol

Follow this protocol when working on Screeps-related tasks:

1. **Before Coding**: Verify API methods, properties, constants, and TypeScript signatures in `node_modules/@types/screeps/index.d.ts` or official Screeps docs.
2. **During Development**: Check existing repo usage and tests with `rg`; prefer public interfaces and stable contracts.
3. **For Strategy**: Consult `ROADMAP.md`, local package docs, and community strategy sources only after API facts are verified.
4. **For Runtime Behavior**: Use `npm run test:server:smoke` or `npm run test:server:long` and inspect `packages/screeps-server/artifacts/<mode>/`.
5. **When Uncertain**: State what was checked, what remains unverified, and the safest next validation step.

### Priority and Trust

- Local TypeScript types and official Screeps docs are authoritative for API facts.
- Private-server test results are authoritative for this repo's local runtime behavior.
- ROADMAP.md is authoritative for architecture and strategy.
- When references conflict, prefer types/official docs for API signatures and ROADMAP.md for project intent.

---

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

---

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
// Encountered: During private-server room terrain inspection
// Suggested Fix: Add null check before accessing position properties
if (!position) {
  throw new Error("Position is required");
}
const x = position.x;
```

---

## Autonomous Development System

### Overview

This section describes how AI agents can **autonomously** improve the Screeps bot through continuous, data-driven development. The autonomous system enables agents to:

1. **Monitor** bot performance and game state
2. **Identify** optimization opportunities and issues
3. **Plan** and implement improvements
4. **Validate** changes before deployment
5. **Deploy** and monitor impact

### Autonomous Agent Loop

```
OBSERVE → ANALYZE → PLAN → IMPLEMENT → VALIDATE → DEPLOY → MONITOR → (repeat)
```

### 1. OBSERVE: Gather Data

**Objective**: Collect comprehensive data about bot performance and game state.

#### Data Sources

**Private-Server Metrics and Artifacts**:

- Run `npm run test:server:smoke` for short runtime validation.
- Run `npm run test:server:long` for long simulation/performance checks.
- Inspect `packages/screeps-server/artifacts/<mode>/summary.json`, `summary.md`, `harness.log`, and `docker.log`.
- Use exported bot stats/logs when available for CPU, bucket, creep count, task-board, and error-rate trends.


**Recent Issues**:
- Check GitHub issues for open bugs
- Review recent error logs
- Analyze failed deployments

#### What to Look For

| Metric | Warning Threshold | Action Needed |
|--------|------------------|---------------|
| CPU Usage | > 80% | Optimize hot paths |
| GCL Progress | < 0.01/tick | Improve upgraders |
| Error Rate | > 1/tick | Fix bugs immediately |
| Creep Count | < 50 or > 200 | Adjust spawn logic |
| Energy Efficiency | < 80% | Optimize harvesting |
| Bucket Level | < 5000 | Reduce CPU usage urgently |

### 2. ANALYZE: Identify Opportunities

**Objective**: Determine what improvements would have the highest impact.

#### Analysis Framework

**Priority Matrix**:

| Impact | Effort | Priority | Action |
|--------|--------|----------|--------|
| High | Low | **P0** | Implement immediately |
| High | Medium | **P1** | Implement soon |
| High | High | **P2** | Plan carefully |
| Medium | Low | **P1** | Quick wins |
| Medium | Medium | **P2** | Schedule |
| Low | * | **P3** | Defer or skip |

#### Common Improvement Categories

**Performance Optimization**:
- High CPU usage in specific functions
- Inefficient pathfinding
- Excessive memory operations
- Redundant calculations

**Feature Gaps**:
- Missing remote mining
- No market trading
- Weak defense systems
- Inefficient upgrade logic

**Bug Fixes**:
- Errors in logs
- Creeps getting stuck
- Memory leaks
- Logic errors

**Strategic Improvements**:
- Slow GCL progress
- Inefficient resource usage
- Poor room layout
- Suboptimal expansion

### 3. PLAN: Design Solution

**Objective**: Create a detailed implementation plan with clear success criteria.

#### Planning Steps

1. **Research Best Practices**:
   - Read `ROADMAP.md` and nearby package docs first.
   - Use official Screeps docs and community wiki/articles for strategy context when local docs are insufficient.

2. **Verify API Usage**:
   - Check `node_modules/@types/screeps/index.d.ts` for TypeScript signatures.
   - Check official Screeps docs when local types do not answer mechanics details.

3. **Design Architecture**:
   - Ensure alignment with ROADMAP.md
   - Follow swarm architecture principles
   - Maintain code philosophy (required code only)
   - Plan for testability

4. **Define Success Criteria**:
   ```typescript
   const successCriteria = {
     cpu_reduction: '> 10%',
     gcl_improvement: '> 20%',
     error_elimination: '100%',
     test_coverage: '> 80%'
   };
   ```

#### Decision: Autonomous vs Manual

**Proceed Autonomously** when:
- ✅ Problem is well-defined
- ✅ Solution is proven (wiki/docs)
- ✅ Low risk (isolated change)
- ✅ High confidence (verified with local types, official docs, or private-server tests)
- ✅ Aligned with roadmap

**Create TODO/Issue for Human** when:
- ⚠️ Requires architectural decision
- ⚠️ High risk (could break systems)
- ⚠️ Uncertain impact
- ⚠️ Multiple valid approaches
- ⚠️ Significant development time

### 4. IMPLEMENT: Write Code

**Objective**: Implement the solution following best practices and coding standards.

#### Implementation Checklist

**Before Writing Code**:
- [ ] Verify API methods with `node_modules/@types/screeps/index.d.ts` or official docs
- [ ] Check TypeScript definitions before narrowing assumptions
- [ ] Review local docs and community patterns when strategy is involved
- [ ] Understand current implementation

**While Writing Code**:
- [ ] Follow code philosophy (required code only)
- [ ] Add comprehensive comments
- [ ] Write unit tests
- [ ] Use TypeScript strict mode
- [ ] Handle edge cases
- [ ] Add TODO comments for future work
- \[ \] Issue URL: https://github.com/ralphschuler/screeps/issues/910

**After Writing Code**:
- [ ] Run linter and fix issues
- [ ] Verify TypeScript compilation
- [ ] Run all tests
- [ ] Update documentation
- [ ] Add performance benchmarks

#### Code Quality Standards

```typescript
// ✅ Good: Clear, tested, documented
/**
 * Optimizes creep pathfinding by caching paths and avoiding traffic
 * @param creep - The creep to move
 * @param target - The target position
 * @returns Error code (OK, ERR_NOT_IN_RANGE, etc.)
 */
export function optimizedMoveTo(creep: Creep, target: RoomPosition): ScreepsReturnCode {
  // Verify API usage with local @types/screeps or official docs first
  const cachedPath = getPathFromCache(creep, target);
  if (cachedPath && isPathValid(cachedPath)) {
    return creep.moveByPath(cachedPath);
  }
  
  const result = creep.moveTo(target, {
    reusePath: 5,
    visualizePathStyle: { stroke: '#ffffff' }
  });
  
  if (result === OK) {
    cachePathForCreep(creep, target);
  }
  
  return result;
}
```

### 5. VALIDATE: Test Changes

**Objective**: Ensure changes work correctly and don't introduce regressions.

#### Validation Steps

**Automated Tests**:
```bash
# Run all validation checks
npm run build          # TypeScript compilation
npm test               # Unit tests
npm run lint           # Code quality
npm run test:integration  # Integration tests (if available)
```

**Runtime Verification**:

```bash
npm run test:server:smoke
```

Inspect `packages/screeps-server/artifacts/smoke/summary.md` and `summary.json` for tick progression, bot health, CPU bucket, and critical errors.

**ROADMAP Compliance**:
- [ ] Aligns with swarm architecture
- [ ] Follows lifecycle stages
- [ ] Respects CPU budgets
- [ ] Maintains design principles

**Backward Compatibility**:
- [ ] No breaking changes to existing code
- [ ] Memory structure unchanged (or migrated)
- [ ] API contracts maintained

### 6. DEPLOY: Create PR and Merge

**Objective**: Deploy changes through proper git workflow.

#### Deployment Steps

**Create Feature Branch**:
```bash
git checkout -b feature/optimize-pathfinding
```

**Commit Changes**:
```bash
git add .
git commit -m "feat: Optimize creep pathfinding with caching

- Add path caching to reduce CPU usage
- Implement traffic avoidance
- Add unit tests for path validation
- Reduces CPU usage by ~15% in testing

Fixes #123"
```

**Create Pull Request**:
```bash
gh pr create \
  --title "feat: Optimize creep pathfinding with caching" \
  --body "## Overview
  
Implements path caching and traffic avoidance to reduce CPU usage.

## Changes
- Added path caching system
- Implemented traffic detection
- Added comprehensive tests

## Metrics
- CPU reduction: ~15%
- Test coverage: 85%
- No breaking changes

## Validation
- ✅ All tests pass
- ✅ TypeScript compiles
- ✅ Tested in game console
- ✅ ROADMAP compliant"
```

**Auto-Merge Criteria**:
- ✅ All CI checks pass
- ✅ Code review approved (or auto-approved for low-risk changes)
- ✅ No merge conflicts
- ✅ Tests have adequate coverage

### 7. MONITOR: Track Impact

**Objective**: Verify changes have desired effect and detect regressions.

#### Monitoring Period

**Duration**: 24-48 hours after deployment

**Key Metrics to Track**:

- CPU used and bucket trend
- creep count and role distribution
- room survival and spawn uptime
- task-board health (`Memory.creepTaskBoard`)
- critical console errors
- private-server artifact summaries before/after changes

#### Rollback Triggers

**Automatic Rollback** if:
- ❌ CPU usage > 100 (bucket draining)
- ❌ Error rate > 10 per tick
- ❌ Critical metric degradation > 20%
- ❌ Bot stops functioning
- ❌ Global reset triggered

**Manual Review** if:
- ⚠️ Metrics unchanged (no improvement)
- ⚠️ Unexpected side effects
- ⚠️ Minor performance degradation (< 10%)

#### Success Evaluation

```typescript
const evaluateSuccess = (impact: Impact) => {
  if (impact.cpu_reduction > 0.10) {
    console.log('✅ Success: Significant CPU improvement');
    documentSuccess();
  } else if (impact.cpu_reduction > 0) {
    console.log('✅ Success: Minor CPU improvement');
  } else if (impact.cpu_reduction < -0.05) {
    console.log('❌ Regression: CPU usage increased');
    initiateRollback();
  } else {
    console.log('⚠️ Neutral: No significant impact');
    considerRollback();
  }
};
```

### Autonomous Workflow Examples

#### Example 1: Fix High CPU Usage

```
1. OBSERVE: Grafana shows CPU at 95%, bucket draining
2. ANALYZE: Profile shows pathfinding using 40% of CPU
3. PLAN: Implement path caching (proven technique from wiki)
4. IMPLEMENT: Add caching layer with 5-tick reuse
5. VALIDATE: Test shows 15% CPU reduction
6. DEPLOY: Create PR, auto-merge after CI passes
7. MONITOR: Confirm CPU drops to 80%, bucket recovering
   → Success! Document pattern for future use
```

#### Example 2: Improve GCL Progress

```
1. OBSERVE: GCL progress at 0.008/tick (target: 0.015/tick)
2. ANALYZE: Only 2 upgraders per room, energy surplus unused
3. PLAN: Increase upgraders to 4, research optimal body parts
4. IMPLEMENT: Adjust spawn logic, optimize upgrader bodies
5. VALIDATE: Test in console, verify energy usage
6. DEPLOY: Create PR with metrics
7. MONITOR: GCL progress increases to 0.014/tick
   → Success! 75% improvement achieved
```

#### Example 3: Fix Critical Bug

```
1. OBSERVE: Errors in logs: "Cannot read property 'pos' of undefined"
2. ANALYZE: Creeps trying to access destroyed structures
3. PLAN: Add null checks, verify structure exists
4. IMPLEMENT: Add validation, handle edge case
5. VALIDATE: Error disappears in testing
6. DEPLOY: Immediate PR for critical fix
7. MONITOR: Zero errors for 48 hours
   → Success! Bug eliminated
```

### Continuous Learning

#### Track Outcomes

After each autonomous improvement cycle, record:

```typescript
const outcome = {
  change: 'Implemented path caching',
  predicted_impact: { cpu: '-15%' },
  actual_impact: { cpu: '-17%' },
  success: true,
  lessons: [
    'Path caching more effective than predicted',
    'No negative side effects on creep behavior',
    'Pattern applicable to other movement code'
  ],
  next_steps: [
    'Apply caching to hauler movement',
    'Consider caching for tower targeting'
  ]
};
```

#### Update Knowledge Base

- **Successful Patterns**: Document and reuse
- **Failed Approaches**: Avoid in future
- **Impact Predictions**: Refine estimates
- **Decision Criteria**: Improve autonomous judgment

### Safety Guidelines

**Always Safe to Proceed Autonomously**:
- ✅ Bug fixes with clear root cause
- ✅ Performance optimizations with proven techniques
- ✅ Code cleanup and refactoring (if well-tested)
- ✅ Documentation improvements
- ✅ Test additions

**Require Human Review**:
- ⚠️ New game mechanics or strategies
- ⚠️ Major architectural changes
- ⚠️ Changes affecting multiple systems
- ⚠️ Experimental or unproven approaches
- ⚠️ Changes with unclear impact

**Never Proceed Autonomously**:
- ❌ Changes that could cause global reset
- ❌ Modifications to critical safety systems
- ❌ Changes without proper testing
- ❌ Deployments during active combat
- ❌ Changes that violate ROADMAP.md
- ❌ **Any code that would attack or harm allied players (TooAngel, TedRoastBeef) or their entities**

---

## Best Practices

### For Manual Development

- **Be Descriptive**: Write clear, actionable TODO comments that explain what needs to be done and why
- **Add Context**: Include relevant references to ROADMAP.md sections, related files, or design decisions
- **Keep Updated**: Remove TODO comments once the work is completed
- **Don't Overuse**: While TODO comments are encouraged for legitimate cases, don't use them to defer necessary work that should be done immediately

### For Autonomous Development

- **Start Small**: Begin with low-risk, high-confidence improvements
- **Measure Everything**: Track metrics before and after changes
- **Learn from Outcomes**: Document successes and failures
- **Respect Boundaries**: Know when to ask for human review
- **Maintain Quality**: Never compromise on testing or validation
- **Stay Aligned**: Always follow ROADMAP.md architecture

### For All Development

- **Verify with local references**: Always fact-check Screeps API usage with local types or official docs
- **Test Thoroughly**: Write comprehensive tests
- **Document Decisions**: Explain why, not just what
- **Monitor Impact**: Track the effect of changes
- **Iterate Quickly**: Small, frequent improvements over large changes

---

## Conclusion

This document enables both **manual** and **autonomous** development of the Screeps bot. By following these guidelines, AI agents can:

1. **Manually**: Assist with human-directed development tasks
2. **Autonomously**: Continuously improve the bot through data-driven decisions

The key to successful autonomous development is:
- 📊 **Data-driven decisions** based on real metrics
- 🔄 **Continuous monitoring** of impact
- ✅ **Rigorous validation** before deployment
- 🎯 **Alignment** with ROADMAP.md
- 🛡️ **Safety first** with multiple validation layers

Use the autonomous system to evolve the bot continuously while maintaining quality, safety, and strategic direction.
