#!/bin/bash
set -euo pipefail

#
# Strategic Metrics Collection Script
#
# Collects live performance data from screeps-mcp and grafana-mcp servers
# for use by the strategic planning agent.
#
# This script solves the problem where Docker-based MCP servers cannot be
# accessed directly by the GitHub Copilot CLI during workflow runs.
#
# Usage:
#   ./scripts/collect-strategic-metrics.sh [output-file]
#
# Environment Variables Required:
#   SCREEPS_TOKEN - Screeps API authentication token
#   SCREEPS_HOST - Screeps server host (default: screeps.com)
#   SCREEPS_SHARD - Target shard (default: shard3)
#   GRAFANA_SERVICE_ACCOUNT_TOKEN - Grafana API token
#   RUN_ID - GitHub Actions run ID (optional)
#   RUN_URL - GitHub Actions run URL (optional)
#

# Default output location
OUTPUT_FILE="${1:-performance-baselines/strategic/collected-metrics.json}"

# Ensure output directory exists
mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "📊 Collecting strategic metrics..."
echo "   Output: $OUTPUT_FILE"

# Timestamp for all operations
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "   Timestamp: $TIMESTAMP"

# Helper function to call MCP tool via Docker
call_mcp_tool() {
  local server_name="$1"
  local tool_name="$2"
  local params="$3"
  
  local docker_image=""
  local env_args=()
  
  case "$server_name" in
    screeps-mcp)
      docker_image="ghcr.io/ralphschuler/screeps-mcp:latest"
      env_args+=(
        "-e" "SCREEPS_TOKEN=${SCREEPS_TOKEN}"
        "-e" "SCREEPS_HOST=${SCREEPS_HOST:-screeps.com}"
        "-e" "SCREEPS_SHARD=${SCREEPS_SHARD:-shard3}"
      )
      ;;
    grafana-mcp)
      docker_image="mcp/grafana"
      env_args+=(
        "-e" "GRAFANA_URL=https://ralphschuler.grafana.net"
        "-e" "GRAFANA_SERVICE_ACCOUNT_TOKEN=${GRAFANA_SERVICE_ACCOUNT_TOKEN}"
      )
      ;;
    *)
      echo "❌ Unknown MCP server: $server_name" >&2
      return 1
      ;;
  esac
  
  # Construct MCP JSON-RPC request
  local request=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "$tool_name",
    "arguments": $params
  }
}
EOF
)
  
  # Call MCP server via Docker
  echo "$request" | docker run --rm -i "${env_args[@]}" "$docker_image" 2>/dev/null || {
    echo "⚠️  Failed to call $tool_name on $server_name" >&2
    echo "{\"error\": \"Failed to call $tool_name\"}"
  }
}

# Helper to extract result from MCP response
extract_result() {
  jq -r '.result.content[0].text // .result // empty' 2>/dev/null || echo "{}"
}

# Helper to parse JSON response that may be embedded in text
parse_json_result() {
  local input="$1"
  # Try to extract JSON from text response (MCP sometimes wraps JSON in text)
  echo "$input" | jq -r 'if type == "string" then . else tojson end' 2>/dev/null | \
    grep -oP '\{.*\}' | head -1 | jq '.' 2>/dev/null || echo "$input"
}

echo "🎮 Collecting Screeps game state..."

# 1. Get current game stats
echo "  → screeps_stats"
STATS_RESPONSE=$(call_mcp_tool "screeps-mcp" "screeps_stats" "{}")
STATS=$(echo "$STATS_RESPONSE" | extract_result | parse_json_result)

# 2. Get game time
echo "  → screeps_game_time"
GAME_TIME_RESPONSE=$(call_mcp_tool "screeps-mcp" "screeps_game_time" "{}")
GAME_TIME=$(echo "$GAME_TIME_RESPONSE" | extract_result | parse_json_result)

# 3. Get user info to get user ID
echo "  → screeps_user_info (for user ID)"
USER_INFO_RESPONSE=$(call_mcp_tool "screeps-mcp" "screeps_user_info" '{"username": "ralphschuler"}')
USER_INFO=$(echo "$USER_INFO_RESPONSE" | extract_result | parse_json_result)
USER_ID=$(echo "$USER_INFO" | jq -r '._id // "unknown"')

# 4. Get user rooms
echo "  → screeps_user_rooms"
if [ "$USER_ID" != "unknown" ]; then
  ROOMS_RESPONSE=$(call_mcp_tool "screeps-mcp" "screeps_user_rooms" "{\"userId\": \"$USER_ID\"}")
  ROOMS=$(echo "$ROOMS_RESPONSE" | extract_result | parse_json_result)
else
  echo "  ⚠️  Skipping user_rooms (no user ID)"
  ROOMS="[]"
fi

echo "📈 Collecting Grafana metrics..."

# 5. Get CPU trend (24h) - using instant query for simplicity
echo "  → query_prometheus (CPU trend)"
CPU_QUERY_24H=$(call_mcp_tool "grafana-mcp" "query_prometheus" '{
  "datasourceUid": "prometheus",
  "expr": "screeps_cpu_used",
  "startTime": "now-24h",
  "endTime": "now",
  "queryType": "instant"
}' 2>/dev/null || echo '{"error": "Failed to query CPU metrics"}')

# 6. Get GCL progress
echo "  → query_prometheus (GCL progress)"
GCL_QUERY=$(call_mcp_tool "grafana-mcp" "query_prometheus" '{
  "datasourceUid": "prometheus",
  "expr": "screeps_gcl_progress",
  "startTime": "now-24h",
  "endTime": "now",
  "queryType": "instant"
}' 2>/dev/null || echo '{"error": "Failed to query GCL metrics"}')

# 7. Get error logs (24h)
echo "  → query_loki_logs (errors)"
ERROR_LOGS=$(call_mcp_tool "grafana-mcp" "query_loki_logs" "{
  \"datasourceUid\": \"loki\",
  \"logql\": \"{job=\\\"screeps-bot\\\"} |~ \\\"ERROR|error\\\"\",
  \"startRfc3339\": \"$(date -u -d '24 hours ago' +"%Y-%m-%dT%H:%M:%SZ")\",
  \"endRfc3339\": \"$TIMESTAMP\",
  \"limit\": 100
}" 2>/dev/null || echo '{"error": "Failed to query error logs"}')

echo "💾 Assembling metrics snapshot..."

# Assemble the collected data into the strategic metrics format
cat > "$OUTPUT_FILE" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "runId": "${RUN_ID:-unknown}",
  "runUrl": "${RUN_URL:-unknown}",
  "dataSourcesUsed": {
    "screeps_stats": $([ -n "$STATS" ] && echo "true" || echo "false"),
    "screeps_game_time": $([ -n "$GAME_TIME" ] && echo "true" || echo "false"),
    "screeps_user_rooms": $([ -n "$ROOMS" ] && echo "true" || echo "false"),
    "grafana_cpu_metrics": $(echo "$CPU_QUERY_24H" | jq 'has("error") | not'),
    "grafana_gcl_metrics": $(echo "$GCL_QUERY" | jq 'has("error") | not'),
    "grafana_error_logs": $(echo "$ERROR_LOGS" | jq 'has("error") | not')
  },
  "rawData": {
    "screeps": {
      "stats": $STATS,
      "gameTime": $GAME_TIME,
      "userInfo": $USER_INFO,
      "rooms": $ROOMS
    },
    "grafana": {
      "cpuQuery": $CPU_QUERY_24H,
      "gclQuery": $GCL_QUERY,
      "errorLogs": $ERROR_LOGS
    }
  },
  "summary": {
    "gameTime": $(echo "$GAME_TIME" | jq -r '.time // 0'),
    "cpu": {
      "current": $(echo "$STATS" | jq -r '.cpu.used // 0'),
      "limit": $(echo "$STATS" | jq -r '.cpu.limit // 100'),
      "bucket": $(echo "$STATS" | jq -r '.cpu.bucket // 0')
    },
    "gcl": {
      "level": $(echo "$STATS" | jq -r '.gcl.level // 0'),
      "progress": $(echo "$STATS" | jq -r '.gcl.progress // 0')
    },
    "rooms": {
      "total": $(echo "$ROOMS" | jq 'if type == "array" then length else 0 end')
    },
    "creeps": {
      "total": $(echo "$STATS" | jq -r '.creeps.total // 0')
    }
  }
}
EOF

echo "✅ Metrics collected successfully!"
echo "   Data saved to: $OUTPUT_FILE"

# Show summary
echo ""
echo "📋 Summary:"
jq -r '.summary | to_entries | .[] | "   \(.key): \(.value)"' "$OUTPUT_FILE" 2>/dev/null || true

exit 0
