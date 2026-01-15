# Strategic Metrics Collection Scripts

This directory contains a script for collecting live performance data from Screeps MCP and Grafana MCP servers. This script solves the issue where Docker-based MCP servers cannot be accessed directly by the GitHub Copilot CLI during workflow runs.

## Script

### `collect-strategic-metrics.mjs`

**Node.js-based data collection using the MCP SDK**

This script uses the official `@modelcontextprotocol/sdk` to properly communicate with Docker-based MCP servers.

**Features:**
- Uses `@modelcontextprotocol/sdk` for proper MCP protocol communication
- Launches Docker containers as child processes
- Calls MCP tools via the official SDK Client
- Saves structured JSON output with error handling
- Provides detailed logging of collection process

**Usage:**
```bash
# Set required environment variables
export SCREEPS_TOKEN="your-token"
export SCREEPS_HOST="screeps.com"
export SCREEPS_SHARD="shard3"
export GRAFANA_SERVICE_ACCOUNT_TOKEN="your-grafana-token"
export RUN_ID="12345"
export RUN_URL="https://github.com/..."

# Run collection
node scripts/collect-strategic-metrics.mjs [output-file]
```

**Output Format:**
```json
{
  "timestamp": "2026-01-15T19:00:00Z",
  "runId": "12345",
  "runUrl": "https://github.com/...",
  "dataSourcesUsed": {
    "screeps_stats": true,
    "screeps_game_time": true,
    "screeps_user_rooms": true,
    "grafana_cpu_metrics": true,
    "grafana_gcl_metrics": true,
    "grafana_error_logs": true
  },
  "rawData": {
    "screeps": {
      "stats": { "cpu": {...}, "gcl": {...}, ... },
      "gameTime": { "time": 12345678 },
      "userInfo": { "_id": "...", ... },
      "rooms": [...]
    },
    "grafana": {
      "cpuQuery": {...},
      "gclQuery": {...},
      "errorLogs": {...}
    }
  },
  "summary": {
    "gameTime": 12345678,
    "cpu": { "current": 50, "limit": 100, "bucket": 8500 },
    "gcl": { "level": 8, "progress": 0.75 },
    "rooms": { "total": 8 },
    "creeps": { "total": 120 }
  }
}
```

**Dependencies:**
```bash
npm install @modelcontextprotocol/sdk
```

**Requirements:**
- Node.js 18+
- Docker installed and available
- Environment variables set (see above)
- Docker images available:
  - `ghcr.io/ralphschuler/screeps-mcp:latest`
  - `mcp/grafana`

---

## Integration with Strategic Planner

The strategic planner workflow (`.github/workflows/copilot-strategic-planner.yml`) uses the Node.js script to pre-collect metrics before running the AI agent:

```yaml
- name: Collect live metrics from MCP servers
  env:
    SCREEPS_TOKEN: ${{ secrets.COPILOT_MCP_SCREEPS_TOKEN }}
    # ... other env vars ...
  run: |
    npm install --no-save @modelcontextprotocol/sdk
    node scripts/collect-strategic-metrics.mjs "performance-baselines/strategic/collected-metrics-${{ github.run_id }}.json"
```

The collected metrics file is then passed to the agent via the `COLLECTED_METRICS_FILE` environment variable.

---

## Troubleshooting

### Docker Permission Errors

If you get permission errors when running Docker:
```bash
# Add user to docker group (requires re-login)
sudo usermod -aG docker $USER

# Or run with sudo (not recommended in workflows)
sudo node scripts/collect-strategic-metrics.mjs
```

### MCP SDK Import Errors

Ensure you're using Node.js 18+ and the MCP SDK is installed:
```bash
node --version  # Should be 18+
npm list @modelcontextprotocol/sdk
```

### Docker Image Not Found

Pull the required Docker images:
```bash
docker pull ghcr.io/ralphschuler/screeps-mcp:latest
docker pull mcp/grafana
```

### Empty or Missing Data

Check that environment variables are set correctly:
```bash
echo $SCREEPS_TOKEN
echo $GRAFANA_SERVICE_ACCOUNT_TOKEN
```

Enable verbose logging by checking the script output for "⚠️" warnings.

---

## Development

To test the script locally without affecting production:

```bash
# Use a test output file
node scripts/collect-strategic-metrics.mjs /tmp/test-metrics.json

# Check the output
cat /tmp/test-metrics.json | jq .
```

To add new metrics:
1. Add a new MCP tool call in the collection script
2. Update the `dataSourcesUsed` tracking
3. Add the result to `rawData`
4. Optionally add to `summary` for quick access
5. Update this README

---

## See Also

- Strategic Planner Agent: `.github/agents/strategic-planner.agent.md`
- Strategic Types: `packages/screeps-bot/test/performance/strategic-types.ts`
- MCP Helpers: `scripts/mcp-helpers/`
- Performance Baselines: `performance-baselines/strategic/`
