# GitHub Actions Workflows

This document provides a comprehensive overview of all GitHub Actions workflows in this repository, their purposes, triggers, and requirements.

## Table of Contents

- [Continuous Integration (PR Checks)](#continuous-integration-pr-checks)
- [Deployment & Publishing](#deployment--publishing)
- [Automation & Maintenance](#automation--maintenance)
- [Manual Operations](#manual-operations)
- [Disabled Workflows](#disabled-workflows)

---

## Continuous Integration (PR Checks)

These workflows run automatically on pull requests to ensure code quality and prevent regressions.

### test.yml
- **Purpose**: Run all unit and integration tests
- **Trigger**: PRs, pushes to main
- **Duration**: ~2-3 minutes
- **Required**: ✅ Yes (PR merge blocker)
- **Jobs**:
  - `test-bot`: Main bot tests with coverage (2,211+ tests)
  - `test-packages`: Matrix testing for all framework packages (12 packages)
- **Coverage**: Uploads to Codecov for main bot

### lint.yml
- **Purpose**: ESLint and TypeScript compilation checks
- **Trigger**: PRs, pushes to main
- **Duration**: ~1-2 minutes
- **Required**: ✅ Yes (PR merge blocker)
- **Jobs**:
  - `lint-bot`: ESLint checks on main bot code
  - `typecheck-packages`: TypeScript compilation for all packages (11 packages)

### format.yml
- **Purpose**: Code formatting validation with Prettier
- **Trigger**: PRs only
- **Duration**: ~30 seconds
- **Required**: ✅ Yes (PR merge blocker)
- **Checks**: TypeScript, JSON, and config files in bot package

### exporter-ci.yml
- **Purpose**: Test and validate exporter packages
- **Trigger**: PRs/pushes affecting exporter code
- **Duration**: ~1-2 minutes
- **Required**: ✅ Yes (when exporters are modified)
- **Path Filters**: `packages/screeps-graphite-exporter/**`, `packages/screeps-loki-exporter/**`
- **Jobs**:
  - Build TypeScript
  - Validate Docker builds

### mcp-ci.yml
- **Purpose**: Test MCP (Model Context Protocol) servers
- **Trigger**: PRs/pushes affecting MCP code
- **Duration**: ~1-2 minutes
- **Required**: ✅ Yes (when MCP servers are modified)
- **Path Filters**: `packages/screeps-*-mcp/**`
- **Jobs**: Matrix testing for 4 MCP servers with coverage

### bundle-size.yml
- **Purpose**: Track and report bundle sizes
- **Trigger**: PRs, pushes to main
- **Duration**: ~2-3 minutes
- **Required**: ⚠️ Optional (informational)
- **Reports**: Bundle sizes for 12 packages + main bot

### performance-test.yml
- **Purpose**: Performance testing and regression detection
- **Trigger**: PRs/pushes affecting bot code, manual dispatch
- **Duration**: ~30-45 minutes
- **Required**: ⚠️ Optional (long-running)
- **Path Filters**: `packages/screeps-bot/**`, `packages/screeps-server/**`
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
- **Purpose**: Auto-merge approved Dependabot PRs
- **Trigger**: PR labels
- **Duration**: ~30 seconds
- **Safety**: Requires passing CI and approvals

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

---

## Manual Operations

These workflows are triggered manually for specific operations.

### respawn.yml
- **Purpose**: Check and respawn bot on death
- **Trigger**: Manual dispatch, scheduled (every 6 hours), post-deployment
- **Duration**: ~1 minute
- **Environments**: Matrix across 6 Screeps servers
- **Features**: Automatic respawn detection and execution

### wiki-publish.yml
- **Purpose**: Build and publish documentation wiki
- **Trigger**: Manual dispatch, pushes affecting docs
- **Duration**: ~2-3 minutes
- **Path Filters**: `docs/**`, `packages/*/docs/**`
- **Features**: Builds docs and pushes to GitHub wiki

### copilot-setup-steps.yml
- **Purpose**: Setup environment for GitHub Copilot agents
- **Trigger**: Manual dispatch, workflow file changes
- **Duration**: ~1 minute
- **Required**: ✅ Yes (for Copilot agent workflows)
- **Features**: Prepares Node.js environment and dependencies

---

## Disabled Workflows

These workflows are currently disabled and not in use.

### ci-error-issue.yml.disabled
- **Purpose**: Create GitHub issues for CI failures
- **Status**: Disabled (added as disabled in initial commit)
- **Reason**: Functionality may be redundant or replaced by other mechanisms
- **Recommendation**: Remove if not needed

---

## Workflow Statistics

### Active Workflows
- **Total**: 22 active workflows
- **PR Checks**: 7 workflows (test, lint, format, exporter-ci, mcp-ci, bundle-size, performance-test)
- **Deployment**: 6 workflows (deploy, exporter-publish, publish-framework, mcp-docker, release, post-deployment-monitoring)
- **Automation**: 6 workflows (auto-todo-issue, auto-issue-stale, auto-merge, sync-labels, autonomous-improvement, copilot-strategic-planner)
- **Manual**: 3 workflows (respawn, wiki-publish, copilot-setup-steps)

### Estimated Usage (Weekly)
- **PR workflows**: ~70 runs/week (7 workflows × ~10 PRs)
- **Scheduled workflows**: ~14 runs/week (2 workflows × 7 days)
- **Push workflows**: ~20 runs/week (4 workflows × ~5 pushes)
- **Manual workflows**: ~5 runs/week (ad-hoc)
- **Total**: ~109 workflow runs/week

---

## Consolidation Opportunities

### High Priority
1. **Merge PR CI workflows** into single `ci.yml`:
   - test.yml, lint.yml, format.yml → CI jobs
   - Benefit: Single workflow status, faster feedback

2. **Consolidate test workflows**:
   - exporter-ci.yml, mcp-ci.yml → Add to ci.yml as jobs
   - Benefit: Unified testing, shared setup

### Medium Priority
3. **Optimize performance-test.yml**:
   - Add path filters
   - Make more modular
   - Consider separating server tests

4. **Consolidate manual workflows**:
   - wiki-publish.yml → Can be part of docs automation
   - respawn.yml → Already has good automation

### Low Priority
5. **Remove disabled workflows**:
   - ci-error-issue.yml.disabled → Delete if not needed

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

*Last Updated: 2026-01-09*
