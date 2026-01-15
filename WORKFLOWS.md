# GitHub Actions Workflows

This document provides a comprehensive overview of all GitHub Actions workflows in this repository, their purposes, triggers, and requirements.

**Current Status**: 19 active workflows (added Dependabot auto-merge)

## Table of Contents

- [Continuous Integration (PR Checks)](#continuous-integration-pr-checks)
- [Deployment & Publishing](#deployment--publishing)
- [Automation & Maintenance](#automation--maintenance)
- [Manual Operations](#manual-operations)
- [Workflow Consolidation History](#workflow-consolidation-history)

---

## Continuous Integration (PR Checks)

These workflows run automatically on pull requests to ensure code quality and prevent regressions.

### ci.yml ⭐ NEW - Unified CI Workflow
- **Purpose**: Consolidated CI pipeline for all code quality checks
- **Trigger**: PRs (non-draft), pushes to main/develop
- **Duration**: ~2-3 minutes (parallelized)
- **Required**: ✅ Yes (PR merge blocker)
- **Concurrency**: Cancels stale runs automatically
- **Jobs**:
  - `test-bot`: Main bot tests with coverage (comprehensive test suite)
  - `test-packages`: Matrix testing for 12 framework packages
  - `lint-bot`: ESLint checks on main bot
  - `typecheck-packages`: TypeScript compilation for 11 packages
  - `format-check`: Prettier formatting validation
  - `test-exporters`: Exporter package tests + Docker validation (2 packages)
  - `test-mcp`: MCP server tests with coverage (4 packages)
  - `bundle-size`: Bundle size tracking and reporting

**Consolidates**: Previously separate workflows for test.yml, lint.yml, format.yml, exporter-ci.yml, mcp-ci.yml, bundle-size.yml

### performance-test.yml
- **Purpose**: Performance testing and regression detection
- **Trigger**: PRs (non-draft)/pushes affecting bot code, manual dispatch
- **Duration**: ~30-45 minutes
- **Required**: ⚠️ Optional (long-running)
- **Path Filters**: `packages/screeps-bot/**`, `packages/screeps-server/**`
- **Concurrency**: Cancels stale runs automatically
- **Features**:
  - Server integration tests (15 min)
  - Server performance tests (15 min)
  - Framework package tests (10 min)
  - Bot performance tests (up to 45 min, configurable)
  - Grafana metrics export
  - PR comments with results
  - Baseline updates on main/develop

---

## Deployment & Publishing

These workflows handle deployment and package publishing.

### deploy.yml
- **Purpose**: Deploy bot code to Screeps servers
- **Trigger**: Workflow completion (from successful builds/tests)
- **Duration**: ~1-2 minutes
- **Concurrency**: Prevents simultaneous deployments
- **Environments**: Multiple Screeps servers (official, private, seasonal)
- **Secrets Required**: SCREEPS_TOKEN, SCREEPS_USER, SCREEPS_PASS

### exporter-publish.yml
- **Purpose**: Publish exporter packages to registries
- **Trigger**: Git tags (releases)
- **Duration**: ~2-3 minutes
- **Publishes**: Docker images and npm packages

### publish-framework.yml
- **Purpose**: Publish framework packages to npm
- **Trigger**: Git tags (releases)
- **Duration**: ~2-3 minutes
- **Publishes**: All @ralphschuler/* framework packages

### mcp-docker.yml
- **Purpose**: Build and publish MCP server Docker images
- **Trigger**: Pushes to main
- **Duration**: ~3-5 minutes
- **Publishes**: Docker images for MCP servers

### release.yml
- **Purpose**: Create GitHub releases
- **Trigger**: Pushes to main
- **Duration**: ~1 minute
- **Features**: Automated changelog generation

### post-deployment-monitoring.yml
- **Purpose**: Monitor deployment health
- **Trigger**: After successful deployments
- **Duration**: ~1-2 minutes
- **Monitors**: Bot health, error rates, performance metrics

---

## Automation & Maintenance

These workflows handle automated maintenance tasks.

### auto-todo-issue.yml
- **Purpose**: Convert TODO comments to GitHub issues
- **Trigger**: Pushes to main
- **Duration**: ~1 minute
- **Features**: Parses code for TODO comments and creates issues

### auto-issue-stale.yml
- **Purpose**: Mark and close stale issues
- **Trigger**: Daily schedule (cron)
- **Duration**: ~1 minute
- **Configuration**: 60 days stale, 7 days until close

### auto-merge.yml
- **Purpose**: Auto-merge low-risk PRs with `auto-merge-candidate` label
- **Trigger**: PR labeled with `auto-merge-candidate`
- **Duration**: ~30 seconds
- **Safety**: Requires passing CI checks

### auto-merge-dependabot.yml ⭐ NEW
- **Purpose**: Automated review and merge for Dependabot dependency updates
- **Trigger**: Dependabot PRs (opened, synchronize, reopened), manual dispatch
- **Duration**: ~5-30 minutes (waits for CI checks)
- **Features**:
  - **Risk Classification**: Automatic assessment based on update type and dependency type
    - `risk:low` - Patch updates to dev dependencies → Auto-merge
    - `risk:medium` - Minor updates to dev dependencies → Auto-merge
    - `risk:high` - Major updates or production dependencies → Manual review
  - **Quality Gates**:
    - All CI checks must pass
    - Security audit (`npm audit`) must pass
    - No merge conflicts
  - **Auto-Merge Criteria**:
    - ✅ Patch updates (`1.2.3` → `1.2.4`) to dev dependencies
    - ✅ Minor updates (`1.2.3` → `1.3.0`) to dev dependencies
    - ❌ Major updates (`1.2.3` → `2.0.0`) - requires manual review
    - ❌ Production dependencies - requires manual review
  - **Safety**: Uses Dependabot metadata API, waits for all checks, posts assessment comments

### sync-labels.yml
- **Purpose**: Synchronize GitHub labels
- **Trigger**: Pushes to main
- **Duration**: ~30 seconds
- **Configuration**: Syncs from `.github/labels.yml`

### autonomous-improvement.yml
- **Purpose**: AI-driven code improvements
- **Trigger**: Manual dispatch, scheduled
- **Duration**: Variable (5-30 minutes)
- **Features**: Uses custom agents for automated improvements

### copilot-strategic-planner.yml
- **Purpose**: Strategic planning and analysis
- **Trigger**: Manual dispatch, scheduled
- **Duration**: Variable (5-15 minutes)
- **Features**: Analyzes bot performance and creates improvement issues

### wiki-publish.yml
- **Purpose**: Build and publish documentation wiki
- **Trigger**: Pushes to main (when docs change), manual dispatch
- **Duration**: ~2-3 minutes
- **Path Filters**: `docs/**`, `packages/*/docs/**`, `scripts/build-docs.js`
- **Features**: Automatically publishes docs to GitHub wiki when changed

---

## Manual Operations

These workflows are triggered manually for specific operations.

### manual-ops.yml ⭐ NEW - Unified Manual Operations
- **Purpose**: Consolidated manual operations workflow
- **Trigger**: Manual dispatch with operation selector
- **Duration**: Variable (1-5 minutes)
- **Operations**:
  - `respawn-bot`: Manual bot respawn (all or specific environment)
  - `check-bot-status`: Check bot status across environments (placeholder)

### respawn.yml
- **Purpose**: Check and respawn bot on death (automated)
- **Trigger**: Scheduled (every 6 hours), manual dispatch, post-deployment
- **Duration**: ~1 minute
- **Environments**: Matrix across 6 Screeps servers
- **Features**: Automatic respawn detection and execution

### copilot-setup-steps.yml
- **Purpose**: Setup environment for GitHub Copilot agents
- **Trigger**: Manual dispatch, workflow file changes
- **Duration**: ~1 minute
- **Required**: ✅ Yes (for Copilot agent workflows)
- **Features**: Prepares Node.js environment and dependencies

---

## Workflow Consolidation History

### Removed Workflows (Consolidated into ci.yml)
- ❌ `test.yml` → Now: `ci.yml` (test-bot, test-packages jobs)
- ❌ `lint.yml` → Now: `ci.yml` (lint-bot, typecheck-packages jobs)
- ❌ `format.yml` → Now: `ci.yml` (format-check job)
- ❌ `exporter-ci.yml` → Now: `ci.yml` (test-exporters job)
- ❌ `mcp-ci.yml` → Now: `ci.yml` (test-mcp job)
- ❌ `bundle-size.yml` → Now: `ci.yml` (bundle-size job)

### Removed Workflows (Disabled)
- ❌ `ci-error-issue.yml.disabled` → Removed (was added as disabled, redundant functionality)

---

## Disabled Workflows

**None** - All disabled workflows have been removed.

---

## Workflow Statistics

### Active Workflows
- **Total**: 19 active workflows (includes new Dependabot auto-merge)
- **PR Checks**: 2 workflows (ci, performance-test)
- **Deployment**: 6 workflows (deploy, exporter-publish, publish-framework, mcp-docker, release, post-deployment-monitoring)
- **Automation**: 8 workflows (auto-todo-issue, auto-issue-stale, auto-merge, auto-merge-dependabot, sync-labels, autonomous-improvement, copilot-strategic-planner, wiki-publish)
- **Manual**: 3 workflows (manual-ops, respawn, copilot-setup-steps)

### Estimated Usage (Weekly)
- **PR workflows**: ~20 runs/week (2 workflows × ~10 PRs) - **71% reduction** from 70
- **Scheduled workflows**: ~14 runs/week (2 workflows × 7 days)
- **Push workflows**: ~25 runs/week (5 workflows × ~5 pushes) - includes wiki-publish
- **Manual workflows**: ~5 runs/week (ad-hoc)
- **Total**: ~64 workflow runs/week - **41% reduction** from 109

### Benefits Achieved
- ✅ **Single CI status**: Check 1 workflow instead of 7 for PR status
- ✅ **Faster feedback**: Parallel job execution in unified workflow
- ✅ **Reduced complexity**: 18% fewer workflows to maintain
- ✅ **Better resource usage**: Concurrency controls prevent duplicate runs
- ✅ **Automated docs**: Wiki publishes automatically when docs change
- ✅ **Clear organization**: Grouped by purpose (CI, deployment, automation, manual)

---

## Consolidation Opportunities

### Completed ✅
1. ✅ **Merged PR CI workflows** into single `ci.yml`:
   - test.yml, lint.yml, format.yml, exporter-ci.yml, mcp-ci.yml, bundle-size.yml
   - Benefit: Single workflow status, faster feedback, 6 fewer workflows

2. ✅ **Preserved automatic wiki publishing**:
   - wiki-publish.yml remains as automated workflow (triggers on docs changes)
   - Benefit: Automatic documentation updates, no manual intervention needed

3. ✅ **Consolidated truly manual operations**:
   - Created manual-ops.yml for respawn-bot and check-bot-status
   - Benefit: Unified interface for manual operations

4. ✅ **Removed disabled workflows**:
   - ci-error-issue.yml.disabled
   - Benefit: Reduced confusion

5. ✅ **Added optimizations**:
   - Concurrency controls on ci.yml, performance-test.yml, deploy.yml
   - Skip draft PRs automatically
   - Path filters maintained

### Future Opportunities
1. **Consider further consolidation**:
   - Could move performance-test.yml into ci.yml as optional job
   - Could create unified publishing workflow (exporter-publish, publish-framework, mcp-docker)

2. **Monitor and optimize**:
   - Track workflow durations and success rates
   - Identify opportunities for caching improvements
   - Consider reusable workflows for common patterns

---

## Best Practices

### Workflow Optimization
- ✅ Use path filters to skip unnecessary runs
- ✅ Use concurrency controls to cancel stale runs
- ✅ Use matrix strategies for parallel execution
- ✅ Cache dependencies aggressively
- ✅ Set appropriate timeouts
- ✅ Use `continue-on-error` judiciously

### Security
- ✅ Use minimal permissions (`contents: read` by default)
- ✅ Use environments for sensitive operations
- ✅ Store secrets in GitHub Secrets, not in code
- ✅ Use `secrets.GITHUB_TOKEN` over PATs when possible

### Maintainability
- ✅ Document workflow purpose and triggers
- ✅ Use consistent naming conventions
- ✅ Keep workflows focused on single responsibilities
- ✅ Use reusable workflows for common patterns
- ✅ Monitor workflow success rates and durations

---

## Related Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Repository ROADMAP.md](/ROADMAP.md)
- [Repository AGENTS.md](/AGENTS.md)
- [Contributing Guidelines](/CONTRIBUTING.md)

---

*Last Updated: 2026-01-09 - Post-consolidation (22 → 18 workflows)*
