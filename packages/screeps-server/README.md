# Screeps Server Setup

This package contains a Docker Compose configuration for running a local Screeps private server with integrated monitoring via Grafana Cloud, **plus comprehensive test infrastructure** for validating bot performance and framework packages.

## Quick Start

### Local Development Server

1. Copy `.env.example` to `.env` and configure the required values:
   ```bash
   cp .env.example .env
   ```

2. Set the required environment variables:
   - `STEAM_KEY`: Your Steam API key
   - `MAPTOOL_PASS`: Password for the map tool
   - `GRAFANA_CLOUD_GRAPHITE_URL`: Your Grafana Cloud Graphite endpoint URL
   - `GRAFANA_CLOUD_API_KEY`: Your Grafana Cloud API key
   - Bot credentials: Either `SCREEPS_TOKEN` or `SCREEPS_BOT_USERNAME` + `SCREEPS_BOT_PASSWORD`

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Access the services:
   - Screeps Server: http://localhost:21025
   - Grafana Cloud: Access your Grafana Cloud instance to view dashboards

### Test Infrastructure

This package includes comprehensive test infrastructure for validating bot performance:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:integration    # Bot lifecycle and functionality
npm run test:performance    # CPU budget validation
npm run test:packages       # Framework package tests

# Run with coverage
npm run test:coverage
```

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for complete testing documentation.

## Test Infrastructure

### Overview

The test infrastructure validates:

- **Integration**: Bot spawns, runs, and performs expected behavior
- **Performance**: CPU usage stays within ROADMAP.md targets (≤0.1 CPU for eco rooms)
- **Packages**: Framework packages load and function correctly
- **Regression**: Automated detection of performance degradation

### Test Scenarios

Predefined scenarios aligned with ROADMAP.md:

| Scenario | Target | Description |
|----------|--------|-------------|
| Empty Room | ≤0.05 CPU | Fresh spawn initialization |
| Single Eco Room | ≤0.1 CPU | Basic economy (RCL 4) |
| Five Room Empire | ≤0.5 CPU | Multi-room coordination |
| Combat | ≤0.25 CPU | Active defense |

### CI Integration

Tests run automatically on:
- Pull requests
- Pushes to main/develop
- Manual workflow dispatch

Results are posted as PR comments with:
- Test pass/fail status
- CPU metrics vs targets
- Performance regression detection
- Framework package validation

## Services

- **screeps**: Screeps private server using screeps-launcher
- **mongo**: MongoDB database for Screeps
- **redis**: Redis for Screeps caching
- **screeps-exporter**: Exports Screeps stats from Memory to Grafana Cloud Graphite

## Getting Started

1. Copy `.env.example` to `.env` and configure the required values:
   ```bash
   cp .env.example .env
   ```

2. Set the required environment variables:
   - `STEAM_KEY`: Your Steam API key
   - `MAPTOOL_PASS`: Password for the map tool
   - `GRAFANA_CLOUD_GRAPHITE_URL`: Your Grafana Cloud Graphite endpoint URL
   - `GRAFANA_CLOUD_API_KEY`: Your Grafana Cloud API key
   - Bot credentials: Either `SCREEPS_TOKEN` or `SCREEPS_BOT_USERNAME` + `SCREEPS_BOT_PASSWORD`

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Access the services:
   - Screeps Server: http://localhost:21025
   - Grafana Cloud: Access your Grafana Cloud instance to view dashboards

## Monitoring Setup

### Grafana Cloud Dashboards

Create dashboards in your Grafana Cloud instance to visualize:

- **CPU Performance**: CPU usage, bucket level, and percentage
- **Profiler Subsystems**: Stacked CPU usage by subsystem (rooms, kernel, spawns, creeps, etc.)
- **Profiler Rooms**: Per-room CPU usage tracking
- **Empire Statistics**: Total creeps, rooms, GCL, GPL levels
- **Energy Statistics**: Storage and terminal energy across all rooms
- **Controller Progress**: Per-room controller upgrade progress

Example Graphite queries:
- CPU usage: `screeps.stats.cpu.used`
- Room energy: `screeps.stats.room.*.energy.storage`
- Subsystem CPU: `screeps.stats.profiler.subsystem.*.avg_cpu`

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

### Grafana Cloud Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `GRAFANA_CLOUD_GRAPHITE_URL` | - | Grafana Cloud Graphite endpoint (required) |
| `GRAFANA_CLOUD_API_KEY` | - | Grafana Cloud API key (required) |
| `GRAFANA_CLOUD_GRAPHITE_PREFIX` | screeps | Prefix for all metrics |

### Exporter Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPORTER_MODE` | memory | Mode: `memory` or `console` |
| `EXPORTER_POLL_INTERVAL_MS` | 15000 | Poll interval in milliseconds |
| `EXPORTER_MEMORY_PATH` | stats | Memory path to read stats from |
| `EXPORTER_SHARD` | shard0 | Shard to read from |

## Creating Dashboards in Grafana Cloud

To create dashboards:
1. Log into your Grafana Cloud instance
2. Add a Graphite data source if not already configured
3. Create a new dashboard
4. Add panels with Graphite queries (see examples above)
5. Save and share your dashboard

## Volumes

The following Docker volumes are used for persistence:

- `redis-data`: Redis data
- `mongo-data`: MongoDB data  
- `screeps-data`: Screeps server data

## Troubleshooting

### No data in Grafana Cloud
1. Check that the bot is running and publishing to `Memory.stats`
2. Verify exporter logs: `docker-compose logs screeps-exporter`
3. Check Grafana Cloud API key and endpoint URL are correct
4. Verify metrics are being sent by checking exporter logs for "Sent X metrics"

### Exporter failing to connect to Screeps
1. Ensure bot credentials are set in `.env`
2. For private servers, set `SCREEPS_PROTOCOL=http` and correct host/port

### Exporter failing to send to Grafana Cloud
1. Verify `GRAFANA_CLOUD_GRAPHITE_URL` is correct
2. Check `GRAFANA_CLOUD_API_KEY` is valid
3. Review exporter logs for specific error messages
