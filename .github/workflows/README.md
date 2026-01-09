# GitHub Actions Workflows

This directory contains all GitHub Actions workflows for the Screeps repository.

**Current Status**: 17 active workflows (consolidated from 22 - see [Consolidation Summary](../WORKFLOW_CONSOLIDATION_SUMMARY.md))

For complete documentation, see [WORKFLOWS.md](/WORKFLOWS.md) in the repository root.

## Quick Reference

### CI/CD Workflows

#### Core CI Workflow
- **`ci.yml`** ⭐ **NEW** - Unified CI pipeline (replaces 6 workflows)
  - Runs all tests (bot + 12 packages)
  - Linting and type checking
  - Code formatting validation
  - Exporter tests (2 packages)
  - MCP tests (4 packages)
  - Bundle size reporting
  
#### Performance Testing
- **`performance-test.yml`** - Performance benchmarks and regression detection

### Deployment Workflows

- **`deploy.yml`** - Deploys the bot to Screeps servers
- **`publish-framework.yml`** - Publishes framework packages to npm
- **`exporter-publish.yml`** - Publishes exporter Docker images
- **`mcp-docker.yml`** - Builds and publishes MCP Docker images
- **`release.yml`** - Creates releases and changelogs
- **`post-deployment-monitoring.yml`** - Monitors deployment health

### Automation Workflows

- **`auto-todo-issue.yml`** - Converts TODO comments into GitHub issues
- **`auto-issue-stale.yml`** - Manages stale issues
- **`auto-merge.yml`** - Auto-merges approved Dependabot PRs
- **`sync-labels.yml`** - Synchronizes repository labels
- **`autonomous-improvement.yml`** - AI-driven code improvements
- **`copilot-strategic-planner.yml`** - Strategic planning automation

### Manual Operations

- **`manual-ops.yml`** ⭐ **NEW** - Unified manual operations
  - Respawn bot (manual trigger)
  - Publish wiki
  - Check bot status
  
- **`respawn.yml`** - Automated respawn (scheduled + post-deployment)
- **`copilot-setup-steps.yml`** - Setup for GitHub Copilot agents

## Consolidated Workflows

The following workflows have been **consolidated** to improve maintainability:

### Into `ci.yml`:
- ❌ `test.yml` → ✅ `ci.yml` (test-bot, test-packages jobs)
- ❌ `lint.yml` → ✅ `ci.yml` (lint-bot, typecheck-packages jobs)
- ❌ `format.yml` → ✅ `ci.yml` (format-check job)
- ❌ `exporter-ci.yml` → ✅ `ci.yml` (test-exporters job)
- ❌ `mcp-ci.yml` → ✅ `ci.yml` (test-mcp job)
- ❌ `bundle-size.yml` → ✅ `ci.yml` (bundle-size job)

### Into `manual-ops.yml`:
- ❌ `wiki-publish.yml` → ✅ `manual-ops.yml` (publish-wiki operation)

### Removed:
- ❌ `ci-error-issue.yml.disabled` - Removed (was disabled, redundant functionality)

## Key Features

### Unified CI (`ci.yml`)
- ✅ **Single status check** instead of 7 separate workflows
- ✅ **Parallel job execution** for faster feedback
- ✅ **Concurrency control** cancels stale runs
- ✅ **Skip draft PRs** to save resources
- ✅ **Shared setup** reduces overhead

### Optimizations Applied
- ✅ Concurrency controls on `ci.yml`, `performance-test.yml`, `deploy.yml`
- ✅ Draft PR skipping on `ci.yml` and `performance-test.yml`
- ✅ Path filters to skip unnecessary runs
- ✅ Matrix strategies for parallel execution

## For Developers

### Checking PR Status
**Before**: Check 7 separate workflow statuses
**Now**: Check 1 "Continuous Integration" workflow status

### Running Manual Operations
Use the "Manual Operations" workflow from the Actions tab:
1. Go to Actions → Manual Operations
2. Click "Run workflow"
3. Select operation (respawn-bot, publish-wiki, check-bot-status)
4. Click "Run workflow"

### Making Changes

| Task | Location |
|------|----------|
| Add/update tests | `ci.yml` → test-bot or test-packages job |
| Change linting rules | `ci.yml` → lint-bot job |
| Update formatting | `ci.yml` → format-check job |
| Modify exporter tests | `ci.yml` → test-exporters job |
| Update MCP tests | `ci.yml` → test-mcp job |
| Change bundle size checks | `ci.yml` → bundle-size job |
| Update wiki build | `manual-ops.yml` → publish-wiki operation |

## Documentation

- **[WORKFLOWS.md](/WORKFLOWS.md)** - Complete workflow documentation
- **[WORKFLOW_CONSOLIDATION_SUMMARY.md](../WORKFLOW_CONSOLIDATION_SUMMARY.md)** - Consolidation details and impact analysis
- **[GitHub Actions Docs](https://docs.github.com/en/actions)** - Official documentation

---

*Last Updated: 2026-01-09 - Post-consolidation (22 → 17 workflows)*
