# Metrics Collection Pipeline Troubleshooting

This guide helps diagnose and fix failures in the strategic planning workflow's metrics collection pipeline.

## Overview

The metrics collection pipeline (`scripts/collect-strategic-metrics.mjs`) collects live performance data from:
- **Screeps API**: Game state, CPU usage, GCL progress, rooms, creeps
- **Grafana**: Historical metrics, logs, performance trends (optional)

## Quick Diagnostics

### Check Collection Output

The collected metrics file contains a `diagnostics` section with detailed failure information:

```json
{
  "diagnostics": {
    "docker": {
      "available": true,
      "screepsMcpImage": true,
      "grafanaMcpImage": false
    },
    "mcp": {
      "screepsConnected": false,
      "screepsError": "Cannot read properties of undefined (reading '_zod')",
      "grafanaConnected": false
    },
    "fallbacks": {
      "screepsApi": true,
      "grafanaSkipped": true
    },
    "collectionStatus": {
      "successCount": 1,
      "totalSources": 6,
      "successRate": "16.7%",
      "hasNonZeroData": true
    }
  }
}
```

### Common Failure Patterns

## Problem 1: All Data Sources Failed

**Symptoms:**
```
❌ screeps_stats: FAILED
❌ screeps_game_time: FAILED
❌ screeps_user_info: FAILED
❌ grafana_cpu_metrics: FAILED
❌ grafana_gcl_metrics: FAILED
❌ grafana_error_logs: FAILED
```

**Diagnosis:**

1. Check Docker availability:
```bash
docker version
docker images | grep screeps-mcp
docker images | grep grafana
```

2. Check environment variables:
```bash
echo $SCREEPS_TOKEN
echo $SCREEPS_HOST
echo $SCREEPS_SHARD
echo $GRAFANA_SERVICE_ACCOUNT_TOKEN
```

**Solutions:**

**A. Docker Not Available**
- The script will automatically fall back to direct Screeps API calls
- Grafana metrics will be skipped (optional)
- Expected: At least `screeps_user_info` should succeed via API fallback

**B. Missing Environment Variables**
- Ensure `SCREEPS_TOKEN` is set in GitHub Actions secrets
- Verify `GRAFANA_SERVICE_ACCOUNT_TOKEN` is set (optional for Grafana)
- Check workflow file has correct secret references

**C. Network/Firewall Issues**
- GitHub Actions runners may have network restrictions
- Try enabling verbose logging: `VERBOSE=true` in environment

## Problem 2: MCP Schema Errors

**Symptoms:**
```
⚠️  Failed to call screeps_stats: Cannot read properties of undefined (reading '_zod')
```

**Cause:** Version mismatch between MCP SDK and server

**Solution:**

1. **Update MCP SDK version** in workflow:
```yaml
- name: Collect live metrics from MCP servers
  run: |
    npm install --no-save @modelcontextprotocol/sdk@latest
```

2. **Update Docker images**:
```bash
docker pull ghcr.io/ralphschuler/screeps-mcp:latest
docker pull mcp/grafana:latest
```

3. **Use API fallback** - The script automatically falls back if MCP fails

## Problem 3: Grafana Timeout

**Symptoms:**
```
❌ Grafana data collection failed: Request timed out
```

**Diagnosis:**
- Grafana queries can be slow for large time ranges
- Default timeout: 30 seconds per query

**Solutions:**

1. **Reduce query time range** in `collect-strategic-metrics.mjs`:
```javascript
startTime: 'now-1h',  // Instead of 'now-24h'
```

2. **Increase timeout** (already set to 20s for Grafana):
```javascript
await callMCPTool(grafanaClient, 'query_prometheus', {...}, 30000); // 30s
```

3. **Skip Grafana metrics** - Remove `GRAFANA_SERVICE_ACCOUNT_TOKEN` to skip
   - Grafana metrics are optional for strategic planning

## Problem 4: Zero Metrics Output

**Symptoms:**
```
Game Time: 0
CPU: 0/100 (bucket: 0)
GCL: 0 (progress: 0)
Rooms: 0
Creeps: 0
```

**Diagnosis:**
All data collection failed, no fallback succeeded

**Solutions:**

1. **Check Screeps API credentials**:
```bash
curl -H "X-Token: $SCREEPS_TOKEN" \
  https://screeps.com/api/user/find?username=ralphschuler
```

Expected response:
```json
{"ok": 1, "user": {"_id": "...", "username": "ralphschuler", ...}}
```

2. **Verify API endpoint**:
```javascript
// Direct API test
const https = require('https');
https.get('https://screeps.com/api/user/find?username=ralphschuler', {
  headers: { 'X-Token': process.env.SCREEPS_TOKEN }
}, (res) => {
  res.on('data', (d) => console.log(d.toString()));
});
```

3. **Check rate limiting**:
- Screeps API has rate limits
- Wait 1-2 minutes between requests
- The script should handle this automatically

## Problem 5: Docker Image Pull Failures

**Symptoms:**
```
Unable to find image 'ghcr.io/ralphschuler/screeps-mcp:latest' locally
Error response from daemon: manifest not found
```

**Solutions:**

1. **Pre-pull images in workflow**:
```yaml
- name: Pull MCP Docker images
  run: |
    docker pull ghcr.io/ralphschuler/screeps-mcp:latest || true
    docker pull mcp/grafana:latest || true
```

2. **Use authenticated pull** for private images:
```yaml
- name: Login to GitHub Container Registry
  run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
```

3. **Fall back to API** - Script automatically uses API fallback

## Enable Verbose Logging

Add to workflow environment:
```yaml
env:
  VERBOSE: 'true'
```

Or run locally:
```bash
VERBOSE=true node scripts/collect-strategic-metrics.mjs output.json
```

Verbose output includes:
- Docker availability checks
- MCP connection attempts
- Tool call parameters and results
- Fallback triggers
- Detailed error messages

## Validation Checklist

After fixing issues, verify:

- [ ] `successRate` > 50% (at least 3 of 6 sources)
- [ ] `hasNonZeroData: true`
- [ ] `gameTime` > 0
- [ ] `cpu.current` > 0 OR `gcl.level` > 0
- [ ] At least one of: `screeps_stats`, `screeps_user_info` succeeded

## Test Locally

```bash
# Set environment variables
export SCREEPS_TOKEN="your-token"
export SCREEPS_HOST="screeps.com"
export SCREEPS_SHARD="shard3"
export GRAFANA_SERVICE_ACCOUNT_TOKEN="your-token" # Optional
export VERBOSE="true"

# Run collection
node scripts/collect-strategic-metrics.mjs test-output.json

# Check results
cat test-output.json | jq '.diagnostics'
cat test-output.json | jq '.summary'
```

## Emergency Workaround

If all automated collection fails, manually create a metrics file:

```json
{
  "timestamp": "2026-01-18T12:00:00Z",
  "runId": "manual",
  "dataSourcesUsed": {
    "manual": true
  },
  "rawData": {
    "screeps": {
      "userInfo": {
        "_id": "your-user-id",
        "username": "ralphschuler"
      }
    }
  },
  "summary": {
    "gameTime": 0,
    "cpu": { "current": 0, "limit": 100, "bucket": 0 },
    "gcl": { "level": 0, "progress": 0 },
    "rooms": { "total": 0 },
    "creeps": { "total": 0 }
  },
  "diagnostics": {
    "manual": "Manually created due to collection failure"
  }
}
```

Save as `performance-baselines/strategic/collected-metrics-{RUN_ID}.json`

## Support

For persistent issues:

1. Check GitHub Actions run logs
2. Review diagnostics section in collected-metrics file
3. Create issue with:
   - Workflow run URL
   - Collected metrics file (remove secrets!)
   - Verbose logs
   - Environment details (OS, Docker version, Node version)
