# Issue Analysis: Strategic Planner Workflow Run #20215660873

## Issue Summary

Workflow run [#20215660873](https://github.com/ralphschuler/screeps/actions/runs/20215660873/job/58028173290) completed in only 3 minutes with minimal output (13KB), when it should have run for 30-180 minutes performing comprehensive analysis.

## Root Cause

The workflow appeared to succeed but did not perform its intended comprehensive analysis because **required authentication secrets were not configured**:

1. **SCREEPS_TOKEN**: Empty (shown in logs as `COPILOT_MCP_SCREEPS_TOKEN:` with no value)
2. **GRAFANA_SERVICE_ACCOUNT_TOKEN**: Empty (shown in logs as `COPILOT_MCP_GRAFANA_SERVICE_ACCOUNT_TOKEN:` with no value)

Without these credentials:
- The `screeps-mcp` server cannot authenticate with Screeps API to get live game data
- The `grafana-mcp` server cannot access monitoring dashboards
- The Copilot agent exits early with minimal analysis instead of providing comprehensive strategic recommendations

## Evidence from Logs

From workflow logs (lines 2025-12-14T23:15:13.4206110Z - 2025-12-14T23:15:13.4221196Z):

```
COPILOT_MCP_SCREEPS_TOKEN: 
COPILOT_MCP_SCREEPS_HOST: screeps.com
COPILOT_MCP_SCREEPS_SHARD: shard3
COPILOT_MCP_GRAFANA_SERVICE_ACCOUNT_TOKEN: 
```

Notice both `COPILOT_MCP_SCREEPS_TOKEN` and `COPILOT_MCP_GRAFANA_SERVICE_ACCOUNT_TOKEN` are empty (no value after the colon).

The Copilot CLI ran for 160 seconds and produced only 13,354 bytes of output - far less than the expected 50-200KB for a full analysis with evidence-based GitHub issue creation.

## Solution Implemented

### 1. Secret Validation Step

Added a pre-flight validation step that checks if all three required secrets are configured:
- `SCREEPS_TOKEN`
- `GRAFANA_SERVICE_ACCOUNT_TOKEN`
- `COPILOT_TOKEN`

If any are missing, the workflow now **fails immediately** with a clear, actionable error message that includes:
- List of missing secrets
- Direct link to repository secrets settings
- Instructions for obtaining each token
- Explanation of what each secret is used for

### 2. Enhanced Documentation

#### Workflow File Headers
Added comprehensive comments at the top of `copilot-strategic-planner.yml` explaining:
- What the workflow does
- Which MCP servers it uses
- Required secrets and where to get them
- Failure behavior when secrets are missing

#### Troubleshooting Guide
Created `docs/workflows/strategic-planner.md` with:
- Complete setup instructions
- Troubleshooting for common problems (including this exact issue)
- Expected behavior and output
- How the workflow integrates with MCP servers

## How to Fix

### Step 1: Configure Secrets

Go to: `https://github.com/<owner>/<repo>/settings/secrets/actions`
(Replace `<owner>/<repo>` with your repository path)

Add the following secrets:

#### SCREEPS_TOKEN
1. Visit https://screeps.com/a/#!/account/auth-tokens
2. Create a new API token
3. Copy the token value
4. Add as repository secret with name `SCREEPS_TOKEN`

#### GRAFANA_SERVICE_ACCOUNT_TOKEN
1. Go to your Grafana instance (see `.github/mcp/all-servers.json` for the URL)
2. Navigate to Administration > Service Accounts
3. Create new service account with read permissions
4. Generate a token
5. Add as repository secret with name `GRAFANA_SERVICE_ACCOUNT_TOKEN`

#### COPILOT_TOKEN
1. This should already be configured if other Copilot workflows are working
2. If not, contact GitHub organization admin

### Step 2: Re-run Workflow

After configuring the secrets:
1. Go to: `https://github.com/<owner>/<repo>/actions/workflows/copilot-strategic-planner.yml`
2. Click "Run workflow"
3. Optionally enable verbose logging for debugging
4. Click "Run workflow" button

### Step 3: Verify Success

A successful run should:
- Pass the "Validate required secrets" step
- Run for 30-180 minutes (typical: 60-120 minutes)
- Generate 50-200KB output log
- Create 0-10 evidence-based GitHub issues
- Include comprehensive JSON summary at the end

## Expected Behavior After Fix

### Validation Step Success
```
✅ All required secrets are configured
```

### Full Analysis Output
The agent will:
1. Query live Screeps game state using `screeps-mcp`
2. Analyze performance trends in Grafana dashboards
3. Review code against ROADMAP.md architecture
4. Research community best practices from wiki
5. Verify API usage with official documentation
6. Create detailed GitHub issues with:
   - Evidence from live data
   - Performance metrics and trends
   - Specific implementation guidance
   - References to relevant code and documentation

## Prevention

The workflow will now fail fast with helpful error messages on every future run where secrets are not configured, making it immediately obvious when there's a configuration problem instead of silently producing minimal output.

## Related Files

- Workflow: `.github/workflows/copilot-strategic-planner.yml`
- Agent Prompt: `.github/agents/strategic-planner.agent.md`
- MCP Config: `.github/mcp/all-servers.json`
- Documentation: `docs/workflows/strategic-planner.md`

## Additional Notes

The MCP configuration file (`.github/mcp/all-servers.json`) shows how environment variables are mapped:
- `"SCREEPS_TOKEN": "COPILOT_MCP_SCREEPS_TOKEN"` means the value of `COPILOT_MCP_SCREEPS_TOKEN` is passed to Docker containers as `SCREEPS_TOKEN`
- Same pattern for Grafana token

This is why the environment variable names in the workflow have the `COPILOT_MCP_` prefix.
