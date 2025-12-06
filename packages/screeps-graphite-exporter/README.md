# Screeps Graphite Exporter

Exports Screeps stats to Graphite from either `Memory.stats` or console log output.

## Features
- **Memory mode**: periodically fetches `Memory.stats` and sends metrics to Graphite.
- **Console mode**: subscribes to Screeps console logs and parses lines formatted as `stats:<key> <value> <range>`.
- Uses Graphite plaintext protocol for pushing metrics.

## Configuration
All configuration is provided via environment variables. Authentication requires either `SCREEPS_TOKEN` or the combination of `SCREEPS_USERNAME` and `SCREEPS_PASSWORD`.

| Variable | Default | Description |
| --- | --- | --- |
| `EXPORTER_MODE` | `memory` | Set to `memory` or `console`. |
| `EXPORTER_POLL_INTERVAL_MS` | `15000` | Poll interval for memory mode. |
| `EXPORTER_MEMORY_PATH` | `stats` | Memory path to read stats from. |
| `EXPORTER_SHARD` | `shard0` | Shard to read from when polling memory. |
| `GRAPHITE_HOST` | `localhost` | Graphite Carbon host. |
| `GRAPHITE_PORT` | `2003` | Graphite Carbon plaintext port. |
| `GRAPHITE_PREFIX` | `screeps` | Metric name prefix. |
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

### Metric naming
Metrics are sent to Graphite with the following naming convention:
- Stats: `{prefix}.stat.{stat_name}.{range}`
- Scrape success: `{prefix}.exporter.scrape_success.{mode}`

For example, with the default prefix `screeps`:
- `screeps.stat.cpu.memory`
- `screeps.stat.bucket.tick`
- `screeps.exporter.scrape_success.memory`

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
docker run -e SCREEPS_TOKEN=yourToken -e GRAPHITE_HOST=graphite screeps-graphite-exporter
```
