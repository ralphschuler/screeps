# Code Quality Metrics Baseline

**Generated**: 2026-01-16

## Overview

This document establishes the baseline code quality metrics for the Screeps repository. These metrics are used to track quality trends over time and prevent quality degradation.

## 📊 Current Metrics (Baseline)

### Code Duplication

**Analysis Date**: 2026-01-16  
**Tool**: jscpd v4.0.8  
**Configuration**: `.jscpd.json`

| Metric | TypeScript | JavaScript | Total |
|--------|-----------|------------|-------|
| Files Analyzed | 452 | 22 | 474 |
| Total Lines | 100,621 | 4,888 | 105,509 |
| Total Tokens | 720,926 | 40,624 | 761,550 |
| Clones Found | 268 | 10 | 278 |
| Duplicated Lines | 19,723 (19.6%) | 163 (3.33%) | 19,886 (18.85%) |
| Duplicated Tokens | 151,906 (21.07%) | 1,403 (3.45%) | 153,309 (20.13%) |

**Status**: ⚠️ **HIGH** - Duplication at 18.85% is well above the 5% threshold

**Key Findings**:
- **278 code clones detected** across the codebase
- TypeScript has significantly higher duplication (19.6%) than JavaScript (3.33%)
- Most duplication is in:
  - MCP server implementations (similar patterns across 4 servers)
  - Exporter implementations (graphite vs loki)
  - Chemistry/Lab types (framework vs main bot)
  - Performance testing scripts

**High-Duplication Areas**:
1. **MCP Servers** (`packages/screeps-*-mcp/src/server.ts`): 56-339 token clones
   - Similar initialization and error handling patterns
   - Opportunity for shared base server class
   
2. **Exporters** (`packages/screeps-*-exporter/src/*`): 89-350 token clones
   - Graphite and Loki exporters share significant code
   - Config, API, and console listener code nearly identical
   
3. **Lab/Chemistry** (`packages/screeps-chemistry/src/types.ts` vs `packages/screeps-bot/src/labs/*`): 120-212 token clones
   - Type definitions duplicated between framework and main bot
   - Should use shared types from framework package
   
4. **Performance Scripts** (`packages/screeps-bot/scripts/*`): Multiple 81-396 token clones
   - Scripts share common functionality for memory parsing and analysis
   - Opportunity for shared utility functions

### Code Complexity

**Analysis Date**: 2026-01-16  
**Tool**: Custom complexity analyzer  
**Script**: `scripts/analyze-complexity.js`

| Metric | Value |
|--------|-------|
| Total Files Analyzed | 470 |
| Total Lines of Code | 112,148 |
| Average Lines per File | 239 |
| Files over 300 lines | 143 (30%) |
| Largest File | 1,690 lines |

**Status**: ⚠️ **MODERATE** - 30% of files exceed recommended 300-line limit

**Largest Files (Top 20)**:
1. `packages/@ralphschuler/screeps-stats/src/unifiedStats.ts` - **1,690 lines**
2. `packages/@ralphschuler/screeps-kernel/src/kernel.ts` - **1,470 lines**
3. `packages/@ralphschuler/screeps-intershard/src/shardManager.ts` - **1,181 lines**
4. `packages/screeps-mcp/src/screeps/client.ts` - **1,161 lines**
5. `packages/@ralphschuler/screeps-console/src/consoleCommands.ts` - **1,122 lines**
6. `packages/screeps-economy/src/market/marketManager.ts` - **1,121 lines**
7. `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts` - **1,061 lines**
8. `packages/screeps-bot/src/empire/empireManager.ts` - **966 lines**
9. `packages/screeps-mcp/src/handlers/tools.ts` - **950 lines**
10. `packages/@ralphschuler/screeps-core/src/events.ts` - **936 lines**

**Recommendations**:
- Files over 500 lines should be considered for refactoring
- Files over 1,000 lines are high priority for modularization
- Target: Reduce average file size to < 200 lines over time

### Test Coverage

**Source**: TEST_STATUS.md (2026-01-16)  
**Tool**: c8 coverage tool

| Package | Coverage |
|---------|----------|
| Main Bot | 54.66% |
| Framework Packages | Varies by package |

**Status**: ⚠️ **BELOW TARGET** - Coverage is below the 55% threshold

**Note**: Test coverage improvements are tracked separately in TEST_STATUS.md

### Build Health

**Status**: ✅ **HEALTHY**  
**Last Verified**: 2026-01-16

- All packages compile successfully with TypeScript strict mode
- No blocking TypeScript errors
- All framework packages build without errors
- Main bot builds and deploys successfully

## 🎯 Quality Thresholds

### Established Thresholds

| Metric | Target | Warning | Error | Current |
|--------|--------|---------|-------|---------|
| Code Duplication | < 5% | > 5% | > 10% | **18.85%** ❌ |
| File Size (lines) | < 300 | > 300 | > 500 | 30% over 300 ⚠️ |
| Test Coverage | > 55% | < 55% | < 50% | **54.66%** ⚠️ |
| TypeScript Build | 100% | < 100% | Fails | **100%** ✅ |

### Future Thresholds (Not Yet Implemented)

These thresholds will be implemented in future quality gate work:

| Metric | Target | Warning | Error |
|--------|--------|---------|-------|
| Cyclomatic Complexity (per function) | < 10 | > 15 | > 25 |
| Function Length | < 50 lines | > 50 lines | > 100 lines |
| Bundle Size Growth | 0% | > 5% | > 10% |
| Breaking Changes | Declared | Undeclared | N/A |

## 📈 Quality Improvement Roadmap

### Immediate Actions (Phase 1-3)

1. **Set up automated duplication tracking**
   - ✅ Configure jscpd with 5% threshold
   - ⏳ Add duplication checks to CI
   - ⏳ Create GitHub issues for high-duplication areas

2. **Implement linting across all packages**
   - ⏳ Extend ESLint to framework packages
   - ⏳ Fix critical lint errors
   - ⏳ Add lint checks to CI for all packages

3. **Track complexity trends**
   - ✅ Establish baseline metrics
   - ⏳ Add complexity checks to CI
   - ⏳ Alert on files exceeding thresholds

### Medium-Term Goals (Phase 4-5)

4. **PR Quality Automation**
   - Install Danger.js for automated PR checks
   - Enforce coverage delta requirements
   - Block duplication increases
   - Validate commit message format

5. **Developer Experience**
   - Add pre-commit hooks (Husky)
   - Auto-fix lint errors on commit
   - Validate commit messages
   - Run tests before push

### Long-Term Improvements

6. **Reduce Duplication**
   - Target: < 10% by Q1 2026
   - Target: < 5% by Q2 2026
   - Consolidate MCP server base classes
   - Share exporter common code
   - Use framework packages in main bot

7. **File Size Reduction**
   - Target: < 20% files over 300 lines by Q1 2026
   - Target: < 10% files over 300 lines by Q2 2026
   - Refactor kernel.ts (1,470 → < 500 lines)
   - Split unifiedStats.ts into modules
   - Modularize large manager files

8. **Test Coverage Increase**
   - Target: > 60% by Q1 2026
   - Target: > 70% by Q2 2026
   - Focus on critical paths first
   - Add integration tests

## 🔗 Related Documentation

- **QUALITY_GATES.md** - Quality gate implementation details
- **TEST_STATUS.md** - Test coverage tracking
- **CLEANUP_SUMMARY.md** - Previous cleanup efforts
- **.jscpd.json** - Duplication detection configuration
- **scripts/analyze-complexity.js** - Complexity analysis script

## 📊 Report Locations

- **Duplication Report**: `reports/duplication/jscpd-report.json`
- **Complexity Report**: `reports/complexity-baseline.json`
- **HTML Report**: `reports/duplication/html/index.html`

## 🔄 Update Schedule

This document should be updated:

1. **Monthly**: Review metrics and trends
2. **After major refactors**: Re-baseline metrics
3. **Quarterly**: Set new quality targets
4. **Before releases**: Verify quality thresholds met

## 📝 Notes

- These are **baseline** metrics taken before implementing quality gates
- Current high duplication and file sizes are **expected** and represent opportunity for improvement
- Quality gates will prevent regression from these baselines
- Improvements will be tracked in subsequent updates to this document
- All automated checks are currently in **tracking mode** (non-blocking) until baseline improvements are made

---

**Last Updated**: 2026-01-16  
**Next Review**: 2026-02-16  
**Status**: ✅ Baseline Established
