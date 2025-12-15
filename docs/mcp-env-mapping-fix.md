# MCP Environment Variable Mapping Fix

## Problem
The Copilot Strategic Planner workflow was failing because MCP (Model Context Protocol) server environment variables were not being properly mapped from the workflow environment to the names expected by the MCP servers.

## Root Cause
The MCP configuration file (`.github/mcp/all-servers.json`) uses an `env` field to define mappings between:
- **Workflow environment variables** (e.g., `COPILOT_MCP_SCREEPS_TOKEN`)
- **MCP server expected variables** (e.g., `SCREEPS_TOKEN`)

However, the `copilot-exec` action was not processing these mappings, causing `envsubst` to fail when trying to substitute variables that didn't exist.

Additionally, `envsubst` doesn't support bash-style default values like `${VAR:-default}`, which are used in some MCP server configurations.

## Solution
Modified the `.github/actions/copilot-exec/action.yml` to:

1. **Parse the `env` mappings** from the MCP configuration
2. **Export environment variables** with the mapped names before substitution
3. **Use bash heredoc evaluation** instead of `envsubst` to support default values
4. **Remove the `env` field** from the final config (not part of MCP JSON schema)

### Example Mapping
```json
{
  "screeps-mcp": {
    "args": ["-e", "SCREEPS_TOKEN=${SCREEPS_TOKEN}"],
    "env": {
      "SCREEPS_TOKEN": "COPILOT_MCP_SCREEPS_TOKEN"
    }
  }
}
```

The action now:
1. Reads the mapping: `SCREEPS_TOKEN` → `COPILOT_MCP_SCREEPS_TOKEN`
2. Exports: `export SCREEPS_TOKEN="${COPILOT_MCP_SCREEPS_TOKEN}"`
3. Substitutes: `${SCREEPS_TOKEN}` → `test-token-12345`
4. Results in: `"-e", "SCREEPS_TOKEN=test-token-12345"`

## Testing
A test script is provided at `scripts/test-mcp-env-mapping.sh` to validate the fix locally:

```bash
cd /home/runner/work/screeps/screeps
chmod +x scripts/test-mcp-env-mapping.sh
./scripts/test-mcp-env-mapping.sh
```

The test verifies:
- ✅ Environment variable mappings are correctly processed
- ✅ Variables are exported with the right names  
- ✅ Bash-style default values are properly substituted
- ✅ The `env` field is removed from final config
- ✅ All MCP servers receive correct environment variables

## Manual Workflow Testing
To test the fix in the actual workflow, you can manually trigger the strategic planner:

```bash
gh workflow run copilot-strategic-planner.yml --field verbose=true
```

Or via the GitHub UI:
1. Go to Actions → Copilot Strategic Planner
2. Click "Run workflow"
3. Enable verbose logging
4. Click "Run workflow"

## Files Changed
- `.github/actions/copilot-exec/action.yml` - Fixed environment variable mapping
- `scripts/test-mcp-env-mapping.sh` - Added test script

## Related
- Issue: "the copilot planer does not work. i think it might have todo with how we hand over the mcp data."
- PR: copilot/fix-copilot-planner-issue
