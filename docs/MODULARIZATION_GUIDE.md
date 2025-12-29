# Modularization Implementation Guide

This document provides step-by-step instructions for extracting the remaining high-priority packages from the monolithic bot codebase.

## Completed Work

✅ **Infrastructure Setup**
- Package template documentation (docs/PACKAGE_TEMPLATE.md)
- Package creation script (scripts/create-package.sh)
- Framework documentation (docs/FRAMEWORK.md)
- Workspace configuration updated

✅ **@ralphschuler/screeps-kernel**
- Extracted kernel.ts, processDecorators.ts, adaptiveBudgets.ts, events.ts
- Created minimal logger.ts and config.ts interfaces
- Package builds successfully
- Comprehensive README with examples
- Added to root build/test scripts

## Remaining Packages (Priority Order)

### 1. @ralphschuler/screeps-stats

**Files to Extract:**
- `packages/screeps-bot/src/core/unifiedStats.ts` (1,645 LOC)
- `packages/screeps-bot/src/core/memorySegmentStats.ts` (633 LOC)
- `packages/screeps-bot/src/core/nativeCallsTracker.ts` (if exists)
- Related types from `packages/screeps-bot/src/stats/types.ts`

**Dependencies to Handle:**
- Depends on kernel (already extracted - use as dependency)
- Depends on logger (create minimal interface or use kernel's)
- Depends on memoryManager (may need to extract or mock)
- Cache stats utilities (import from screeps-utils or duplicate)

**Steps:**
```bash
# 1. Create package
./scripts/create-package.sh stats "Unified stats collection and export for Prometheus/Graphite"

# 2. Copy files
cp packages/screeps-bot/src/core/unifiedStats.ts packages/@ralphschuler/screeps-stats/src/
cp packages/screeps-bot/src/core/memorySegmentStats.ts packages/@ralphschuler/screeps-stats/src/
cp packages/screeps-bot/src/stats/types.ts packages/@ralphschuler/screeps-stats/src/

# 3. Add dependency
cd packages/@ralphschuler/screeps-stats
npm install @ralphschuler/screeps-kernel

# 4. Update imports to use kernel package
# In unifiedStats.ts and memorySegmentStats.ts:
# Change: import { logger } from "./logger"
# To: import { logger } from '@ralphschuler/screeps-kernel'

# 5. Define public API in src/index.ts
# Export: UnifiedStatsManager, memorySegmentStats, types

# 6. Update root package.json
# Add: "build:stats": "npm run build -w @ralphschuler/screeps-stats"
# Add: "test:stats": "npm test -w @ralphschuler/screeps-stats"

# 7. Build and test
npm run build
cd ../../../
npm run build:stats
```

**Public API:**
```typescript
// src/index.ts
export { UnifiedStatsManager, unifiedStats } from './unifiedStats';
export { MemorySegmentStats, memorySegmentStats } from './memorySegmentStats';
export * from './types';
```

---

### 2. @ralphschuler/screeps-console

**Files to Extract:**
- `packages/screeps-bot/src/core/consoleCommands.ts` (1,078 LOC)
- `packages/screeps-bot/src/core/commandRegistry.ts`
- `packages/screeps-bot/src/core/advancedSystemCommands.ts`
- `packages/screeps-bot/src/core/shardCommands.ts`

**Dependencies to Handle:**
- Depends on kernel (use as dependency)
- Depends on various managers (make them optional/injectable)
- Commands reference other systems (provide hooks/callbacks)

**Steps:**
```bash
./scripts/create-package.sh console "Console command framework with decorators"

# Copy files
cp packages/screeps-bot/src/core/consoleCommands.ts packages/@ralphschuler/screeps-console/src/
cp packages/screeps-bot/src/core/commandRegistry.ts packages/@ralphschuler/screeps-console/src/
cp packages/screeps-bot/src/core/advancedSystemCommands.ts packages/@ralphschuler/screeps-console/src/
cp packages/screeps-bot/src/core/shardCommands.ts packages/@ralphschuler/screeps-console/src/

# Install dependencies
cd packages/@ralphschuler/screeps-console
npm install @ralphschuler/screeps-kernel

# Update imports and make managers injectable
# Build
npm run build
```

**Public API:**
```typescript
// src/index.ts
export { Command, CommandRegistry, commandRegistry, registerDecoratedCommands } from './commandRegistry';
export { LoggingCommands, VisualizationCommands, KernelCommands } from './consoleCommands';
// Export command classes separately for extensibility
```

---

### 3. @ralphschuler/screeps-empire

**Files to Extract:**
- `packages/screeps-bot/src/empire/empireManager.ts` (960 LOC)
- `packages/screeps-bot/src/empire/expansionManager.ts` (883 LOC)
- `packages/screeps-bot/src/empire/nukeManager.ts` (1,196 LOC)
- `packages/screeps-bot/src/empire/powerBankHarvesting.ts` (659 LOC)
- `packages/screeps-bot/src/empire/powerCreepManager.ts` (656 LOC)
- `packages/screeps-bot/src/empire/remoteRoomManager.ts`
- `packages/screeps-bot/src/empire/intelligence.ts`
- `packages/screeps-bot/src/empire/intelScanner.ts`
- `packages/screeps-bot/src/empire/expansionScoring.ts`
- `packages/screeps-bot/src/empire/expansionCommands.ts`

**Dependencies to Handle:**
- Depends on kernel for process registration
- Uses memory schemas (may need to extract types)
- Integrates with economy system (provide interfaces)

**Steps:**
```bash
./scripts/create-package.sh empire "Empire-level strategy and coordination"

# Copy entire empire directory
cp -r packages/screeps-bot/src/empire/* packages/@ralphschuler/screeps-empire/src/

# Install dependencies
cd packages/@ralphschuler/screeps-empire
npm install @ralphschuler/screeps-kernel

# Extract tooangel subdirectory if present
# Update imports
# Build
npm run build
```

**Public API:**
```typescript
// src/index.ts
export { EmpireManager, empireManager } from './empireManager';
export { ExpansionManager, expansionManager } from './expansionManager';
export { NukeManager, nukeManager } from './nukeManager';
export { PowerBankHarvesting } from './powerBankHarvesting';
export { PowerCreepManager } from './powerCreepManager';
export { RemoteRoomManager } from './remoteRoomManager';
// Export types and scoring utilities
```

---

### 4. @ralphschuler/screeps-intershard

**Files to Extract:**
- `packages/screeps-bot/src/intershard/shardManager.ts` (1,118 LOC)
- `packages/screeps-bot/src/intershard/resourceTransferCoordinator.ts`
- `packages/screeps-bot/src/intershard/schema.ts`

**Dependencies to Handle:**
- Uses InterShardMemory API
- May depend on memory schemas
- Integrates with empire manager

**Steps:**
```bash
./scripts/create-package.sh intershard "Multi-shard coordination and resource routing"

# Copy files
cp -r packages/screeps-bot/src/intershard/* packages/@ralphschuler/screeps-intershard/src/

# Install dependencies
cd packages/@ralphschuler/screeps-intershard
npm install @ralphschuler/screeps-kernel

# Update imports
# Build
npm run build
```

**Public API:**
```typescript
// src/index.ts
export { ShardManager, shardManager } from './shardManager';
export { ResourceTransferCoordinator } from './resourceTransferCoordinator';
export * from './schema';
```

---

### 5. @ralphschuler/screeps-visuals

**Files to Extract:**
- `packages/screeps-bot/src/visuals/roomVisualizer.ts` (821 LOC)
- `packages/screeps-bot/src/visuals/mapVisualizer.ts`
- `packages/screeps-bot/src/visuals/roomVisualExtensions.ts`
- `packages/screeps-bot/src/visuals/budgetDashboard.ts`
- `packages/screeps-bot/src/visuals/visualizationManager.ts`

**Dependencies to Handle:**
- Uses kernel for budget info
- Uses pheromone data (provide interface or optional)
- Uses stats data (provide interface)

**Steps:**
```bash
./scripts/create-package.sh visuals "Visualization and debugging overlays"

# Copy files
cp -r packages/screeps-bot/src/visuals/* packages/@ralphschuler/screeps-visuals/src/

# Install dependencies
cd packages/@ralphschuler/screeps-visuals
npm install @ralphschuler/screeps-kernel

# Update imports
# Build
npm run build
```

**Public API:**
```typescript
// src/index.ts
export { RoomVisualizer, roomVisualizer } from './roomVisualizer';
export { MapVisualizer, mapVisualizer } from './mapVisualizer';
export { BudgetDashboard } from './budgetDashboard';
export { VisualizationManager } from './visualizationManager';
```

---

## Common Patterns for All Packages

### 1. Handling Circular Dependencies

If package A needs package B and vice versa:

**Solution 1: Extract common types to a shared package**
```typescript
// Create @ralphschuler/screeps-types for shared interfaces
// Both A and B depend on types package
```

**Solution 2: Use dependency injection**
```typescript
// Package A exports interface
export interface ServiceA {
  doSomething(): void;
}

// Package B accepts A via constructor/setter
export class ServiceB {
  constructor(private serviceA: ServiceA) {}
}
```

### 2. Handling Global State

**Problem:** Packages need to share Memory or global objects.

**Solution:** Use interfaces and dependency injection
```typescript
// In package
export interface MemoryProvider {
  getMemory(): Memory;
  setMemory(data: any): void;
}

export class MyManager {
  constructor(private memory: MemoryProvider) {}
}

// In bot
import { MyManager } from '@ralphschuler/my-package';

const manager = new MyManager({
  getMemory: () => Memory,
  setMemory: (data) => { Memory = data; }
});
```

### 3. Handling Config Dependencies

**Problem:** Packages need bot configuration.

**Solution:** Accept config in constructor or provide defaults
```typescript
// In package
export interface PackageConfig {
  enabled: boolean;
  threshold: number;
}

export class MyManager {
  private config: PackageConfig;

  constructor(config: Partial<PackageConfig> = {}) {
    this.config = {
      enabled: true,
      threshold: 100,
      ...config
    };
  }
}
```

### 4. Testing Extracted Packages

Each package needs tests:

```typescript
// test/MyManager.test.ts
import { expect } from 'chai';
import { MyManager } from '../src/MyManager';

describe('MyManager', () => {
  let manager: MyManager;

  beforeEach(() => {
    manager = new MyManager();
  });

  it('should initialize correctly', () => {
    expect(manager).to.exist;
  });

  it('should perform expected behavior', () => {
    const result = manager.doSomething();
    expect(result).to.equal(expectedValue);
  });
});
```

### 5. Integrating Back into Bot

Once a package is extracted, update the bot to use it:

```typescript
// Before (in bot)
import { kernel } from './core/kernel';

// After (using package)
import { kernel } from '@ralphschuler/screeps-kernel';
```

## Validation Checklist

For each extracted package:

- [ ] Package builds successfully (`npm run build:<name>`)
- [ ] Tests pass (`npm run test:<name>`)
- [ ] Bot still builds with package imported
- [ ] No circular dependencies detected
- [ ] Public API documented in README
- [ ] Types exported correctly
- [ ] No broken imports in bot code
- [ ] Package added to Framework.md

## Integration Strategy

To minimize disruption:

1. **Extract package** - Create new package with copied files
2. **Build package** - Ensure it compiles
3. **Keep bot code** - Don't remove from bot yet
4. **Add bot dependency** - Install package in bot
5. **Alias imports** - Use module alias to test package
6. **Verify bot works** - Test extensively
7. **Remove duplicates** - Delete original files from bot
8. **Final validation** - Ensure everything still works

## Troubleshooting

### Build Errors

**Error: Cannot find module**
- Check package is installed in dependencies
- Verify import paths are correct
- Ensure package is built (`npm run build:<name>`)

**Error: Circular dependency**
- Extract common types to separate package
- Use dependency injection
- Restructure code to break cycle

### Runtime Errors

**Error: Module not found at runtime**
- Verify package is listed in bot's package.json dependencies
- Run `npm install` in bot directory
- Check rollup/webpack config includes package

**Error: Type errors**
- Ensure types are exported from package index.ts
- Check tsconfig.json includes correct types
- Verify @types/screeps is installed

## Next Steps

1. Extract remaining 5 high-priority packages
2. Add comprehensive tests (>80% coverage target)
3. Integrate packages into bot code
4. Validate no regressions
5. Consider publishing packages to npm
6. Extract medium-priority packages (cache, clusters, layouts)
7. Document all packages in Framework.md

## Estimated Effort

Per package (including testing and integration):
- Small package (< 500 LOC): 1-2 hours
- Medium package (500-1500 LOC): 2-4 hours  
- Large package (> 1500 LOC): 4-8 hours

Total remaining work: ~15-25 hours

## Benefits Achieved

After completing all extractions:

✅ **Modularity**: 40-50% of code in reusable packages
✅ **Testability**: Each package independently testable
✅ **Reusability**: Community can use individual packages
✅ **Maintainability**: Clear boundaries and responsibilities
✅ **Build Performance**: Incremental builds, parallel compilation
✅ **Framework Value**: Lower barrier to Screeps development

## References

- [Package Template](./PACKAGE_TEMPLATE.md) - Detailed package creation guide
- [Framework Documentation](./FRAMEWORK.md) - Using packages together
- [Screeps Kernel README](../packages/@ralphschuler/screeps-kernel/README.md) - Example package docs
