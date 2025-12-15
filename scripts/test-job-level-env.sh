#!/bin/bash
# Test to verify environment variables are accessible at job level
# This simulates the GitHub Actions environment for the composite action

set -euo pipefail

echo "=== Testing Job-Level Environment Variable Access ==="
echo ""

# Simulate job-level environment variables (these would be set in the workflow)
export COPILOT_MCP_SCREEPS_TOKEN="test-token-12345"
export COPILOT_MCP_SCREEPS_HOST="screeps.com"
export COPILOT_MCP_SCREEPS_SHARD="shard3"
export COPILOT_MCP_SCREEPS_DOCS_CACHE_TTL="3600"
export COPILOT_MCP_GRAFANA_SERVICE_ACCOUNT_TOKEN="test-grafana-token"

echo "Job-level environment variables set:"
echo "  COPILOT_MCP_SCREEPS_TOKEN=${COPILOT_MCP_SCREEPS_TOKEN}"
echo "  COPILOT_MCP_SCREEPS_HOST=${COPILOT_MCP_SCREEPS_HOST}"
echo "  COPILOT_MCP_SCREEPS_SHARD=${COPILOT_MCP_SCREEPS_SHARD}"
echo "  COPILOT_MCP_SCREEPS_DOCS_CACHE_TTL=${COPILOT_MCP_SCREEPS_DOCS_CACHE_TTL}"
echo "  COPILOT_MCP_GRAFANA_SERVICE_ACCOUNT_TOKEN=${COPILOT_MCP_GRAFANA_SERVICE_ACCOUNT_TOKEN}"
echo ""

# Read the MCP config
config_content=$(cat .github/mcp/all-servers.json)

echo "Step 1: Processing environment variable mappings (as composite action would)"
echo "----------------------------------------------------------------------------"

# This simulates what the composite action's "Configure MCP servers" step does
# The key point: it can now access COPILOT_MCP_* variables because they're at job level
while IFS='=' read -r var_name source_var; do
  if [ -n "$var_name" ] && [ -n "$source_var" ]; then
    # Using indirect variable expansion: ${!source_var} gets the value of the variable named by source_var
    if [ -n "${!source_var:-}" ]; then
      export "$var_name=${!source_var}"
      echo "✓ Exported $var_name from $source_var = ${!source_var}"
    else
      echo "⚠ Skipping $var_name (source $source_var not set)"
    fi
  fi
done < <(echo "$config_content" | jq -r '
  .mcpServers // {} | 
  to_entries[] | 
  select(.value.env != null) |
  .value.env |
  to_entries[] |
  "\(.key)=\(.value)"
')

echo ""
echo "Step 2: Verifying mapped variables are available"
echo "-------------------------------------------------"
echo "SCREEPS_TOKEN=${SCREEPS_TOKEN:-<not set>}"
echo "SCREEPS_HOST=${SCREEPS_HOST:-<not set>}"
echo "SCREEPS_SHARD=${SCREEPS_SHARD:-<not set>}"
echo "DOCS_CACHE_TTL=${DOCS_CACHE_TTL:-<not set>}"
echo "GRAFANA_SERVICE_ACCOUNT_TOKEN=${GRAFANA_SERVICE_ACCOUNT_TOKEN:-<not set>}"

echo ""
echo "Step 3: Substituting environment variables"
echo "-------------------------------------------"
config_temp=$(mktemp)
echo "$config_content" > "$config_temp"
config_content=$(eval "cat <<EOF
$(<"$config_temp")
EOF
")
rm -f "$config_temp"

echo ""
echo "Step 4: Verification"
echo "--------------------"

# Verify screeps-mcp has correct token
screeps_token=$(echo "$config_content" | jq -r '.mcpServers["screeps-mcp"].args[] | select(startswith("SCREEPS_TOKEN="))')
if [[ "$screeps_token" == "SCREEPS_TOKEN=test-token-12345" ]]; then
  echo "✅ screeps-mcp: SCREEPS_TOKEN correctly substituted"
else
  echo "❌ screeps-mcp: SCREEPS_TOKEN NOT substituted (got: $screeps_token)"
  exit 1
fi

# Verify grafana-mcp has correct token
grafana_token=$(echo "$config_content" | jq -r '.mcpServers["grafana-mcp"].args[] | select(startswith("GRAFANA_SERVICE_ACCOUNT_TOKEN="))')
if [[ "$grafana_token" == "GRAFANA_SERVICE_ACCOUNT_TOKEN=test-grafana-token" ]]; then
  echo "✅ grafana-mcp: GRAFANA_SERVICE_ACCOUNT_TOKEN correctly substituted"
else
  echo "❌ grafana-mcp: GRAFANA_SERVICE_ACCOUNT_TOKEN NOT substituted (got: $grafana_token)"
  exit 1
fi

echo ""
echo "=== All tests passed! ✅ ==="
echo ""
echo "The environment variables are now accessible at the job level,"
echo "which means the composite action can access them in its internal steps."
