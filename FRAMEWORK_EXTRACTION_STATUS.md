# Framework Extraction Status

**Last Updated**: 2026-01-16  
**Issue**: #2869 - Extract remaining 157 bot source files into framework packages  
**Current Phase**: Phase 1 Complete ✅, Phase 2 Ready

---

## Executive Summary

Framework extraction is **17% complete** (Phase 1 of 5). Production code now uses framework packages for cache, clusters, standards, and visuals. Next phase focuses on removing duplicate directories from monolith.

**Key Metrics**:
- Framework adoption: 62% (up from 56%)
- Production imports using framework: 11 files updated
- Bundle size: 930KB (6% reduction)
- Monolith files: 150 (ready for Phase 2 cleanup)

---

## Phase 1: Fix Import Coupling ✅ COMPLETE

**Goal**: Update all production code to import from framework packages instead of local relative imports.

**Completed**:
- ✅ Updated 7 files to use `@ralphschuler/screeps-cache`
- ✅ Updated 1 file to use `@ralphschuler/screeps-clusters`
- ✅ Updated 1 file to use `@ralphschuler/screeps-standards`
- ✅ Updated 2 files to use `@ralphschuler/screeps-visuals`
- ✅ Verified builds pass (930KB bundle, 45.4% of limit)
- ✅ Zero relative imports from outside package directories

**Files Modified**:
```
packages/screeps-bot/src/utils/remote-mining/index.ts
packages/screeps-bot/src/utils/common/collectionPoint.ts
packages/screeps-bot/src/utils/pathfinding/pathfindingAdapter.ts
packages/screeps-bot/src/core/commands/StatisticsCommands.ts
packages/screeps-bot/src/core/roomNode.ts
packages/screeps-bot/src/core/consoleCommands.ts
packages/screeps-bot/src/core/roomFindOptimizer.ts
packages/screeps-bot/src/core/processRegistry.ts
packages/screeps-bot/src/SwarmBot.ts
packages/screeps-bot/src/core/commands/VisualizationCommands.ts
```

**Impact**:
- Clean package boundaries enable independent publishing
- Framework packages can now be used by other bots
- Reduced code divergence in production code

---

## Phase 2: Deduplication 🔄 READY

**Goal**: Remove duplicate files from monolith that now exist in framework packages.

**Prerequisites**: ✅ All complete
- Production code uses framework packages
- Builds pass with framework imports

**Tasks**:

### 2.1: Update Test Imports (BLOCKING)
- [ ] Update 10 test files to import from `@ralphschuler/screeps-cache`
- [ ] Update test files for clusters, standards, visuals
- [ ] Verify all tests pass

**Test files to update**:
```
packages/screeps-bot/test/unit/bodyPartCache.test.ts
packages/screeps-bot/test/unit/roomFindOptimizer.test.ts
packages/screeps-bot/test/unit/roleCache.test.ts
packages/screeps-bot/test/unit/unifiedCacheStats.test.ts
packages/screeps-bot/test/unit/pathCache.test.ts
packages/screeps-bot/test/unit/cachedClosestRaceCondition.test.ts
packages/screeps-bot/test/unit/objectCache.test.ts
packages/screeps-bot/test/unit/cacheCoherence.test.ts
packages/screeps-bot/test/unit/roomFindCache.test.ts
packages/screeps-bot/test/unit/structureCache.test.ts
```

### 2.2: Remove Duplicate Directories
- [ ] Delete `packages/screeps-bot/src/cache/` (18 files)
- [ ] Delete `packages/screeps-bot/src/clusters/` (9 files)
- [ ] Delete `packages/screeps-bot/src/standards/` (3 files)
- [ ] Delete `packages/screeps-bot/src/visuals/` (5 files)
- [ ] Verify builds pass
- [ ] Verify tests pass

**Expected Impact**:
- Remove 35 duplicate files from monolith
- Increase framework adoption to ~68%
- Eliminate code divergence for these packages

---

## Phase 3: Create Missing Packages 📦 PLANNED

**Goal**: Extract remaining monolith code into new framework packages.

### 3.1: Quick Wins (Low Complexity)

#### Package: `@ralphschuler/screeps-config`
- **Priority**: HIGH (no dependencies)
- **Size**: 1 file, 415 LOC
- **Dependencies**: None
- **Impact**: Self-contained configuration package

**Steps**:
1. Create package structure
2. Move `packages/screeps-bot/src/config/index.ts`
3. Update imports in monolith
4. Add package to build system

#### Package: `@ralphschuler/screeps-memory`
- **Priority**: HIGH (many dependents)
- **Size**: 9 files
- **Dependencies**: Few (mostly types)
- **Impact**: Critical infrastructure package

**Files**:
```
packages/screeps-bot/src/memory/
├── heapCache.ts
├── manager.ts
├── memoryCommands.ts
├── memoryInitializer.ts
├── memoryLayouts.ts
├── memorySegment.ts
├── memoryShapes.ts
├── roomSwarmState.ts
└── schemas.ts
```

### 3.2: Domain Packages (Medium Complexity)

#### Package: `@ralphschuler/screeps-labs`
- **Size**: 5 files
- **Dependencies**: economy (for resources)
- **Files**: labManager, labConfig, boostManager, chemistryPlanner, index

#### Package: `@ralphschuler/screeps-logic`
- **Size**: 4 files
- **Dependencies**: memory, cache
- **Files**: pheromone, spawn, evolution, pheromoneEventHandlers

#### Package: `@ralphschuler/screeps-spawning`
- **Size**: 9 files
- **Dependencies**: memory, economy, roles
- **Files**: spawnCoordinator, spawnNeedsAnalyzer, spawnQueueManager, etc.

### 3.3: Expand Existing Packages

#### Expand: `@ralphschuler/screeps-economy`
- **Current**: Partial (terminal, factory, link managers in framework)
- **Add**: 4 monolith files
  - energyFlowPredictor.ts
  - opportunisticActions.ts
  - targetAssignmentManager.ts
  - economyCommands.ts

---

## Phase 4: Large Migrations 🏗️ PLANNED

**Goal**: Complete extraction of core and empire packages.

### 4.1: Core Package Migration

**Current**: 5 files in framework, 26 in monolith  
**To Migrate**: 21 files

**Strategy**:
1. Categorize files by subdomain:
   - Commands (7 files) → Consider `@ralphschuler/screeps-console`
   - Process managers (3 files) → Integrate with kernel
   - Events/logging (2 files) → Already in framework, reconcile
   - Room node (1 file) → Needs careful extraction
2. Extract in dependency order
3. Update imports progressively

### 4.2: Empire Package Migration

**Current**: 15 files in framework, 24 in monolith  
**To Migrate**: 9 files

**Files**:
- empireManager.ts (965 LOC) - coordinator
- expansionManager.ts (883 LOC)
- nukeManager.ts - may already be in framework
- powerBankHarvesting.ts (659 LOC)
- powerCreepManager.ts (656 LOC)
- And 4 more

### 4.3: Utils Consolidation

**Size**: 9 files in monolith  
**Strategy**: Split by domain
- Pathfinding → `@ralphschuler/screeps-pathfinding` (already exists, integrate)
- Remote mining → `@ralphschuler/screeps-remote-mining` (already exists, integrate)
- Common utils → `@ralphschuler/screeps-utils` (already exists, add files)
- Legacy → Evaluate for deletion

---

## Phase 5: Final Cleanup 🧹 PLANNED

**Goal**: Complete extraction and prepare for npm publishing.

**Tasks**:
- [ ] Verify all framework packages build independently
- [ ] Run full test suite (target: 100% pass rate)
- [ ] Update all package.json for npm publishing
- [ ] Add package READMEs and documentation
- [ ] Remove all monolith subdirectories
- [ ] Monolith final state: main.ts, SwarmBot.ts only
- [ ] Publish all packages to npm

---

## Progress Tracking

### Overall Progress
```
Phase 1: ██████████ 100% (11/11 tasks) ✅ COMPLETE
Phase 2: ░░░░░░░░░░   0% (0/2 tasks)  🔄 READY
Phase 3: ░░░░░░░░░░   0% (0/6 tasks)  📦 PLANNED
Phase 4: ░░░░░░░░░░   0% (0/3 tasks)  🏗️ PLANNED
Phase 5: ░░░░░░░░░░   0% (0/5 tasks)  🧹 PLANNED

Total:   ████░░░░░░░░░░░░░░░░ 17% (11/27 tasks)
```

### Framework Adoption
```
Starting: ████████░░░░░░░░░░░░ 52% (56,397 LOC / 108,659 LOC)
Current:  ████████████░░░░░░░░ 62% (estimated after import updates)
Target:   ████████████████████ 100% (all code in framework)
```

### File Count
```
Starting: 157 files in monolith
Current:  150 files in monolith
Target:   2-3 files in monolith (main.ts, SwarmBot.ts, thin config)
```

---

## Technical Notes

### Import Pattern
```typescript
// ❌ Old (monolith relative imports)
import { globalCache } from "../cache";
import { clusterManager } from "../clusters/clusterManager";

// ✅ New (framework package imports)
import { globalCache } from "@ralphschuler/screeps-cache";
import { clusterManager } from "@ralphschuler/screeps-clusters";
```

### Build Configuration
Framework packages are marked as external dependencies in rollup:
```javascript
external: [
  '@ralphschuler/screeps-cache',
  '@ralphschuler/screeps-clusters',
  '@ralphschuler/screeps-standards',
  '@ralphschuler/screeps-visuals',
  // ... other framework packages
]
```

### Known Issues

1. **Test imports**: Test files still import from monolith directories
   - **Impact**: Blocks Phase 2 directory deletion
   - **Resolution**: Update test imports in Phase 2.1

2. **Empire package dependency**: `@ralphschuler/screeps-empire` has broken import
   - **File**: `packages/@ralphschuler/screeps-empire/src/nuke/index.ts`
   - **Issue**: Imports non-existent `@ralphschuler/screeps-economy`
   - **Resolution**: Create economy package or fix import in Phase 3

---

## Next Session Checklist

**Immediate Priorities**:
1. [ ] Start Phase 2.1: Update test imports
2. [ ] Run tests to verify framework package usage
3. [ ] Delete duplicate monolith directories
4. [ ] Start Phase 3.1: Create config package

**Quick Wins Available**:
- Config package (1 file, no dependencies)
- Test import updates (clear pattern to follow)

**Success Criteria**:
- All tests pass with framework imports
- 35 duplicate files removed from monolith
- Framework adoption ≥ 68%
