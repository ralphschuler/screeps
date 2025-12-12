# Screeps Loki Exporter

This package exports Screeps bot logs to Grafana Loki by continuously listening to the Screeps console WebSocket.

## Features

- **Real-time streaming**: Connects to Screeps console WebSocket for continuous log streaming
- **JSON log parsing**: Parses JSON-formatted logs from the bot
- **Stat filtering**: Automatically filters out stat logs (type="stat") which are handled by the graphite exporter
- **Batching**: Batches logs for efficient Loki push operations
- **Label support**: Adds labels for level, subsystem, room, and custom labels
- **No rate limits**: Uses console streaming instead of memory polling to avoid API rate limits

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure environment variables:
```bash
# Screeps authentication (use token OR username+password)
SCREEPS_TOKEN=your_token_here
# OR
SCREEPS_USERNAME=your_username
SCREEPS_PASSWORD=your_password

# Grafana Loki configuration
GRAFANA_LOKI_URL=https://logs-prod-012.grafana.net/loki/api/v1/push
GRAFANA_LOKI_USERNAME=123456
GRAFANA_LOKI_API_KEY=your_api_key_here

# Optional
LOKI_EXTRA_LABELS=env:production,game:screeps
LOKI_BATCH_SIZE=100
LOKI_BATCH_INTERVAL_MS=5000
```

3. Install dependencies:
```bash
npm install
```

4. Build the exporter:
```bash
npm run build
```

5. Run the exporter:
```bash
npm start
```

## How It Works

1. The exporter connects to the Screeps console WebSocket
2. It receives console messages in real-time
3. JSON-formatted log messages are parsed
4. Logs with `type: "log"` are sent to Loki
5. Logs with `type: "stat"` are filtered out (handled by graphite-exporter)
6. Logs are batched and sent to Loki with appropriate labels
7. Timestamps are set to the current real-world time (when logs are received)
8. Game tick numbers are included in the log message for correlation with in-game events

## Bot Integration

Your Screeps bot should use the updated logger that outputs JSON format:

```typescript
import { logger } from './core/logger';

// Regular logs (sent to Loki)
logger.info('Spawning harvester', { room: 'E1S1', subsystem: 'spawn' });
logger.error('Failed to spawn creep', { room: 'E1S1', subsystem: 'spawn' });

// Stats (filtered by Loki exporter, sent to Graphite)
logger.stat('energy.harvested', 1000, 'E1S1');
logger.stat('cpu.used', 15.5);
```

## Labels in Loki

Each log entry is tagged with labels:
- `level`: debug, info, warn, error
- `type`: log (stats are filtered out)
- `subsystem`: optional subsystem name
- `room`: optional room name
- Any custom labels from `LOKI_EXTRA_LABELS`

You can query logs in Grafana using LogQL:
```logql
{level="error"}
{subsystem="spawn", room="E1S1"}
{level="warn"} |= "CPU"
{level="info"} |= "tick:12345"  # Find logs from a specific game tick
```

**Note on Timestamps**: The exporter uses real-world timestamps (when logs are received) rather than game tick numbers. This ensures logs have valid, current timestamps in Loki. Game tick numbers are preserved in the log message itself as `[tick:XXXXX]` for correlation with in-game events.

## Docker Support

You can run the exporter in Docker:

```bash
docker build -t screeps-loki-exporter .
docker run --env-file .env screeps-loki-exporter
```

## Comparison with Graphite Exporter

- **Graphite Exporter**: Polls memory for stats (type="stat"), sends metrics to Graphite
- **Loki Exporter**: Streams console for logs (type="log"), sends logs to Loki
- Both can run simultaneously using console mode to avoid rate limits
