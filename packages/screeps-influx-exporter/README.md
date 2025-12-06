# Screeps InfluxDB Exporter

Exports Screeps stats to InfluxDB from either `Memory.stats` or console log output.

## Features
- **Memory mode**: periodically fetches `Memory.stats` and sends metrics to InfluxDB.
- **Console mode**: subscribes to Screeps console logs and parses lines formatted as `stats:<key> <value> <range>`.
- Uses InfluxDB v2 line protocol via the official client library.
- Supports nested stats objects with automatic flattening.
- Extracts room and subsystem information from metric keys for better tagging.
- Optional full-memory export for deep debugging/visualization use-cases.

## Configuration
All configuration is provided via environment variables. Authentication requires either `SCREEPS_TOKEN` or the combination of `SCREEPS_USERNAME` and `SCREEPS_PASSWORD`.

| Variable | Default | Description |
| --- | --- | --- |
| `EXPORTER_MODE` | `memory` | Set to `memory` or `console`. |
| `EXPORTER_POLL_INTERVAL_MS` | `15000` | Poll interval for memory mode. |
| `EXPORTER_MEMORY_PATH` | `stats` | Memory path to read stats from. |
| `EXPORTER_MEMORY_FULL` | `false` | When `true`, flatten the entire Memory payload instead of only `Memory.stats`. |
| `EXPORTER_SHARD` | `shard0` | Shard to read from when polling memory. |
| `INFLUXDB_URL` | `http://localhost:8086` | InfluxDB server URL. |
| `INFLUXDB_TOKEN` | _none_ | InfluxDB authentication token (required). |
| `INFLUXDB_ORG` | `screeps` | InfluxDB organization. |
| `INFLUXDB_BUCKET` | `screeps` | InfluxDB bucket to write metrics to. |
| `INFLUXDB_MEASUREMENT` | `screeps` | InfluxDB measurement name for metrics. |
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
Console mode expects log lines like:

```
stats:cpu 12.3 10s
stats:bucket 9500 tick
```

The exporter treats the first token as the stat name, the second as a numeric value, and the optional third token as the range label.

### Metric structure
Metrics are written to InfluxDB with the following structure:
- Measurement: `{INFLUXDB_MEASUREMENT}` (default: `screeps`)
- Tags:
  - `stat`: The full stat name (e.g., `cpu.used`, `room.W1N1.energy.storage`)
  - `range`: The range label or extracted room/subsystem name
  - `category`: The category of the stat (e.g., `cpu`, `room`, `profiler`)
  - `sub_category`: Sub-category when present (e.g., room name, subsystem name)
  - `source`: Always `exporter`
- Field: `value` (numeric value of the stat)

For scrape success metrics:
- Tags:
  - `type`: `scrape_success`
  - `mode`: `memory` or `console`
  - `category`: `system`
- Field: `value` (1 for success, 0 for failure)

## Grafana Dashboard

A pre-built Grafana dashboard is included in the `screeps-server` package at `grafana/provisioning/dashboards/screeps-ant-swarm.json`. It visualizes:
- CPU usage and bucket status
- Profiler subsystem performance (stacked view)
- Per-room CPU usage
- Empire statistics (creeps, rooms, GCL, GPL)
- Energy storage across rooms
- Controller progress tracking

## Development

```bash
npm install
npm run build
npm start
```

## Docker

Build a local image:

```bash
docker build -t screeps-influx-exporter .
```

Run the exporter:

```bash
docker run -e SCREEPS_TOKEN=yourToken -e INFLUXDB_URL=http://influxdb:8086 -e INFLUXDB_TOKEN=yourInfluxToken screeps-influx-exporter
```

## Using with Docker Compose

The `screeps-server` package includes a complete docker-compose setup with InfluxDB, Grafana, and the exporter pre-configured. See `packages/screeps-server/docker-compose.yml` for details.
