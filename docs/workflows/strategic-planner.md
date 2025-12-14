# Strategic Planner Workflow

## Overview

The Strategic Planner workflow (`copilot-strategic-planner.yml`) is an automated system that uses GitHub Copilot with specialized MCP (Model Context Protocol) servers to:

1. **Analyze** live Screeps bot performance using real-time game data
2. **Monitor** operational metrics through Grafana dashboards
3. **Review** code quality and architecture alignment with ROADMAP.md
4. **Create** evidence-based GitHub issues for strategic improvements

## Required Configuration

### Secrets

The workflow requires three secrets to function properly. **The workflow will fail immediately if any of these are missing.**

#### 1. SCREEPS_TOKEN
- **Purpose**: Authenticate with Screeps API to access live game data
- **How to get**: 
  1. Go to [Screeps Account Settings](https://screeps.com/a/#!/account/auth-tokens)
  2. Create a new API token
  3. Copy the token value
- **Required permissions**: Read access to game data (rooms, creeps, memory, market, etc.)
- **Used by**: `screeps-mcp` server to query live bot state

#### 2. GRAFANA_SERVICE_ACCOUNT_TOKEN
- **Purpose**: Access Grafana monitoring dashboards and query metrics
- **How to get**:
  1. Go to your Grafana instance (e.g., `https://<your-org>.grafana.net`)
  2. Navigate to Administration > Service Accounts
  3. Create a new service account with read permissions
  4. Generate a token for the service account
- **Required permissions**: Read access to dashboards, datasources, and queries
- **Used by**: `grafana-mcp` server to analyze performance trends
- **Note**: The Grafana URL is configured in `.github/mcp/all-servers.json`

#### 3. COPILOT_TOKEN
- **Purpose**: Authenticate with GitHub Copilot API for AI-powered analysis
- **How to get**: Contact your GitHub organization admin or GitHub support
- **Required permissions**: Access to Copilot API endpoints
- **Used by**: `copilot-exec` action to run AI agent

### Adding Secrets to GitHub

1. Go to: `https://github.com/<owner>/<repo>/settings/secrets/actions`
2. Click "New repository secret"
3. Add each secret with the exact names above
4. Save each secret

### Optional Variables

These variables can be configured but have sensible defaults:

- `SCREEPS_HOST`: Screeps server hostname (default: `screeps.com`)
- `SCREEPS_SHARD`: Shard to analyze (default: `shard3`)
- `SCREEPS_DOCS_CACHE_TTL`: Cache TTL for docs (default: `3600` seconds)
- `SCREEPS_WIKI_CACHE_TTL`: Cache TTL for wiki (default: `3600` seconds)
- `SCREEPS_TYPES_CACHE_TTL`: Cache TTL for types (default: `3600` seconds)

## Troubleshooting

### Workflow runs for only 2-3 minutes

**Symptom**: The workflow completes quickly with minimal output (~13KB) instead of running for the expected 30-180 minutes.

**Cause**: Required secrets (SCREEPS_TOKEN and/or GRAFANA_SERVICE_ACCOUNT_TOKEN) are not configured or are empty.

**Solution**: 
1. Check the workflow logs for the "Validate required secrets" step
2. Configure the missing secrets as described above
3. Re-run the workflow

### MCP servers cannot authenticate

**Symptom**: Errors in logs like "unauthorized", "authentication failed", or "cannot connect"

**Cause**: Invalid or expired tokens

**Solution**:
1. Regenerate the tokens from their respective sources
2. Update the GitHub secrets with new values
3. Re-run the workflow

### Agent produces minimal analysis

**Symptom**: The agent completes but creates few or no GitHub issues

**Causes**:
1. Missing authentication tokens (agent cannot access data sources)
2. No actionable improvements found (rare, but possible)
3. Duplicate detection preventing issue creation

**Solution**:
1. First, ensure all secrets are properly configured
2. Check the output log artifact for detailed analysis
3. Review existing GitHub issues to see if similar improvements were already created
4. Enable verbose logging by setting the workflow input `verbose: true`

## How It Works

### Workflow Steps

1. **Checkout**: Clone the repository
2. **Validate Secrets**: Check that all required secrets are configured
3. **Run Strategic Planning**:
   - Set up Node.js and install Copilot CLI
   - Configure MCP servers with authentication
   - Render the strategic planner prompt
   - Execute Copilot agent with access to:
     - GitHub API (create issues, search existing issues)
     - Screeps API (game data, rooms, memory, stats)
     - Grafana API (dashboards, metrics, logs)
     - Playwright (web automation if needed)
   - Generate comprehensive analysis and GitHub issues
4. **Upload Report**: Save execution log as artifact

### MCP Servers

The workflow uses seven MCP servers:

1. **github**: GitHub API integration (always available)
2. **playwright**: Browser automation (always available)
3. **screeps-mcp**: Live Screeps game state (requires SCREEPS_TOKEN)
4. **screeps-docs-mcp**: Official Screeps documentation (no auth required)
5. **screeps-wiki-mcp**: Community wiki knowledge (no auth required)
6. **screeps-typescript-mcp**: TypeScript type definitions (no auth required)
7. **grafana-mcp**: Monitoring and observability (requires GRAFANA_SERVICE_ACCOUNT_TOKEN)

### Agent Behavior

When all credentials are properly configured, the agent:

1. Queries Screeps API for current bot performance
2. Analyzes Grafana dashboards for trends and anomalies
3. Reviews repository code against ROADMAP.md architecture
4. Researches community best practices from wiki
5. Verifies API usage with official documentation
6. Creates detailed GitHub issues with:
   - Evidence from live data
   - Performance metrics and trends
   - Specific implementation guidance
   - References to relevant code and documentation
7. Avoids creating duplicate issues by searching existing ones

## Schedule

The workflow runs automatically every 6 hours via cron schedule:
- `0 */6 * * *` = At minute 0 past every 6th hour

This provides regular strategic analysis without overwhelming the issue tracker.

## Manual Execution

You can manually trigger the workflow:

1. Go to Actions tab in GitHub
2. Select "Copilot Strategic Planner"
3. Click "Run workflow"
4. Optionally enable verbose logging
5. Click "Run workflow" button

## Expected Output

A successful run should:
- Take 30-180 minutes (typical: 60-120 minutes)
- Generate 50-200KB output log
- Create 0-10 GitHub issues (max 10 per run)
- Include comprehensive JSON summary at the end

The output log contains:
- Performance analysis from all data sources
- Issue creation decisions and rationale
- Final JSON summary with metrics and recommendations

## Environment

The workflow requires the `copilot` environment to be configured in repository settings. This environment should have access to the required secrets.

## Related Files

- Workflow: `.github/workflows/copilot-strategic-planner.yml`
- Agent Prompt: `.github/agents/strategic-planner.agent.md`
- MCP Config: `.github/mcp/all-servers.json`
- Action: `.github/actions/copilot-exec/action.yml`
