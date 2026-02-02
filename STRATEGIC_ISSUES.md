# GitHub Issues to Create

Based on strategic analysis of the Screeps repository, here are 12 comprehensive issues to create for further development:

---

## Issue 1: Establish Test Coverage Baselines and Expand to 75% Overall

**Title**: `test(coverage): establish test coverage baselines and expand to 75% overall`

**Labels**: `type/enhancement`, `priority/high`, `testing`, `automation`, `strategic-planning`

**Body**:

### Strategic Context

Comprehensive test coverage is **critical** for the bot's autonomous development system and long-term reliability. The repository has excellent modularization (16 packages) and test infrastructure, but test coverage needs to be measured, tracked, and expanded systematically.

### Current State

**Test Infrastructure** (✅ Good Foundation):
- Mocha + Chai + Sinon configured
- 136 test files exist across packages
- Coverage reporting configured (`.c8rc.json`)
- Test scripts per package in `package.json`
- Integration test framework available

**Evidence from Code Analysis**:
```bash
# Test files: 136
# Source files: 207
# Test-to-source ratio: 0.66 (good baseline)
```

**Gaps Identified**:
- ❌ No coverage percentage metrics available
- ❌ Coverage not tracked in CI/CD
- ❌ No per-package coverage requirements
- ❌ Some critical paths likely untested (see TODOs)
- ❌ No automated coverage regression detection

### Proposed Solution

#### Phase 1: Measure Baseline Coverage (Week 1)

1. **Run c8 coverage analysis** on all packages
2. **Document current coverage levels** per package
3. **Create coverage workflow** (`.github/workflows/coverage.yml`)
4. **Set up Codecov integration** for reporting
5. **Create threshold checking script** (`scripts/check-coverage-thresholds.js`)

#### Phase 2: Set Coverage Targets (Week 2)

**Per-Package Targets** (based on criticality):

| Package | Target | Priority | Rationale |
|---------|--------|----------|-----------|
| screeps-kernel | 90% | Critical | Core process scheduler, must be bulletproof |
| screeps-cache | 85% | Critical | Performance-critical, complex eviction logic |
| screeps-economy | 80% | High | Complex resource management |
| screeps-spawn | 80% | High | Critical for bot survival |
| screeps-defense | 80% | High | Security and combat |
| screeps-roles | 75% | High | Behavior composition |
| screeps-pathfinding | 75% | High | Performance-critical |
| Others | 70% | Medium | Support packages |

#### Phase 3: Implement Coverage Gates (Week 3)

- ✅ Coverage workflow runs on all PRs
- ✅ Threshold script enforces minimums
- ✅ Coverage reports on Codecov
- ✅ No PRs merged with regression

#### Phase 4: Expand Coverage (Weeks 4-12)

**Priority Test Cases** (from TODOs):
- **screeps-kernel**: Child process lifecycle, adaptive budgets
- **screeps-cache**: LRU eviction, cache coherence
- **screeps-economy**: Link routing, terminal Dijkstra
- **screeps-roles**: Priority task assignment, behavior composition

### Expected Impact

- **Coverage Target**: 75% overall, 85%+ critical packages
- **Quality**: Catch edge cases before production
- **Confidence**: Safe refactoring and autonomous development
- **Documentation**: Tests serve as usage examples

### Acceptance Criteria

- [ ] Coverage workflow runs on all PRs
- [ ] Baselines established for all 16 packages
- [ ] Threshold script enforces minimum coverage
- [ ] Coverage reports available on Codecov
- [ ] Critical packages (kernel, cache, spawn, economy) at 80%+
- [ ] No PRs merged with coverage regression
- [ ] Coverage badges in package READMEs
- [ ] Test patterns documented in CONTRIBUTING.md

### References

- [ROADMAP.md](../../ROADMAP.md) - Swarm architecture
- [Performance Baselines](../../performance-baselines/strategic/) - Baseline system
- [Strategic Analysis](../../performance-baselines/strategic/analysis-2026-02-02.md)

---

## Issue 2: Complete Framework Package Publishing Roadmap

**Title**: `feat(framework): complete package publishing roadmap with stable versions and migration guides`

**Labels**: `type/feature`, `priority/high`, `framework`, `documentation`, `strategic-planning`

**Body**:

### Strategic Context

The repository has **16 well-modularized packages** under `@ralphschuler` namespace, forming a comprehensive Screeps framework. However, publishing status is unclear, most packages are at version 0.1.0, and migration guides are missing. Completing the publishing roadmap will unlock external adoption and community contributions.

### Current State

**Framework Packages** (✅ Well-Structured):
- 16 packages with clear responsibilities
- Published under `@ralphschuler` scope
- npm publishing workflow exists (`publish-framework.yml`)
- FRAMEWORK.md documentation available
- All packages have README.md

**Evidence from Analysis**:
```bash
# All packages currently at 0.1.0 (beta status)
@ralphschuler/screeps-kernel: 0.1.0
@ralphschuler/screeps-cache: 0.1.0
@ralphschuler/screeps-economy: 0.1.0
# ... (13 more packages)
```

**Gaps Identified**:
- ❌ No packages at stable 1.0.0+ versions
- ❌ Publishing status unclear (which are published to npm?)
- ❌ No migration guides for version upgrades
- ❌ No deprecation policy
- ❌ Limited example projects
- ❌ No versioning strategy documented

### Proposed Solution

#### Phase 1: API Stabilization (Month 1)

**For each package, review and stabilize APIs**:

1. **Document public API surface**
   - Identify all exported functions/classes
   - Mark internal APIs with `@internal`
   - Document breaking vs. non-breaking changes

2. **Review for breaking changes**
   - Check TODO comments for planned API changes
   - Consolidate breaking changes before 1.0
   - Create migration path for users

3. **Establish semantic versioning policy**
   ```
   Major (1.0.0): Breaking API changes
   Minor (0.X.0): New features, backward compatible
   Patch (0.0.X): Bug fixes, no API changes
   ```

#### Phase 2: Publishing Strategy (Month 2)

**Priority Packages for 1.0 Release**:

| Package | 1.0 Readiness | Blockers | Target |
|---------|---------------|----------|--------|
| screeps-cache | High | None | Month 1 |
| screeps-kernel | High | None | Month 1 |
| screeps-spawn | Medium | API review | Month 2 |
| screeps-economy | Medium | Examples needed | Month 2 |
| screeps-roles | Medium | Documentation | Month 3 |
| Others | Low | Depends on core | Month 4+ |

**Publishing Checklist per Package**:
- [ ] API stabilized and documented
- [ ] Test coverage ≥75%
- [ ] README with quickstart example
- [ ] CHANGELOG.md created
- [ ] Migration guide (if upgrading from 0.x)
- [ ] Version bumped to 1.0.0
- [ ] Published to npm
- [ ] Release notes created

#### Phase 3: Migration Guides (Month 2-3)

**Create migration documentation**:

1. **`docs/migration/v0-to-v1.md`** - Major version upgrade guide
2. **Per-package migration** - Package-specific breaking changes
3. **Deprecation notices** - What's being removed and why
4. **Upgrade tools** - Scripts to help migration (if needed)

**Example Migration Guide Structure**:
```markdown
# Migrating from v0.x to v1.0

## Breaking Changes

### @ralphschuler/screeps-kernel

**Before (v0.x)**:
```typescript
kernel.registerProcess({ id: 'test', execute: () => {} });
```

**After (v1.0)**:
```typescript
kernel.registerProcess({ 
  id: 'test', 
  priority: ProcessPriority.MEDIUM,  // Now required
  execute: () => {} 
});
```

**Migration**: Add `priority` field to all process registrations.
```

#### Phase 4: Example Projects (Month 3)

**Create comprehensive examples**:

1. **`examples/minimal-bot`** - Bare minimum bot using framework
2. **`examples/economy-bot`** - Focus on resource management
3. **`examples/combat-bot`** - Defense and military
4. **`examples/full-swarm`** - Complete swarm architecture

Each example should:
- Be deployable to Screeps
- Use latest stable framework packages
- Include deployment instructions
- Document key concepts

### Expected Impact

- **External adoption**: Framework usable by community
- **Version stability**: Clear upgrade paths
- **Development velocity**: Faster iteration with stable APIs
- **Community contributions**: More contributors with stable foundation

### Acceptance Criteria

- [ ] All core packages (kernel, cache, spawn, economy) published at 1.0.0+
- [ ] Publishing workflow automated and documented
- [ ] Migration guides created for 0.x → 1.0 transition
- [ ] At least 3 example projects available
- [ ] Versioning strategy documented in CONTRIBUTING.md
- [ ] Deprecation policy defined
- [ ] CHANGELOG.md maintained for each package
- [ ] Release notes created for 1.0 releases

### References

- [FRAMEWORK.md](../../FRAMEWORK.md) - Framework guide
- [Publishing Workflow](../../.github/workflows/publish-framework.yml)
- [Package Structure](../../packages/@ralphschuler/)

---

## Issue 3: Fix Strategic Metrics Collection Pipeline

**Title**: `fix(metrics): restore strategic metrics collection pipeline for automated planning`

**Labels**: `type/bug`, `priority/high`, `infrastructure`, `monitoring`, `strategic-planning`

**Body**:

### Strategic Context

The strategic planning workflow failed to collect live metrics in this run due to `COLLECTED_METRICS_FILE` environment variable not being set or the collection script failing. This blocks:
- Automated performance regression detection
- Data-driven strategic planning
- Historical trend analysis
- Evidence-based issue prioritization

### Current State

**Infrastructure** (✅ Partially Working):
- Strategic planning workflow exists (`.github/workflows/copilot-strategic-planner.yml`)
- Metrics collection script exists (`scripts/collect-strategic-metrics.mjs`)
- MCP servers configured (screeps-mcp, grafana-mcp)
- Performance baselines directory structure ready

**Evidence from This Run**:
```bash
# Environment check showed:
COLLECTED_METRICS_FILE=not-set

# Expected file not found:
performance-baselines/strategic/collected-metrics-${RUN_ID}.json

# Analysis proceeded without live metrics
```

**Gaps Identified**:
- ❌ Metrics collection failed or was skipped
- ❌ No error logging from collection step
- ❌ No fallback strategy for collection failures
- ❌ No validation of collected data
- ❌ No historical baselines to compare against

### Proposed Solution

#### Phase 1: Diagnose Collection Failure

**Investigate why collection failed**:

1. **Check workflow execution logs**
   ```bash
   gh run view ${RUN_ID} --log
   ```

2. **Verify MCP server connectivity**
   - screeps-mcp: Check SCREEPS_TOKEN validity
   - grafana-mcp: Check GRAFANA_SERVICE_ACCOUNT_TOKEN validity
   - Test connectivity manually

3. **Review collection script**
   ```bash
   node scripts/collect-strategic-metrics.mjs "test-output.json"
   ```

4. **Check environment setup**
   - Verify Docker containers can start (screeps-mcp, grafana-mcp)
   - Check network connectivity to Screeps API
   - Validate Grafana endpoint accessibility

#### Phase 2: Fix Collection Script

**Enhance error handling and logging**:

```javascript
// scripts/collect-strategic-metrics.mjs

try {
  console.log('🔍 Starting metrics collection...');
  
  // Validate environment
  if (!process.env.SCREEPS_TOKEN) {
    throw new Error('SCREEPS_TOKEN not set');
  }
  
  // Collect from screeps-mcp
  console.log('📊 Collecting from screeps-mcp...');
  const screepsData = await collectScreepsData();
  
  // Collect from grafana-mcp
  console.log('📈 Collecting from grafana-mcp...');
  const grafanaData = await collectGrafanaData();
  
  // Validate collected data
  validateCollectedData({ screepsData, grafanaData });
  
  // Save to file
  const outputFile = process.argv[2] || 'collected-metrics.json';
  fs.writeFileSync(outputFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    runId: process.env.RUN_ID,
    rawData: { screepsData, grafanaData },
    dataSourcesUsed: {
      screeps_stats: !!screepsData.stats,
      grafana_cpu_metrics: !!grafanaData.cpu
    }
  }, null, 2));
  
  console.log(`✅ Metrics saved to ${outputFile}`);
  process.exit(0);
  
} catch (error) {
  console.error('❌ Metrics collection failed:', error);
  
  // Create empty metrics file to allow planning to proceed
  const fallbackFile = process.argv[2] || 'collected-metrics.json';
  fs.writeFileSync(fallbackFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    runId: process.env.RUN_ID,
    error: error.message,
    rawData: null,
    dataSourcesUsed: {}
  }, null, 2));
  
  console.log(`⚠️ Created fallback metrics file: ${fallbackFile}`);
  process.exit(1);
}
```

#### Phase 3: Enhance Workflow Reliability

**Update `.github/workflows/copilot-strategic-planner.yml`**:

```yaml
- name: Collect live metrics from MCP servers
  id: collect_metrics
  continue-on-error: true  # Don't fail workflow if collection fails
  env:
    SCREEPS_TOKEN: ${{ secrets.COPILOT_MCP_SCREEPS_TOKEN }}
    GRAFANA_SERVICE_ACCOUNT_TOKEN: ${{ secrets.COPILOT_MCP_GRAFANA_SERVICE_ACCOUNT_TOKEN }}
  run: |
    set -euo pipefail
    
    # Validate environment
    if [[ -z "${SCREEPS_TOKEN:-}" ]]; then
      echo "⚠️ SCREEPS_TOKEN not set, collection will fail"
    fi
    
    # Run collection with detailed logging
    node scripts/collect-strategic-metrics.mjs \
      "performance-baselines/strategic/collected-metrics-${{ github.run_id }}.json" \
      --verbose 2>&1 | tee collection.log
    
    # Validate output file
    if [[ -f "performance-baselines/strategic/collected-metrics-${{ github.run_id }}.json" ]]; then
      echo "✅ Metrics collection succeeded"
      echo "METRICS_AVAILABLE=true" >> $GITHUB_OUTPUT
    else
      echo "❌ Metrics collection failed"
      echo "METRICS_AVAILABLE=false" >> $GITHUB_OUTPUT
    fi

- name: Run strategic planning analysis
  env:
    COLLECTED_METRICS_FILE: "performance-baselines/strategic/collected-metrics-${{ github.run_id }}.json"
    METRICS_AVAILABLE: ${{ steps.collect_metrics.outputs.METRICS_AVAILABLE }}
  uses: ./.github/actions/copilot-exec
  with:
    copilot-token: ${{ secrets.COPILOT_TOKEN }}
    prompt-path: .github/agents/strategic-planner.agent.md
```

#### Phase 4: Add Validation and Monitoring

**Create validation script** (`scripts/validate-collected-metrics.js`):

```javascript
// Validates collected metrics have required fields
const requiredFields = {
  'rawData.screeps.stats': 'Screeps stats',
  'rawData.screeps.gameTime': 'Game time',
  'rawData.grafana.cpuQuery': 'CPU metrics'
};

function validateMetrics(metricsFile) {
  const data = JSON.parse(fs.readFileSync(metricsFile));
  
  for (const [path, name] of Object.entries(requiredFields)) {
    if (!getNestedProperty(data, path)) {
      console.warn(`⚠️ Missing ${name} at ${path}`);
    }
  }
}
```

**Add alerting** for collection failures:
- Create GitHub issue automatically when collection fails
- Send notification (if configured)
- Document failure in analysis output

### Expected Impact

- **Reliable metrics**: 95%+ collection success rate
- **Better planning**: Evidence-based strategic decisions
- **Regression detection**: Catch performance degradation early
- **Historical trends**: Track bot improvement over time

### Acceptance Criteria

- [ ] Metrics collection script runs successfully
- [ ] COLLECTED_METRICS_FILE environment variable set correctly
- [ ] Collection failures logged with detailed error messages
- [ ] Fallback strategy allows planning to proceed without metrics
- [ ] Validation script checks data completeness
- [ ] At least one successful metrics collection with live data
- [ ] Documentation updated with troubleshooting guide
- [ ] Historical baselines populated (at least 7 days of data)

### References

- [Metrics Collection Script](../../scripts/collect-strategic-metrics.mjs)
- [Strategic Planning Workflow](../../.github/workflows/copilot-strategic-planner.yml)
- [Performance Baselines README](../../performance-baselines/strategic/README.md)

---

