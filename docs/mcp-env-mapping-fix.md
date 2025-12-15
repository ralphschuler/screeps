# MCP Environment Variable Mapping Fix

## Problem
The Copilot Strategic Planner workflow was failing because MCP (Model Context Protocol) server environment variables were not being properly mapped from the workflow environment to the names expected by the MCP servers.

## Root Causes

### Issue 1: Environment Variable Mapping
The MCP configuration file (`.github/mcp/all-servers.json`) uses an `env` field to define mappings between:
- **Workflow environment variables** (e.g., `COPILOT_MCP_SCREEPS_TOKEN`)
- **MCP server expected variables** (e.g., `SCREEPS_TOKEN`)

However, the `copilot-exec` action was not processing these mappings, causing `envsubst` to fail when trying to substitute variables that didn't exist.

Additionally, `envsubst` doesn't support bash-style default values like `${VAR:-default}`, which are used in some MCP server configurations.

### Issue 2: Composite Action Environment Variable Inheritance
GitHub Actions composite actions do NOT inherit environment variables from the calling workflow step's `env:` section. Environment variables must be set at the **job level** to be accessible within composite action steps.

**Original (broken):**
```yaml
steps:
  - uses: ./.github/actions/copilot-exec
    env:  # ❌ Not accessible to composite action's internal steps!
      COPILOT_MCP_SCREEPS_TOKEN: ${{ secrets.TOKEN }}
```

**Fixed:**
```yaml
jobs:
  my-job:
    env:  # ✅ Accessible to all steps including composite actions!
      COPILOT_MCP_SCREEPS_TOKEN: ${{ secrets.TOKEN }}
    steps:
      - uses: ./.github/actions/copilot-exec
```

## Solutions Implemented

### Fix 1: Environment Variable Mapping in Action
Modified `.github/actions/copilot-exec/action.yml` to:
1. **Parse the `env` mappings** from the MCP configuration
2. **Export environment variables** with the mapped names before substitution
3. **Use bash heredoc evaluation** instead of `envsubst` to support default values
4. **Remove the `env` field** from the final config (not part of MCP JSON schema)

### Fix 2: Job-Level Environment Variables
Modified `.github/workflows/copilot-strategic-planner.yml` to:
1. **Move environment variables** from step level to job level
2. This ensures the `COPILOT_MCP_*` variables are accessible to the composite action's internal steps

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
3. Substitutes: `${SCREEPS_TOKEN}` → actual token value
4. Results in: `"-e", "SCREEPS_TOKEN=actual-token-value"`

## Testing
Two test scripts validate the fixes:

### Test 1: Environment Variable Mapping
`scripts/test-mcp-env-mapping.sh` validates:
- ✅ Environment variable mappings are correctly processed
- ✅ Variables are exported with the right names  
- ✅ Bash-style default values are properly substituted
- ✅ The `env` field is removed from final config
- ✅ All MCP servers receive correct environment variables

### Test 2: Job-Level Environment Access
`scripts/test-job-level-env.sh` validates:
- ✅ Environment variables set at job level are accessible
- ✅ Composite action can access these variables in internal steps
- ✅ The mapping logic works with job-level variables

**All tests pass locally ✅**

## Manual Workflow Testing
To verify the fix in CI:
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
- `.github/workflows/copilot-strategic-planner.yml` - Moved env vars to job level
- `scripts/test-mcp-env-mapping.sh` - Added mapping validation test
- `scripts/test-job-level-env.sh` - Added job-level env access test

## Related
- Issue: "the copilot planer does not work. i think it might have todo with how we hand over the mcp data."
- Comment: "i have checked and fixed the issues regarding the env vars already. however the bot still does not have access to the mcp tools."
- PR: copilot/fix-copilot-planner-issue
