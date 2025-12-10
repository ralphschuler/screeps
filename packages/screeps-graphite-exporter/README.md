# Screeps Grafana Cloud Graphite Exporter

Exports Screeps stats to Grafana Cloud using the Graphite HTTP API from either console output (recommended) or `Memory.stats` polling.

## Features
- **Console mode (recommended)**: subscribes to Screeps console logs and parses JSON stat lines for real-time metrics export.
- **Memory mode**: periodically fetches `Memory.stats` and sends metrics to Grafana Cloud Graphite (subject to API rate limits).
- Uses Grafana Cloud Graphite HTTP API with JSON format.
- Supports nested stats objects with automatic flattening.
- Extracts room and subsystem information from metric keys for better tagging.
- Optional full-memory export for deep debugging/visualization use-cases.

## Mode Comparison

| Feature | Console Mode | Memory Mode |
| --- | --- | --- |
| **Real-time updates** | ✅ Yes (via WebSocket) | ❌ No (polling interval) |
| **API rate limits** | ✅ Not affected | ⚠️ Limited to 1440/day |
| **Latency** | ✅ Low (<1s) | ⚠️ High (poll interval) |
| **Missing data** | ✅ Captures every tick | ⚠️ Misses ticks between polls |
| **API calls** | ✅ Minimal (WebSocket) | ⚠️ 1 per poll |
| **Recommended** | ✅ Yes | ❌ Legacy only |

**Recommendation:** Use console mode for production deployments. Memory mode is only provided for backward compatibility.

## Configuration
All configuration is provided via environment variables. Authentication requires either `SCREEPS_TOKEN` or the combination of `SCREEPS_USERNAME` and `SCREEPS_PASSWORD`.

### Rate Limiting
The exporter implements proper rate limit handling according to the [Screeps API documentation](https://docs.screeps.com/auth-tokens.html):
- Monitors rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)
- Automatically adjusts polling interval when approaching rate limits (< 20% quota remaining)
- Waits for rate limit reset when quota is exhausted (HTTP 429)
- Enforces a minimum poll interval to prevent excessive API calls
- Detects and corrects miscalculated rate limit values to prevent excessively long wait times

**Important:** The `GET /api/user/memory` endpoint has a rate limit of **1440 requests/day** (1 request per minute). The default poll interval of 90 seconds (40 requests/hour) is conservative and ensures you'll never exhaust your rate limit quota. You can reduce this if needed, but values below 60 seconds are not recommended.

| Variable | Default | Description |
| --- | --- | --- |
| `EXPORTER_MODE` | `memory` | Set to `memory` or `console`. **Console mode is recommended** for real-time stats with lower API usage. |
| `EXPORTER_POLL_INTERVAL_MS` | `90000` | Poll interval for memory mode (in milliseconds). Default is 90 seconds (40 requests/hour), which is conservative and respects the API rate limit of 1440 requests/day. The exporter automatically adjusts this based on rate limit information from the Screeps API. |
| `EXPORTER_MIN_POLL_INTERVAL_MS` | `60000` | Minimum poll interval to enforce (60 seconds = 1 minute). This ensures compliance with the `/api/user/memory` rate limit of 1440/day. Values below 60 seconds are not recommended. |
| `EXPORTER_MEMORY_PATH` | `stats` | Memory path to read stats from. |
| `EXPORTER_MEMORY_FULL` | `false` | When `true`, flatten the entire Memory payload instead of only `Memory.stats`. |
| `EXPORTER_SHARD` | `shard0` | Shard to read from when polling memory. |
| `GRAFANA_CLOUD_GRAPHITE_URL` | _none_ | Grafana Cloud Graphite endpoint URL (required). Example: `https://graphite-prod-01-eu-west-0.grafana.net/graphite/metrics` |
| `GRAFANA_CLOUD_API_KEY` | _none_ | Grafana Cloud API key for authentication (required). |
| `GRAFANA_CLOUD_GRAPHITE_PREFIX` | `screeps` | Prefix for all Graphite metric names. |
| `SCREEPS_PROTOCOL` | `https` | Protocol for Screeps API connections. |
| `SCREEPS_HOST` | `screeps.com` | Host for Screeps API connections. |
| `SCREEPS_PORT` | _unset_ | Optional Screeps API port override. |
| `SCREEPS_PATH` | `/api/` | API base path. |
| `SCREEPS_TOKEN` | _none_ | Personal API token for authentication. |
| `SCREEPS_USERNAME` | _none_ | Username (if not using a token). |
| `SCREEPS_PASSWORD` | _none_ | Password (if not using a token). |

## Memory Stats Format

The exporter expects stats in `Memory.stats` to be in a flat or nested format. Nested objects are automatically flattened using dot-separated keys.

### Supported Key Formats

```javascript
// Flat format (recommended)
Memory.stats = {
  "cpu.used": 15.5,
  "cpu.bucket": 9500,
  "room.W1N1.energy.storage": 500000,
  "profiler.subsystem.kernel.avg_cpu": 2.3
};

// Nested format (automatically flattened)
Memory.stats = {
  cpu: {
    used: 15.5,
    bucket: 9500
  },
  room: {
    W1N1: {
      energy: { storage: 500000 }
    }
  }
};
```

### Auto-generated Tags

The exporter automatically extracts meaningful tags from metric keys:
- `category`: First part of the key (e.g., `cpu`, `room`, `profiler`)
- `sub_category`: Room name or subsystem name when applicable
- `range`: Used for grouping related metrics

### Console log format

**JSON stats object format (current):**
The bot outputs the entire `Memory.stats` object as a single JSON line per tick:
```json
{"type":"stats","data":{"tick":12345,"cpu":{"used":15.5,"limit":20,"bucket":9847},"empire":{"rooms":3,"creeps":42},"rooms":{"W1N1":{"rcl":5}}}}
```

The exporter:
1. Parses the JSON line
2. Checks if `type === "stats"` and `data` exists
3. Flattens the nested `data` object (e.g., `cpu.used`, `room.W1N1.rcl`)
4. Sends all metrics to Grafana Cloud Graphite

This is the same flattening process used in memory mode, but with real-time data from console.

**Legacy formats (backward compatibility):**
- Single-stat JSON: `{"type": "stat", "key": "stats.cpu.used", "value": 15.5}`
- Text format: `stats:cpu 12.3 10s`

### Metric structure
Metrics are written to Grafana Cloud Graphite using the JSON format:
- Metric name: `{GRAFANA_CLOUD_GRAPHITE_PREFIX}.{metric_path}` (e.g., `screeps.stats.cpu.used`)
- Interval: Derived from `EXPORTER_POLL_INTERVAL_MS` (resolution for metric data points in seconds)
- Tags (as key=value pairs):
  - `stat`: The full stat name (e.g., `cpu.used`, `room.W1N1.energy.storage`)
  - `range`: The range label or extracted room/subsystem name
  - `category`: The category of the stat (e.g., `cpu`, `room`, `profiler`)
  - `sub_category`: Sub-category when present (e.g., room name, subsystem name)
  - `source`: Always `exporter`
- Value: numeric value of the stat
- Timestamp: Unix epoch timestamp in seconds

Example JSON payload:
```json
[
  {
    "name": "screeps.stats.cpu.used",
    "interval": 10,
    "value": 15.5,
    "time": 1702123456,
    "tags": ["source=exporter", "stat=cpu.used", "range=tick", "category=cpu"]
  }
]
```

For scrape success metrics:
- Metric name: `screeps.system.scrape_success`
- Tags:
  - `type`: `scrape_success`
  - `mode`: `memory` or `console`
  - `category`: `system`
  - `source`: `exporter`
- Value: 1 for success, 0 for failure

## Grafana Cloud Dashboard

You can create dashboards in Grafana Cloud that query the Graphite data source. Example queries:
- CPU usage: `screeps.stats.cpu.used`
- Room energy storage: `screeps.stats.room.*.energy.storage`
- Subsystem CPU: `screeps.stats.profiler.subsystem.*.avg_cpu`

## Development

```bash
npm install
npm run build
npm start
```

## Docker

Build a local image:

```bash
docker build -t screeps-graphite-exporter .
```

Run the exporter:

```bash
docker run -e SCREEPS_TOKEN=yourToken -e GRAFANA_CLOUD_GRAPHITE_URL=https://graphite-prod-01-eu-west-0.grafana.net/graphite/metrics -e GRAFANA_CLOUD_API_KEY=yourApiKey screeps-graphite-exporter
```

## Using with Docker Compose

The `screeps-server` package includes a docker-compose setup with the exporter pre-configured. See `packages/screeps-server/docker-compose.yml` for details.
