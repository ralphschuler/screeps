# Framework Maturity Roadmap - Issue Templates

This document contains issue templates for all phases of the Framework Maturity Roadmap (Epic #2845). These can be copy-pasted to create GitHub issues as needed.

---

## Phase 2: Code Synchronization

### Issue #2844: Audit and Synchronize Divergent Code

**Title**: `feat(framework): Audit and synchronize 22 divergent behavior files`

**Labels**: `framework`, `phase-2`, `code-sync`, `technical-debt`

**Body**:

```markdown
## Context

**Epic**: #2845 - Framework Package Maturity Roadmap  
**Phase**: Phase 2 - Code Synchronization  
**Priority**: P1 (High)  
**Effort**: ~40 hours (5 days)

## Problem

Code divergence exists between monolith and framework packages. 22 behavior files differ between `packages/screeps-bot/src/roles/behaviors` and `packages/@ralphschuler/screeps-roles/src/behaviors`.

This prevents framework adoption because:
- Unclear which version is canonical
- Updates happen in monolith but not framework
- Framework packages become outdated
- Importing from framework gives old behavior

## Objectives

1. **Audit** all 22 divergent files
2. **Document** which version is more recent/complete
3. **Synchronize** code to make framework canonical
4. **Update** imports in monolith to use framework
5. **Delete** duplicate code from monolith

## Divergent Files

From `FRAMEWORK_ADOPTION_NEXT_STEPS.md`:

**Core behaviors**:
- `context.ts`
- `executor.ts`
- `labSupply.ts`
- `military.ts`
- `pheromoneHelper.ts`
- `power.ts`
- `priority.ts`
- `resilience.ts`
- `stateMachine.ts`
- `types.ts`
- `utility.ts`

**Economy behaviors**:
- `builder.ts`
- `harvester.ts`
- `hauler.ts`
- `upgrader.ts`
- (And 7 more economy behavior files)

## Approach

### Step 1: Audit (8 hours)

For each divergent file:

```bash
# Compare versions
diff packages/screeps-bot/src/roles/behaviors/context.ts \
     packages/@ralphschuler/screeps-roles/src/behaviors/context.ts
```

Document in spreadsheet:
- File name
- Monolith LOC
- Framework LOC
- Key differences
- Which is canonical
- Category (bug fix, feature, refactor)

### Step 2: Synchronize (16 hours)

**Framework-First Strategy**:

1. Copy latest monolith code to framework:
   ```bash
   cp packages/screeps-bot/src/roles/behaviors/*.ts \
      packages/@ralphschuler/screeps-roles/src/behaviors/
   ```

2. Fix imports in framework package:
   ```typescript
   // Change from monolith imports:
   import { logger } from "../../core/logger";
   
   // To framework imports:
   import { logger } from "@ralphschuler/screeps-core";
   ```

3. Test framework package independently:
   ```bash
   npm run build:roles
   npm run test:roles
   ```

### Step 3: Update Monolith Imports (12 hours)

Replace all local imports with framework imports:

```typescript
// Before
import { createContext } from "./roles/behaviors/context";

// After
import { createContext } from "@ralphschuler/screeps-roles";
```

Find all local imports:
```bash
grep -r 'from "./roles' packages/screeps-bot/src --include="*.ts"
```

### Step 4: Delete Duplicates (4 hours)

After verifying all imports migrated:

```bash
# Verify no references remain
grep -r "roles/behaviors" packages/screeps-bot/src --include="*.ts"

# Delete duplicate directories
rm -rf packages/screeps-bot/src/roles/behaviors
rm -rf packages/screeps-bot/src/roles/economy
rm -rf packages/screeps-bot/src/roles/military
rm -rf packages/screeps-bot/src/roles/utility
rm -rf packages/screeps-bot/src/roles/power
```

## Success Criteria

- [ ] All 22 files audited and documented
- [ ] Framework packages contain latest code
- [ ] All imports updated to `@ralphschuler/*`
- [ ] Duplicate monolith code deleted
- [ ] Zero code divergence
- [ ] All builds succeed
- [ ] All tests pass
- [ ] Framework adoption >75%
- [ ] Monolith size <50 files

## Testing

1. Build all packages: `npm run build:all`
2. Run all tests: `npm run test:all`
3. Verify bundle size: `npm run build` (check output)
4. Visual verification in-game (if possible)

## Dependencies

**Blocked by**:
- #2827 - Test execution must work

**Blocks**:
- Phase 3 tasks (empire extraction)

## Risks

1. **Breaking changes during sync**
   - Mitigation: Comprehensive testing, git history for rollback
   
2. **Import errors**
   - Mitigation: Build after each import migration
   
3. **Performance regression**
   - Mitigation: Benchmark before/after

## Related Issues

- Epic #2845 - Framework Package Maturity Roadmap
- #2843 - Fix missing dependencies (resolved)
- #2842 - Fix empire alias (resolved)
- #2827 - Restore test execution

## Documentation

- See `FRAMEWORK_ADOPTION_NEXT_STEPS.md` for detailed analysis
- See `FRAMEWORK_MATURITY_ROADMAP.md` for phase tracking
- Update `FRAMEWORK.md` after completion

---

**Estimated Timeline**: 5 working days  
**Assignee**: TBD  
**Due Date**: 2026-02-08 (end of Phase 2)
```

---

## Phase 3: Empire Extraction

### Issue #2836: Extract Empire Layer to Framework Package

**Title**: `feat(framework): Extract empire layer (8,974 LOC) to @ralphschuler/screeps-empire`

**Labels**: `framework`, `phase-3`, `empire`, `extraction`, `modularization`

**Body**:

```markdown
## Context

**Epic**: #2845 - Framework Package Maturity Roadmap  
**Phase**: Phase 3 - Empire Extraction  
**Priority**: P1 (High)  
**Effort**: ~50 hours (6-7 days)

## Problem

The empire layer (8,974 LOC) remains in the monolith at `packages/screeps-bot/src/empire/`. This code handles:
- Nuke management (1,190 LOC)
- Expansion manager (883 LOC)
- Power systems (656 LOC)
- Spawn coordination
- Inter-room logistics

This prevents:
- Independent testing of empire logic
- Reuse by community
- Clear separation of concerns
- Modular updates to empire strategies

## Objectives

1. **Extract** empire code to `@ralphschuler/screeps-empire`
2. **Modularize** oversized files (>500 LOC)
3. **Add tests** (>70% coverage)
4. **Delete** monolith empire directory

## Current Empire Structure

**Location**: `packages/screeps-bot/src/empire/`

**Large Files** (need modularization):
- `nukeManager.ts` (1,190 LOC) → Split into 3 files
- `expansionManager.ts` (883 LOC) → Split into 2 files
- `powerManager.ts` (656 LOC) → Keep as-is (acceptable)

**Other Components**:
- Spawn coordination (~400 LOC)
- Inter-room logistics (~300 LOC)
- Colony management (~200 LOC)

## Approach

### Task 1: Extract Empire Package (20 hours)

1. **Review existing package**:
   ```bash
   ls -la packages/@ralphschuler/screeps-empire/
   ```

2. **Move empire code**:
   ```bash
   # Copy empire files to framework
   cp -r packages/screeps-bot/src/empire/* \
         packages/@ralphschuler/screeps-empire/src/
   ```

3. **Fix imports**:
   ```typescript
   // Change from monolith imports:
   import { logger } from "../core/logger";
   
   // To framework imports:
   import { logger } from "@ralphschuler/screeps-core";
   ```

4. **Add exports** to `packages/@ralphschuler/screeps-empire/src/index.ts`:
   ```typescript
   export * from './nukeManager';
   export * from './expansionManager';
   export * from './powerManager';
   export * from './spawnCoordinator';
   export * from './logistics';
   ```

5. **Build and verify**:
   ```bash
   npm run build:empire
   ```

### Task 2: Modularize Large Files (16 hours)

**Nuke Manager** (1,190 LOC → 3 files):
- `nukeManager.ts` (300 LOC) - Main coordinator
- `nukeTargeting.ts` (400 LOC) - Target selection logic
- `nukeDefense.ts` (400 LOC) - Defense against incoming nukes

**Expansion Manager** (883 LOC → 2 files):
- `expansionManager.ts` (400 LOC) - Main coordinator
- `roomScoring.ts` (400 LOC) - Room evaluation and scoring

**Process**:
1. Identify logical boundaries
2. Extract into separate files
3. Update imports
4. Test each file independently

### Task 3: Add Comprehensive Tests (12 hours)

**Target Coverage**: >70%

**Test Structure**:
```
packages/@ralphschuler/screeps-empire/test/
├── unit/
│   ├── nukeManager.test.ts
│   ├── expansionManager.test.ts
│   ├── powerManager.test.ts
│   └── ...
└── integration/
    ├── empireCoordination.test.ts
    └── ...
```

**Test Types**:
- Unit tests for each manager
- Integration tests for empire coordination
- Mock tests for Screeps API calls

**Run tests**:
```bash
npm run test:empire
```

### Task 4: Delete Monolith Empire (2 hours)

1. **Update monolith to import from framework**:
   ```typescript
   // In packages/screeps-bot/src/main.ts
   import { nukeManager, expansionManager } from '@ralphschuler/screeps-empire';
   ```

2. **Verify no local imports remain**:
   ```bash
   grep -r "empire/" packages/screeps-bot/src --include="*.ts"
   ```

3. **Delete monolith empire directory**:
   ```bash
   rm -rf packages/screeps-bot/src/empire/
   ```

4. **Build and test**:
   ```bash
   npm run build
   npm test
   ```

## Success Criteria

- [ ] Empire package builds successfully
- [ ] All empire files <500 LOC
- [ ] Empire package test coverage >70%
- [ ] Monolith empire/ directory deleted
- [ ] All imports use `@ralphschuler/screeps-empire`
- [ ] All builds succeed
- [ ] All tests pass
- [ ] No code divergence

## Testing

**Unit Tests**:
```bash
npm run test:empire
```

**Integration Tests**:
```bash
npm run test:integration
```

**Full Build**:
```bash
npm run build:all
npm run test:all
```

## Dependencies

**Blocked by**:
- Phase 2 complete (code synchronization)

**Blocks**:
- Phase 4 tasks (complete modularization)

## Risks

1. **Breaking empire functionality**
   - Mitigation: Comprehensive testing, incremental migration
   
2. **Circular dependencies**
   - Mitigation: Clear dependency graph, strict import rules
   
3. **Test coverage challenges**
   - Mitigation: Focus on critical paths first, use mocks

## Related Issues

- Epic #2845 - Framework Package Maturity Roadmap
- #2824 - Break down oversized files (related)
- #2844 - Code synchronization (must complete first)

## Documentation

- Update `FRAMEWORK.md` with empire package details
- Add empire package README.md
- Document empire architecture decisions

---

**Estimated Timeline**: 6-7 working days  
**Assignee**: TBD  
**Due Date**: 2026-02-22 (end of Phase 3)
```

---

## Phase 3: File Modularization

### Issue #2824: Break Down Oversized Files

**Title**: `refactor: Break down oversized files (>500 LOC) into focused modules`

**Labels**: `framework`, `phase-3`, `refactoring`, `code-quality`, `modularization`

**Body**:

```markdown
## Context

**Epic**: #2845 - Framework Package Maturity Roadmap  
**Phase**: Phase 3 - Empire Extraction  
**Priority**: P2 (Medium)  
**Effort**: ~16 hours (2 days)

## Problem

Several files exceed 500 LOC, making them:
- Hard to understand and maintain
- Difficult to test comprehensively
- Prone to merge conflicts
- Harder to review

## Objectives

1. **Identify** all files >500 LOC
2. **Break down** into focused modules
3. **Maintain** functionality and tests
4. **Ensure** all files <500 LOC

## Target Files

**From Empire Layer**:
- `nukeManager.ts` (1,190 LOC) → 3 files (~400 LOC each)
- `expansionManager.ts` (883 LOC) → 2 files (~400 LOC each)
- ✅ `powerManager.ts` (656 LOC) → Keep as-is (acceptable)

**From Other Packages** (if any found):
- Run audit to find files >500 LOC
- Prioritize by package importance

## Approach

### Step 1: Audit (2 hours)

Find all oversized files:

```bash
# Find TypeScript files >500 LOC in framework packages
find packages/@ralphschuler -name "*.ts" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec wc -l {} \; | \
  awk '$1 > 500 {print $1, $2}' | \
  sort -rn
```

Document:
- File path
- Current LOC
- Proposed split
- Logical boundaries

### Step 2: Break Down Nuke Manager (6 hours)

**Current**: `nukeManager.ts` (1,190 LOC)

**Split into**:
1. `nukeManager.ts` (300 LOC)
   - Main coordinator
   - Public API
   - Lifecycle management

2. `nukeTargeting.ts` (400 LOC)
   - Target selection logic
   - Damage calculation
   - Priority scoring
   - Optimal launch timing

3. `nukeDefense.ts` (400 LOC)
   - Defense against incoming nukes
   - Rampart reinforcement
   - Emergency evacuation
   - Damage mitigation

**Process**:
```typescript
// nukeManager.ts (coordinator)
import { selectTargets } from './nukeTargeting';
import { defendAgainstNuke } from './nukeDefense';

export class NukeManager {
  run(room: Room) {
    // Coordinate targeting and defense
    const targets = selectTargets(room);
    defendAgainstNuke(room);
  }
}

// nukeTargeting.ts
export function selectTargets(room: Room): NukeTarget[] {
  // Target selection logic (400 LOC)
}

// nukeDefense.ts
export function defendAgainstNuke(room: Room): void {
  // Defense logic (400 LOC)
}
```

### Step 3: Break Down Expansion Manager (6 hours)

**Current**: `expansionManager.ts` (883 LOC)

**Split into**:
1. `expansionManager.ts` (400 LOC)
   - Main coordinator
   - Claim requests
   - Scout coordination

2. `roomScoring.ts` (400 LOC)
   - Room evaluation
   - Score calculation
   - Priority ranking
   - Expansion candidates

**Process**:
```typescript
// expansionManager.ts (coordinator)
import { scoreRoom } from './roomScoring';

export class ExpansionManager {
  findExpansionTarget(): RoomName | null {
    const candidates = this.getCandidates();
    const scored = candidates.map(room => ({
      name: room,
      score: scoreRoom(room)
    }));
    return this.selectBest(scored);
  }
}

// roomScoring.ts
export function scoreRoom(roomName: string): number {
  // Scoring logic (400 LOC)
}
```

### Step 4: Verify and Test (2 hours)

For each broken-down file:

1. **Verify functionality**:
   ```bash
   npm run build:empire
   ```

2. **Run tests**:
   ```bash
   npm run test:empire
   ```

3. **Check file sizes**:
   ```bash
   wc -l packages/@ralphschuler/screeps-empire/src/*.ts
   ```

4. **Verify imports**:
   ```bash
   # No broken imports
   npm run build:all
   ```

## Success Criteria

- [ ] All framework files <500 LOC
- [ ] Functionality preserved
- [ ] All tests pass
- [ ] No broken imports
- [ ] Clear module boundaries
- [ ] Good documentation

## Testing

**Build**:
```bash
npm run build:all
```

**Tests**:
```bash
npm run test:all
```

**File Size Verification**:
```bash
# Should show no files >500 LOC
find packages/@ralphschuler -name "*.ts" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -exec wc -l {} \; | \
  awk '$1 > 500 {print $1, $2}'
```

## Dependencies

**Blocked by**:
- #2836 - Empire extraction (can work in parallel)

**Blocks**:
- Phase 4 tasks (cleaner codebase for further extraction)

## Risks

1. **Breaking functionality**
   - Mitigation: Comprehensive testing, incremental changes
   
2. **Unclear module boundaries**
   - Mitigation: Design before coding, review with team
   
3. **Import complexity**
   - Mitigation: Keep import chains shallow, clear dependencies

## Related Issues

- Epic #2845 - Framework Package Maturity Roadmap
- #2836 - Empire extraction
- Phase 3 overall goals

## Benefits

- Easier code review (smaller files)
- Better testability (focused modules)
- Reduced merge conflicts
- Clearer responsibilities
- Better maintainability

---

**Estimated Timeline**: 2 working days  
**Assignee**: TBD  
**Due Date**: 2026-02-22 (end of Phase 3)
```

---

## Checklist for Creating Issues

When creating issues from these templates:

1. **Copy template** to new GitHub issue
2. **Update dates** to current schedule
3. **Assign** to appropriate team member or agent
4. **Link** to epic #2845
5. **Add** appropriate labels
6. **Set** milestone (if using milestones)
7. **Add** to project board (if using projects)

## Labels to Create

Recommended labels for framework roadmap:

- `framework` - All framework-related issues
- `phase-1` through `phase-6` - Phase tracking
- `code-sync` - Code synchronization tasks
- `extraction` - Code extraction tasks
- `modularization` - Breaking down code
- `testing` - Test-related work
- `documentation` - Docs updates
- `publishing` - npm publishing tasks
- `technical-debt` - Debt reduction
- `epic` - Epic/tracking issues

---

**Maintained By**: Strategic Planning / Framework Team  
**Last Updated**: 2026-01-11
