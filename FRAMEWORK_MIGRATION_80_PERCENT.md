# Framework Migration to 80% Adoption - Status and Roadmap

**Date**: January 10, 2026
**Current Adoption**: 52% (56,397 LOC in framework / 108,367 LOC total)
**Target Adoption**: 80%
**Issue**: [#2788](https://github.com/ralphschuler/screeps/issues/2788)

## Executive Summary

The repository has **already achieved 52% framework adoption**, significantly exceeding the original 20% goal stated in historical documentation. However, the issue targets 80% adoption, requiring an additional 28 percentage points of migration.

### Key Findings

1. **Outdated Metrics**: The issue description was based on outdated MODULARIZATION_SUMMARY.md showing 22% adoption. Actual audit reveals 52% adoption.

2. **Extensive Package Ecosystem**: 26 packages exist (15 @ralphschuler, 7 game logic, 4 infrastructure), containing 56,397 LOC.

3. **All Packages Building**: 100% build success rate across framework packages (console and layouts issues fixed).

4. **New Package Created**: @ralphschuler/screeps-standards (SS2 protocol, 548 LOC) added during this PR.

## Current State Breakdown

### Framework Packages (56,397 LOC - 52%)

**@ralphschuler Scoped Packages (39,159 LOC)**:
- screeps-roles: 9,456 LOC - Creep behaviors
- screeps-cache: 4,021 LOC - Caching system
- screeps-clusters: 3,572 LOC - Cluster management
- screeps-kernel: 3,564 LOC - Process scheduler
- screeps-stats: 3,553 LOC - Statistics collection
- screeps-layouts: 2,961 LOC - Room layouts  
- screeps-visuals: 2,614 LOC - Visualization
- screeps-intershard: 2,204 LOC - Multi-shard coordination
- screeps-core: 2,021 LOC - Core utilities
- screeps-console: 1,893 LOC - Console commands
- screeps-empire: 1,254 LOC - Empire management (skeleton)
- screeps-remote-mining: 787 LOC - Remote mining
- screeps-pathfinding: 711 LOC - Pathfinding
- screeps-standards: 548 LOC - SS2 protocol ✨ NEW

**Game Logic Packages (17,238 LOC)**:
- screeps-utils: 4,513 LOC - Utilities
- screeps-defense: 3,772 LOC - Defense systems
- screeps-economy: 3,166 LOC - Resource management
- screeps-chemistry: 2,406 LOC - Labs and reactions
- screeps-tasks: 1,466 LOC - Task management
- screeps-spawn: 1,217 LOC - Spawning
- screeps-posis: 698 LOC - POSIS architecture

### Monolith (51,970 LOC - 48%)

**Known Subsystems in Monolith**:
- Empire management: ~9,000 LOC (empireManager, nukeManager, expansionManager, etc.)
- Economy coordination: ~6,000 LOC (terminal management, resource flow, link coordination)
- Spawning logic: ~3,500 LOC (spawn coordination, needs analysis, priority)
- Labs & chemistry: ~2,500 LOC (lab management, boost management)
- Standards (migrated): ~500 LOC → Now in @ralphschuler/screeps-standards ✅
- Other systems: ~30,470 LOC (roles, behaviors, core logic, adapters, memory, etc.)

## Gap Analysis: 52% → 80%

**Required Migration**: 28 percentage points = ~30,370 LOC

To reach 80% adoption (86,694 LOC in framework packages):
- Move 30,370 LOC from monolith to framework
- Final state: 86,694 LOC framework / 21,673 LOC monolith

### Migration Complexity

**Challenge**: Much monolith code may be **duplicates or outdated versions** of framework package code.

**Evidence of Duplication**:
1. Framework packages already have extensive implementations (e.g., roles: 9,456 LOC)
2. Some packages (empire, economy) have "skeleton" or partial implementations
3. FRAMEWORK_ADOPTION_NEXT_STEPS.md documents 23 files with divergence between monolith and framework

**Implication**: The path to 80% is likely **code synchronization and deduplication**, not pure extraction.

## Path to 80% Adoption

### Option A: Code Synchronization (RECOMMENDED)

**Effort**: 40-60 hours
**Approach**: Update framework packages with latest monolith code, then integrate

**Steps**:
1. **Audit Phase (8-12 hours)**:
   - Compare each monolith file with corresponding framework package file
   - Identify which version is newer/better
   - Document differences in a spreadsheet

2. **Synchronization Phase (16-24 hours)**:
   - Copy latest monolith code to framework packages
   - Fix imports to use framework dependencies
   - Create stub interfaces for missing dependencies
   - Test each package independently

3. **Integration Phase (12-16 hours)**:
   - Update monolith imports to use framework packages
   - Remove duplicate code from monolith
   - Verify bot functionality
   - Measure new LOC distribution

4. **Validation Phase (4-8 hours)**:
   - Run full test suite
   - Deploy to test server
   - Monitor performance
   - Document final metrics

### Option B: Pure Extraction

**Effort**: 80-120 hours
**Approach**: Extract all remaining unique monolith code to packages

**Not Recommended Because**:
- High duplication means wasted effort
- Unclear which version of code is canonical
- Risk of regression from outdated code
- Doesn't address code divergence problem

### Option C: Hybrid Approach

**Effort**: 50-80 hours
**Approach**: Synchronize existing packages + extract truly unique systems

**Steps**:
1. Synchronize existing framework packages (20-30 hours)
2. Extract unique empire management code (10-15 hours)
3. Extract unique economy coordination code (10-15 hours)
4. Integrate and test (10-20 hours)

## Recommended Next Steps

### Immediate (This PR)
- [x] Create @ralphschuler/screeps-standards package
- [x] Fix console and layouts compilation errors
- [x] Update documentation with accurate metrics
- [x] Document path to 80% adoption

### Short Term (1-2 weeks)
- [ ] **Code Divergence Audit**: Document all differences between monolith and framework packages
- [ ] **Decide Canonical Source**: For each subsystem, decide which version (monolith or framework) is authoritative
- [ ] **Create Sync Plan**: Detailed plan for synchronizing each package

### Medium Term (3-4 weeks)
- [ ] **Synchronize Roles Package**: Update with latest monolith behaviors
- [ ] **Synchronize Economy Package**: Update with latest terminal/link management
- [ ] **Synchronize Spawn Package**: Update with latest coordination logic
- [ ] **Synchronize Chemistry Package**: Update with latest lab management

### Long Term (5-8 weeks)
- [ ] **Complete Empire Package**: Migrate from skeleton to full implementation
- [ ] **Integrate Framework**: Update monolith to import from packages
- [ ] **Remove Duplicates**: Delete synchronized code from monolith
- [ ] **Verify 80% Adoption**: Measure final LOC distribution

## Success Metrics

### Quantitative
- Framework adoption: 52% → 80% (target)
- Monolith size: 51,970 LOC → ~21,600 LOC (-58%)
- Code duplication: Unknown → 0 files
- Package completeness: 50% → 100%

### Qualitative
- Clear ownership: Framework owns subsystems, monolith integrates
- Easy testing: Framework packages testable independently
- Community value: Published packages enable reuse
- Maintainability: Single source of truth per subsystem

## Risk Assessment

### High Risk
- **Code Regression**: Synchronizing code could introduce bugs
  - **Mitigation**: Comprehensive testing, gradual rollout

- **Breaking Changes**: Framework updates could break monolith
  - **Mitigation**: Keep stable APIs, version packages

### Medium Risk
- **Time Underestimation**: 80% adoption could take 100+ hours
  - **Mitigation**: Phased approach, regular progress updates

- **Dependency Hell**: Circular dependencies between packages
  - **Mitigation**: Careful architecture, stub interfaces

### Low Risk
- **Bundle Size**: Framework imports could increase bundle
  - **Mitigation**: Tree-shaking, selective imports

## Conclusion

The repository is in excellent shape with 52% framework adoption already achieved. The path to 80% is clear but requires significant effort (40-80 hours) focused on:

1. **Code Synchronization**: Merging latest improvements into framework packages
2. **Deduplication**: Removing duplicate code from monolith  
3. **Integration**: Making monolith import from packages

This is primarily a **code organization and refactoring effort**, not a greenfield development project. The infrastructure, patterns, and packages already exist—they just need to be brought up to date and properly integrated.

**Recommended Action**: Start with Code Divergence Audit to understand the actual state of duplication and plan targeted synchronization work.

## Appendix: Package Details

### Fully Functional Packages
- screeps-kernel, screeps-stats, screeps-visuals, screeps-intershard
- screeps-console (fixed ✅), screeps-layouts (fixed ✅)
- screeps-standards (new ✅)
- screeps-spawn, screeps-chemistry, screeps-defense, screeps-economy
- screeps-utils, screeps-tasks, screeps-posis

### Partial/Skeleton Packages
- screeps-empire (1,254 LOC skeleton, needs ~9,000 LOC migration)
- screeps-roles (9,456 LOC but may be outdated compared to monolith)

### Infrastructure Packages (Not Counted in Adoption)
- screeps-mcp, screeps-docs-mcp, screeps-wiki-mcp, screeps-typescript-mcp
- screeps-graphite-exporter, screeps-loki-exporter

---

*This document will be updated as work progresses toward 80% adoption.*
