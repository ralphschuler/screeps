# Autonomous Development System

This document describes the operational autonomous development system that enables continuous, self-directed improvement of the Screeps bot.

## Overview

The autonomous development system implements a complete feedback loop:

```
OBSERVE → ANALYZE → PLAN → IMPLEMENT → VALIDATE → DEPLOY → MONITOR → LEARN
```

This enables the bot to improve itself based on performance data, community best practices, and historical outcomes.

## Architecture

### Three-Phase Implementation

#### Phase 1: Scheduled Strategic Planning & MCP Integration ✅

**Purpose**: Daily analysis of bot performance with real data from MCP servers

**Components**:
- Daily strategic planning workflow (`.github/workflows/copilot-strategic-planner.yml`)
- MCP helper library (`scripts/mcp-helpers/`)
- Performance regression detection
- Weekly summary reports

**How It Works**:
1. Workflow runs daily at midnight UTC
2. Strategic planner agent analyzes:
   - Live bot performance (screeps-mcp)
   - Performance metrics (grafana-mcp)
   - Community strategies (screeps-wiki-mcp)
   - Existing issues and TODOs
3. Creates evidence-based GitHub issues for improvements
4. Detects performance regressions automatically

#### Phase 2: Autonomous PR Creation & Auto-Merge ✅

**Purpose**: Automatically implement low-risk improvements

**Components**:
- Autonomous improvement workflow (`.github/workflows/autonomous-improvement.yml`)
- Autonomous improvement agent (`.github/agents/autonomous-improvement.agent.md`)
- Auto-merge workflow (`.github/workflows/auto-merge.yml`)
- Risk assessment logic

**How It Works**:
1. Weekly autonomous improvement run
2. Agent identifies ONE low-risk improvement opportunity
3. Risk assessment determines if change is safe:
   - Low risk + High confidence = Implement
   - Medium/High risk = Create issue
4. If implemented:
   - All tests must pass
   - PR created automatically
   - Risk label added
5. Auto-merge evaluates:
   - Risk level (from labels)
   - Test results
   - File types changed
   - Size of changes
6. Low-risk PRs with passing tests auto-merge

#### Phase 3: Post-Deployment Monitoring & Learning ✅

**Purpose**: Monitor deployments and learn from outcomes

**Components**:
- Post-deployment monitoring (`.github/workflows/post-deployment-monitoring.yml`)
- Learning database (`.github/autonomous-learning/`)
- Rollback automation
- Decision engine improvements

**How It Works**:
1. After PR merge to main/develop, monitoring starts
2. Captures baseline metrics before deployment
3. Waits for deployment to stabilize (configurable duration)
4. Captures post-deployment metrics
5. Compares metrics:
   - CPU increase > 20% → Automatic rollback
   - CPU increase > 30% → Create incident
6. Records outcome in learning database
7. Future decisions use historical data

## Workflows

### Daily Strategic Planning

**Trigger**: Daily at midnight UTC (cron: `0 0 * * *`)

**Actions**:
1. Query live bot performance
2. Analyze Grafana metrics
3. Search wiki for strategies
4. Review existing issues
5. Create evidence-based improvement issues
6. Detect performance regressions

**Output**: GitHub issues with implementation plans

### Weekly Autonomous Improvement

**Trigger**: Weekly on Monday at 6am UTC (cron: `0 6 * * 1`)

**Actions**:
1. Load learning database
2. Identify improvement opportunity
3. Assess risk and confidence
4. If low-risk + high-confidence:
   - Implement changes
   - Run all tests
   - Create PR
5. Else:
   - Create issue for human review

**Output**: Pull request or GitHub issue

### Auto-Merge Evaluation

**Trigger**: When PR is labeled `auto-merge-candidate`

**Actions**:
1. Get PR details (files, size, type)
2. Assess risk:
   - Critical files? → High risk
   - Large change? → High/Medium risk
   - Docs only? → Low risk
   - Small + tests? → Low risk
3. Add risk label
4. If low-risk:
   - Run full test suite
   - Wait for all checks
   - Auto-merge
5. Else:
   - Require manual review

**Output**: Auto-merged PR or risk assessment comment

### Post-Deployment Monitoring

**Trigger**: When PR merges to main/develop

**Actions**:
1. Capture baseline metrics (from Grafana)
2. Wait for deployment (default: 30 minutes)
3. Capture post-deployment metrics
4. Compare performance:
   - CPU increase > 20% → Create rollback PR
   - CPU increase > 30% → Create incident
5. Record outcome in learning database
6. Add monitoring report to PR

**Output**: Monitoring report, optional rollback PR

## Safety Mechanisms

### Risk Assessment

**Critical Files** (Never Auto-Merge):
- `packages/screeps-bot/src/main.ts`
- `packages/@ralphschuler/screeps-kernel/`
- `packages/@ralphschuler/screeps-stats/`
- `.github/workflows/`
- `package.json`, `package-lock.json`

**Risk Levels**:
- **Low**: Docs only, tests only, small changes with tests (< 50 lines, < 3 files)
- **Medium**: Moderate size (50-200 lines, 3-10 files)
- **High**: Large changes (> 200 lines, > 10 files) or critical files

**Auto-Merge Requirements**:
- ✅ Risk level: Low
- ✅ All tests pass
- ✅ All CI checks pass
- ✅ Label: `auto-merge-candidate`

### Rollback Triggers

**Automatic Rollback** if:
- CPU increase > 20% from baseline
- Error rate > 10 per tick
- Critical metric degradation > 20%

**Incident Creation** if:
- CPU increase > 30% (critical)
- Bot stops functioning
- Rollback PR created

### Learning Database

**Tracks**:
- PR number and timestamp
- Change type and files modified
- Predicted vs actual impact
- Success/failure
- Lessons learned

**Uses**:
- Improve prediction accuracy
- Avoid repeating failures
- Identify high-risk files
- Build confidence in approaches

## MCP Integration

### Available MCP Servers

1. **screeps-mcp**: Live game state, memory, console
2. **screeps-docs-mcp**: Official API documentation
3. **screeps-wiki-mcp**: Community strategies
4. **screeps-typescript-mcp**: Type definitions
5. **grafana-mcp**: Performance monitoring

### Helper Library

Located in `scripts/mcp-helpers/`:

**Modules**:
- `types.ts` - Common type definitions
- `grafana.ts` - Grafana query documentation
- `screeps.ts` - Screeps API documentation
- `wiki.ts` - Wiki search documentation
- `regression.ts` - Performance regression detection ⭐

**Important**: Helper functions are documentation and examples. AI agents should use MCP tools directly.

**Exception**: `regression.ts` contains actual implementations for baseline management.

## Usage Examples

### Check for Performance Regression

```bash
# Check if current metrics show regression
node scripts/check-performance-regression.js main 52.3 78.5

# Output:
# 🟢 Severity: LOW
# No significant regression detected. CPU usage: 4.3% change
```

### Update Performance Baseline

```bash
# Update baseline after successful deployment
node scripts/update-baseline.js main 50.5 75.2 0.012

# Output:
# ✅ Baseline updated successfully
# Baseline saved to: performance-baselines/main.json
```

### Manual Autonomous Improvement

```bash
# Trigger autonomous improvement workflow
gh workflow run autonomous-improvement.yml \
  -f opportunity_type=performance \
  -f confidence_threshold=high
```

### Manual Auto-Merge Evaluation

```bash
# Evaluate specific PR for auto-merge
gh workflow run auto-merge.yml -f pr_number=123
```

## Monitoring & Metrics

### Success Metrics

**Target Performance**:
- Autonomous strategic analysis: Daily ✅
- Autonomous improvements attempted: 1-2 per week
- Success rate of autonomous PRs: > 80% (no rollback needed)
- Time from issue identification to PR: < 24 hours

**Learning Metrics**:
- Prediction accuracy improvement: Measurable over time
- Successful patterns identified: > 10 after 3 months
- Failed patterns avoided: 100% (never repeat same mistake)

**Safety Metrics**:
- Rollbacks triggered appropriately: 100% of regressions
- False positive rollbacks: < 5%
- Never auto-merge critical systems: 100% compliance

### Dashboard Access

Performance metrics available in Grafana:
- CPU & Performance Monitor
- Room Management Dashboard
- Creeps & Roles Monitor
- Alert Rules Dashboard

## Configuration

### Environment Variables

Required for MCP integration:
```bash
SCREEPS_TOKEN=<your-screeps-token>
SCREEPS_HOST=screeps.com
SCREEPS_SHARD=shard3
GRAFANA_SERVICE_ACCOUNT_TOKEN=<your-grafana-token>
```

### Workflow Parameters

**Autonomous Improvement**:
- `opportunity_type`: auto, performance, code-quality, documentation
- `confidence_threshold`: low, medium, high

**Post-Deployment Monitoring**:
- `pr_number`: PR to monitor
- `monitoring_duration`: Duration in minutes (default: 30)

## Troubleshooting

### Issue: Strategic planning creates duplicate issues

**Solution**: Agent should search existing issues before creating new ones
```typescript
const existing = await github-mcp-server-search_issues({
  query: "label:performance optimization"
});
```

### Issue: Auto-merge blocked despite low risk

**Check**:
1. Is PR labeled `auto-merge-candidate`?
2. Did all CI checks pass?
3. Check risk assessment comment on PR

### Issue: Rollback not triggered despite regression

**Verify**:
1. Check post-deployment monitoring workflow logs
2. Verify Grafana token is valid
3. Check baseline exists for branch

## Future Enhancements

- [ ] Improve prediction accuracy with ML
- [ ] Add more sophisticated risk assessment
- [ ] Implement gradual rollout (canary deployments)
- [ ] Add anomaly detection for subtle issues
- [ ] Expand learning database with more metrics
- [ ] Create visualization dashboard for autonomous activity

## References

- [AGENTS.md](../AGENTS.md) - Agent definitions and workflows
- [ROADMAP.md](../ROADMAP.md) - Bot architecture and goals
- [MCP Helpers README](../scripts/mcp-helpers/README.md) - MCP integration guide
- [Learning Database README](../.github/autonomous-learning/README.md) - Learning system details
