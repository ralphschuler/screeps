# MCP Integration Helpers

This directory contains helper functions and utilities for integrating with MCP (Model Context Protocol) servers in the autonomous development workflow.

## Purpose

These helpers serve three main purposes:

1. **Type Definitions**: Provide TypeScript types for common data structures used across MCP interactions
2. **Documentation**: Show AI agents how to correctly use MCP tools
3. **Utilities**: Provide actual implementations for tasks like performance regression detection

## Important Note for AI Agents

**Do NOT call these helper functions directly from your agent code.** Instead, use the MCP tools directly.

### ❌ Wrong Approach

```typescript
import { getBotHealth } from './mcp-helpers';
const health = await getBotHealth();
```

### ✅ Correct Approach

```typescript
// Use MCP tools directly
const stats = await screeps_stats();
const rooms = await screeps_user_rooms({ userId: "user-id" });
const memory = await screeps_memory_get({ path: "stats" });
```

## Available Modules

### `types.ts`

Common TypeScript type definitions:
- `CPUMetrics` - CPU usage statistics
- `BotHealth` - Overall bot health metrics
- `PerformanceBaseline` - Performance baseline data
- `RegressionReport` - Performance regression analysis
- `WikiArticle` - Wiki article structure

### `grafana.ts`

Grafana MCP tool usage examples. Instead of calling these functions, use:
- `query_prometheus()` - Query Prometheus metrics
- `query_loki_logs()` - Search Loki logs
- `search_dashboards()` - Find dashboards
- `list_alert_rules()` - Get alert configurations

### `screeps.ts`

Screeps MCP tool usage examples. Instead of calling these functions, use:
- `screeps_stats()` - Get bot statistics
- `screeps_user_rooms()` - Get owned rooms
- `screeps_memory_get()` - Read memory
- `screeps_console()` - Execute commands
- `screeps_room_status()` - Get room information

### `wiki.ts`

Wiki MCP tool usage examples. Instead of calling these functions, use:
- `screeps_wiki_search()` - Search wiki articles
- `screeps_wiki_get_article()` - Get full article content
- `screeps_wiki_list_categories()` - List categories

### `regression.ts` ⭐

**Actual implementation** for performance regression detection:

- `getBaseline(branch)` - Load performance baseline
- `detectRegression(current, branch)` - Compare metrics and detect regressions
- `saveBaseline(metrics, branch)` - Save new baseline
- `getRegressionHistory(branch, days)` - Get historical baselines

**This module IS meant to be used by agents and scripts.**

## Example: AI Agent Workflow

Here's how an AI agent should use MCP tools for performance analysis:

```typescript
// 1. Query current CPU metrics from Grafana
const cpuMetrics = await query_prometheus({
  datasourceUid: "prometheus-uid",
  expr: "screeps_cpu_usage",
  startTime: "now-1h",
  endTime: "now",
  queryType: "range",
  stepSeconds: 60
});

// 2. Get bot health from Screeps
const stats = await screeps_stats();
const rooms = await screeps_user_rooms({ userId: "your-user-id" });

// 3. Check for performance regression (uses regression.ts)
import { detectRegression } from './mcp-helpers/regression.js';
const regression = await detectRegression({
  avg: cpuMetrics.avgCPU,
  max: cpuMetrics.maxCPU,
  min: cpuMetrics.minCPU,
  p95: cpuMetrics.p95CPU,
  p99: cpuMetrics.p99CPU,
  timestamp: Date.now()
}, 'main');

// 4. Search wiki for optimization strategies if regression detected
if (regression.severity !== 'none') {
  const strategies = await screeps_wiki_search({
    query: "CPU optimization techniques",
    limit: 5
  });
}
```

## Testing

These modules can be imported and tested in Node.js scripts:

```bash
node --loader ts-node/esm scripts/check-performance-regression.ts
```

## Architecture Note

This design separates:
- **MCP Tools** (available to AI agents at runtime)
- **Helper Functions** (documentation + utilities)
- **Actual Utilities** (regression detection, etc.)

This ensures AI agents use the correct tools while still providing useful utilities for automation scripts.
