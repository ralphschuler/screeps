# Screeps Server Setup

This package contains a Docker Compose configuration for running a local Screeps private server with integrated monitoring via InfluxDB and Grafana.

## Services

- **screeps**: Screeps private server using screeps-launcher
- **mongo**: MongoDB database for Screeps
- **redis**: Redis for Screeps caching
- **influxdb**: InfluxDB v2 for time-series metrics storage
- **grafana**: Grafana for visualization and dashboards
- **screeps-exporter**: Exports Screeps stats from Memory to InfluxDB

## Getting Started

1. Copy `.env.example` to `.env` and configure the required values:
   ```bash
   cp .env.example .env
   ```

2. Set the required environment variables:
   - `STEAM_KEY`: Your Steam API key
   - `MAPTOOL_PASS`: Password for the map tool
   - Bot credentials: Either `SCREEPS_TOKEN` or `SCREEPS_BOT_USERNAME` + `SCREEPS_BOT_PASSWORD`

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Access the services:
   - Screeps Server: http://localhost:21025
   - Grafana: http://localhost:3000 (default login: admin/admin)
   - InfluxDB: http://localhost:8086

## Monitoring Setup

### Pre-configured Dashboard

A Grafana dashboard is automatically provisioned at `grafana/provisioning/dashboards/screeps-ant-swarm.json`. It includes:

- **CPU Performance**: CPU usage, bucket level, and percentage
- **Profiler Subsystems**: Stacked CPU usage by subsystem (rooms, kernel, spawns, creeps, etc.)
- **Profiler Rooms**: Per-room CPU usage tracking
- **Empire Statistics**: Total creeps, rooms, GCL, GPL levels
- **Energy Statistics**: Storage and terminal energy across all rooms
- **Controller Progress**: Per-room controller upgrade progress

### Stats Format

The Screeps bot publishes stats to `Memory.stats` in a flat format with dot-separated keys:

```javascript
Memory.stats = {
  "cpu.used": 15.5,
  "cpu.bucket": 9500,
  "cpu.percent": 77.5,
  "gcl.level": 8,
  "empire.creeps": 45,
  "room.W1N1.rcl": 8,
  "room.W1N1.storage.energy": 500000,
  "profiler.subsystem.kernel.avg_cpu": 2.3,
  // ... etc
};
```

## Configuration

### InfluxDB Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `INFLUXDB_USERNAME` | admin | Initial admin username |
| `INFLUXDB_PASSWORD` | screeps-password | Initial admin password |
| `INFLUXDB_ORG` | screeps | Organization name |
| `INFLUXDB_BUCKET` | screeps | Default bucket |
| `INFLUXDB_TOKEN` | screeps-influxdb-token | API token |

### Grafana Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `GRAFANA_ADMIN_USER` | admin | Admin username |
| `GRAFANA_ADMIN_PASSWORD` | admin | Admin password |

### Exporter Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPORTER_MODE` | memory | Mode: `memory` or `console` |
| `EXPORTER_POLL_INTERVAL_MS` | 15000 | Poll interval in milliseconds |
| `EXPORTER_MEMORY_PATH` | stats | Memory path to read stats from |
| `EXPORTER_SHARD` | shard0 | Shard to read from |

## Customizing the Dashboard

The Grafana dashboard can be customized by editing `grafana/provisioning/dashboards/screeps-ant-swarm.json`. Changes will be picked up automatically within 30 seconds.

To create a custom dashboard:
1. Log into Grafana
2. Create your dashboard
3. Export it as JSON
4. Save it to `grafana/provisioning/dashboards/`

## Volumes

The following Docker volumes are used for persistence:

- `redis-data`: Redis data
- `mongo-data`: MongoDB data  
- `screeps-data`: Screeps server data
- `influxdb-data`: InfluxDB data
- `influxdb-config`: InfluxDB configuration
- `grafana-data`: Grafana dashboards and settings

## Troubleshooting

### No data in Grafana
1. Check that the bot is running and publishing to `Memory.stats`
2. Verify exporter logs: `docker-compose logs screeps-exporter`
3. Check InfluxDB is receiving data: `docker-compose logs influxdb`

### Exporter failing to connect
1. Ensure bot credentials are set in `.env`
2. For private servers, set `SCREEPS_PROTOCOL=http` and correct host/port

### Dashboard not loading
1. Check Grafana logs: `docker-compose logs grafana`
2. Verify datasource is configured correctly
