# Framework Package Adoption - Next Steps

**Date**: January 8, 2026  
**Related Issue**: #2783 - feat(framework): Increase framework package adoption and migrate remaining monolith code

## Current State (After This PR)

### ✅ Completed

1. **Expanded Framework Package Exports**
   - `@ralphschuler/screeps-roles`: Added comprehensive exports for all behaviors, context, and roles
   - `@ralphschuler/screeps-layouts`: Added comprehensive exports for layout planning, extensions, and roads

2. **Initial Migration**
   - Migrated `SwarmBot.ts` to use `@ralphschuler/screeps-roles` instead of local imports
   - Removed local imports of `clearRoomCaches` and `runPowerRole`

3. **Build Verification**
   - All builds pass ✓
   - Bundle size: 1.07MB (53.7% of 2MB limit) ✓

### ⚠️ Critical Discovery: Code Divergence

**Problem**: Framework packages contain outdated code compared to the monolith.

**Evidence**: 23 files differ between `packages/screeps-bot/src/roles/behaviors` and `packages/@ralphschuler/screeps-roles/src/behaviors`:

```bash
# To see the differences:
cd /path/to/repo
diff -rq packages/screeps-bot/src/roles/behaviors packages/@ralphschuler/screeps-roles/src/behaviors
```

**Files with differences**:
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
- All economy behaviors (builder, harvester, hauler, upgrader, etc.)

**Impact**: This explains why framework package adoption is low (~120 imports vs expected 150+). The framework packages aren't being kept in sync with active development.

## Recommended Next Steps

### Phase 1: Audit Code Divergence (Estimated: 8h)

**Objective**: Understand which version has the latest/best code

**Tasks**:

1. **For each differing file**, compare versions:
   ```bash
   diff packages/screeps-bot/src/roles/behaviors/context.ts \
        packages/@ralphschuler/screeps-roles/src/behaviors/context.ts
   ```

2. **Document findings** in a spreadsheet:
   - File name
   - Monolith LOC
   - Framework LOC
   - Key differences
   - Which version is more recent/complete
   - Which version is being used (check imports)

3. **Categorize differences**:
   - Bug fixes (one version has fixes the other doesn't)
   - New features (functionality added to one version)
   - Refactoring (code organization changes)
   - Dependencies (imports pointing to different locations)

### Phase 2: Synchronize Code (Estimated: 16h)

**Objective**: Make framework packages the canonical source of truth

**Strategy**: Choose one of three approaches:

#### Option A: Framework First (Recommended)

1. **Copy latest monolith code to framework**:
   ```bash
   # For each behavior file
   cp packages/screeps-bot/src/roles/behaviors/*.ts \
      packages/@ralphschuler/screeps-roles/src/behaviors/
   ```

2. **Fix imports** in framework package to use framework dependencies:
   ```typescript
   // Change from monolith imports:
   import { logger } from "../../core/logger";
   
   // To framework imports (or add to framework package):
   import { logger } from "@ralphschuler/screeps-core";
   ```

3. **Test framework package** independently

4. **Update monolith** to import from framework

5. **Delete duplicate monolith code**

#### Option B: Bidirectional Sync

1. **Merge improvements** from both versions
2. **Manual reconciliation** of each file
3. **Higher quality** but more time-consuming

#### Option C: Start Fresh

1. **Create new framework packages** from scratch
2. **Extract only actively used code**
3. **Highest quality** but most time-consuming

### Phase 3: Migrate Monolith Imports (Estimated: 12h)

**Objective**: Replace all local imports with framework package imports

**Process**:

1. **Find files importing from local roles**:
   ```bash
   grep -r "from \"./roles" packages/screeps-bot/src --include="*.ts"
   ```

2. **For each file**, update imports:
   ```typescript
   // Before
   import { createContext } from "./roles/behaviors/context";
   
   // After
   import { createContext } from "@ralphschuler/screeps-roles";
   ```

3. **Test after each file** to catch issues early

4. **Run full build and tests** after all migrations

### Phase 4: Remove Duplicate Code (Estimated: 4h)

**Objective**: Delete monolith code now provided by framework

**Process**:

1. **Verify all imports migrated** (no remaining local imports)

2. **Delete duplicate directories**:
   ```bash
   # After ensuring no references exist:
   rm -rf packages/screeps-bot/src/roles/behaviors
   rm -rf packages/screeps-bot/src/roles/economy
   rm -rf packages/screeps-bot/src/roles/military
   rm -rf packages/screeps-bot/src/roles/utility
   rm -rf packages/screeps-bot/src/roles/power
   ```

3. **Keep only integration/adapter code** in monolith

4. **Update README** documenting new structure

### Phase 5: Establish Sync Process (Estimated: 4h)

**Objective**: Prevent future divergence

**Solutions**:

1. **Development in Framework Packages**:
   - Move all behavior development to framework packages
   - Monolith only imports, doesn't implement

2. **Automated Sync Checks**:
   ```yaml
   # .github/workflows/framework-sync-check.yml
   name: Framework Sync Check
   on: [pull_request]
   jobs:
     check-divergence:
       runs-on: ubuntu-latest
       steps:
         - name: Check for duplicate code
           run: |
             if diff -q packages/screeps-bot/src/roles \
                        packages/@ralphschuler/screeps-roles/src; then
               echo "✅ No divergence detected"
             else
               echo "⚠️  Code divergence detected!"
               exit 1
             fi
   ```

3. **Documentation**:
   - Update CONTRIBUTING.md with framework-first development policy
   - Add framework package development guide

## Success Metrics

### Quantitative Goals

- **Framework imports**: 120 → 150+ (265% increase from baseline 41)
- **Monolith size**: 51K LOC → ~25K LOC (-50%)
- **Code duplication**: 23 files → 0 files
- **Bundle size**: ≤ 1.2MB (maintain current 1.07MB)

### Qualitative Goals

- **Clear ownership**: Framework packages own behaviors, monolith just integrates
- **Easy testing**: Framework packages can be tested independently
- **Community value**: Published packages enable community reuse
- **Maintainability**: Single source of truth for each subsystem

## Timeline Estimate

| Phase | Estimated Hours | Can Parallelize? |
|-------|----------------|------------------|
| Phase 1: Audit | 8h | No |
| Phase 2: Synchronize | 16h | Some files can be done in parallel |
| Phase 3: Migrate Imports | 12h | Yes, per-file basis |
| Phase 4: Remove Duplicates | 4h | No |
| Phase 5: Establish Process | 4h | No |
| **Total** | **44h** | **~5-6 work days with parallelization** |

## Risks and Mitigation

### Risk 1: Breaking Changes

**Risk**: Synchronizing code could introduce bugs

**Mitigation**:
- Comprehensive testing after each file sync
- Keep old code in git history for rollback
- Use feature flags for risky changes

### Risk 2: Import Errors

**Risk**: Circular dependencies or missing exports

**Mitigation**:
- Build after each import migration
- Use TypeScript strict mode to catch issues
- Document all exports clearly

### Risk 3: Performance Regression

**Risk**: Framework packages could be slower than optimized monolith code

**Mitigation**:
- Benchmark before and after
- Monitor bundle size carefully
- Profile CPU usage in-game

## References

- **Issue #2783**: Main issue for framework adoption
- **FRAMEWORK.md**: Framework package documentation
- **CONTRIBUTING_FRAMEWORK.md**: Framework contribution guidelines
- **This PR**: Initial framework export expansion

## Questions to Answer

1. **Who owns framework packages?** Should there be designated maintainers?
2. **Testing requirements?** What's the minimum test coverage for framework packages?
3. **Publishing strategy?** When and how to publish to npm?
4. **Versioning policy?** How to handle breaking changes in framework packages?
5. **Monolith future?** Long-term, should monolith become just an integration layer?

---

*This document will be updated as work progresses. Please edit to reflect actual findings and decisions.*
