# Screeps Prometheus Exporter

Exports Screeps stats as Prometheus metrics from either `Memory.stats` or console log output.

## Features
- **Memory mode**: periodically fetches `Memory.stats` and emits gauges.
- **Console mode**: subscribes to Screeps console logs and parses lines formatted as `stats:<key> <value> <range>`.
- Exposes `/metrics` (Prometheus format) and a small JSON info endpoint on `/`.

## Configuration
All configuration is provided via environment variables. Authentication requires either `SCREEPS_TOKEN` or the combination of `SCREEPS_USERNAME` and `SCREEPS_PASSWORD`.

| Variable | Default | Description |
| --- | --- | --- |
| `EXPORTER_MODE` | `memory` | Set to `memory` or `console`. |
| `EXPORTER_PORT` | `9100` | Port for the HTTP server. |
| `EXPORTER_METRICS_PATH` | `/metrics` | HTTP path for Prometheus metrics. |
| `EXPORTER_POLL_INTERVAL_MS` | `15000` | Poll interval for memory mode. |
| `EXPORTER_MEMORY_PATH` | `stats` | Memory path to read stats from. |
| `EXPORTER_SHARD` | `shard0` | Shard to read from when polling memory. |
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

## Development

```bash
npm install
npm run build
npm start
```

## Docker
Build a local image:

```bash
docker build -t screeps-prometheus-exporter .
```

Run the exporter:

```bash
docker run -e SCREEPS_TOKEN=yourToken -p 9100:9100 screeps-prometheus-exporter
```
