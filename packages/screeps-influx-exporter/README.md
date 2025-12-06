# Screeps InfluxDB Exporter

Exports Screeps stats to InfluxDB from either `Memory.stats` or console log output.

## Features
- **Memory mode**: periodically fetches `Memory.stats` and sends metrics to InfluxDB.
- **Console mode**: subscribes to Screeps console logs and parses lines formatted as `stats:<key> <value> <range>`.
- Uses InfluxDB v2 line protocol via the official client library.

## Configuration
All configuration is provided via environment variables. Authentication requires either `SCREEPS_TOKEN` or the combination of `SCREEPS_USERNAME` and `SCREEPS_PASSWORD`.

| Variable | Default | Description |
| --- | --- | --- |
| `EXPORTER_MODE` | `memory` | Set to `memory` or `console`. |
| `EXPORTER_POLL_INTERVAL_MS` | `15000` | Poll interval for memory mode. |
| `EXPORTER_MEMORY_PATH` | `stats` | Memory path to read stats from. |
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
  - `stat`: The stat name (e.g., `cpu`, `bucket`)
  - `range`: The range label (e.g., `memory`, `tick`, `10s`)
  - `source`: Always `exporter`
- Field: `value` (numeric value of the stat)

For scrape success metrics:
- Tags:
  - `type`: `scrape_success`
  - `mode`: `memory` or `console`
- Field: `value` (1 for success, 0 for failure)

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
