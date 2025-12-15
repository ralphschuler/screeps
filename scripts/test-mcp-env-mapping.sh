#!/bin/bash
# Test script for MCP environment variable mapping
# This script validates that the env mapping logic in copilot-exec action works correctly

set -euo pipefail

echo "=== MCP Environment Variable Mapping Test ==="
echo ""

# Simulate workflow environment variables
export COPILOT_MCP_SCREEPS_TOKEN="test-token-12345"
export COPILOT_MCP_SCREEPS_HOST="screeps.com"
export COPILOT_MCP_SCREEPS_SHARD="shard3"
export COPILOT_MCP_SCREEPS_DOCS_CACHE_TTL="3600"
export COPILOT_MCP_GRAFANA_SERVICE_ACCOUNT_TOKEN="test-grafana-token"

# Read the MCP config
config_content=$(cat .github/mcp/all-servers.json)

echo "Step 1: Processing environment variable mappings"
echo "------------------------------------------------"

# Extract and export mapped environment variables (same logic as in action.yml)
while IFS='=' read -r var_name source_var; do
  if [ -n "$var_name" ] && [ -n "$source_var" ]; then
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
echo "Step 2: Substituting environment variables with bash expansion"
echo "---------------------------------------------------------------"
# Use heredoc with eval to handle bash-style default values
config_temp=$(mktemp)
echo "$config_content" > "$config_temp"
config_content=$(eval "cat <<EOF
$(<"$config_temp")
EOF
")
rm -f "$config_temp"

echo ""
echo "Step 3: Removing env field from config"
echo "---------------------------------------"
config_content=$(echo "$config_content" | jq 'walk(if type == "object" then del(.env) else . end)')

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

# Verify docs-mcp has correct cache TTL
docs_ttl=$(echo "$config_content" | jq -r '.mcpServers["screeps-docs-mcp"].args[] | select(startswith("DOCS_CACHE_TTL="))')
if [[ "$docs_ttl" == "DOCS_CACHE_TTL=3600" ]]; then
  echo "✅ screeps-docs-mcp: DOCS_CACHE_TTL correctly substituted"
else
  echo "❌ screeps-docs-mcp: DOCS_CACHE_TTL NOT substituted (got: $docs_ttl)"
  exit 1
fi

# Verify env fields are removed
if echo "$config_content" | jq -e '.mcpServers | to_entries[] | select(.value.env != null)' > /dev/null 2>&1; then
  echo "❌ env field still present in config"
  exit 1
else
  echo "✅ env fields removed from all servers"
fi

echo ""
echo "=== All tests passed! ✅ ==="
echo ""
echo "The MCP environment variable mapping is working correctly."
echo "You can now test the workflow by running:"
echo "  gh workflow run copilot-strategic-planner.yml --field verbose=true"
