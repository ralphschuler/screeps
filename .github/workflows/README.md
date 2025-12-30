# GitHub Actions Workflows

This directory contains all GitHub Actions workflows for the Screeps repository.

## CI/CD Workflows

### Core CI Workflows

- **`test.yml`** - Runs unit and integration tests with coverage reporting
- **`lint.yml`** - Runs ESLint to check code quality
- **`format.yml`** - Validates code formatting with Prettier
- **`mcp-ci.yml`** - CI for MCP (Model Context Protocol) packages
- **`exporter-ci.yml`** - CI for Screeps exporter packages
- **`performance-test.yml`** - Runs performance benchmarks

### Deployment Workflows

- **`deploy.yml`** - Deploys the bot to Screeps servers
- **`publish-framework.yml`** - Publishes framework packages to npm
- **`exporter-publish.yml`** - Publishes exporter Docker images
- **`mcp-docker.yml`** - Builds and publishes MCP Docker images
- **`release.yml`** - Creates releases and changelogs

### Automation Workflows

- **`ci-error-issue.yml`** - Automatically creates issues for CI failures (see below)
- **`auto-todo-issue.yml`** - Converts TODO comments into GitHub issues
- **`auto-issue-stale.yml`** - Manages stale issues
- **`sync-labels.yml`** - Synchronizes repository labels

### Maintenance Workflows

- **`respawn.yml`** - Handles bot respawn operations
- **`wiki-publish.yml`** - Publishes documentation to wiki
- **`copilot-setup-steps.yml`** - Setup for GitHub Copilot
- **`copilot-strategic-planner.yml`** - Strategic planning automation

## CI Error Issue Creator

The `ci-error-issue.yml` workflow automatically creates GitHub issues when CI workflows fail.

### How It Works

1. **Trigger**: Runs when any monitored CI workflow completes with a failure status
2. **Log Analysis**: Downloads and parses logs from failed jobs
3. **Error Extraction**: Identifies error messages using common patterns:
   - Lines containing "error:"
   - Lines containing "fail" (excluding false positives)
   - Lines with error symbols (×, ✗, ❌)
4. **Deduplication**: Checks for existing open issues with the same error message
5. **Issue Creation**: Creates new issues only for unique errors

### Monitored Workflows

- Tests
- Lint
- Formatting
- MCP CI
- Screeps Exporter CI
- Performance Tests

### Issue Format

Each created issue includes:
- **Title**: `CI Error in [Workflow Name]: [Error Message]` (truncated to 100 chars)
- **Labels**: `bug`, `ci`, `automated`
- **Body**: Contains:
  - Workflow name
  - Link to failed workflow run
  - Full error details in code block
  - Action required note

### Duplicate Prevention

The workflow uses exact title matching to prevent duplicate issues:
- Before creating an issue, it searches for open issues with the same title
- Only creates a new issue if no matching open issue exists
- Multiple failures with the same error will not create multiple issues

### Example Issue

```markdown
## CI Workflow Failed

**Workflow:** Tests
**Run:** [View failed run](https://github.com/ralphschuler/screeps/actions/runs/12345)

### Error Details

```
Error: Cannot find module '@ralphschuler/screeps-kernel'
```

### Action Required

Please investigate and fix this CI failure.

---
*This issue was automatically created by the CI Error Issue Creator workflow.*
```

### Customization

To add more workflows to monitor, edit the `workflow_run.workflows` section in `ci-error-issue.yml`:

```yaml
on:
  workflow_run:
    workflows:
      - "Tests"
      - "Lint"
      - "Your New Workflow Name"  # Add here
    types:
      - completed
```

### Permissions Required

The workflow requires:
- `issues: write` - To create issues
- `actions: read` - To read workflow run data and logs

### Rate Limiting

The workflow includes a 2-second delay between issue creations to avoid GitHub API rate limiting.
