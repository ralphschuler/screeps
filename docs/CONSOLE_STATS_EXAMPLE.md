# Console Stats Output Example

## Overview

The bot outputs statistics to the console in JSON format every tick. The graphite exporter subscribes to the console stream and parses these JSON lines to send metrics to Grafana Cloud.

## Example Console Output

Here's what you'll see in the Screeps console (one line per stat):

```json
{"type":"stat","key":"stats.cpu.used","value":15.23}
{"type":"stat","key":"stats.cpu.limit","value":20}
{"type":"stat","key":"stats.cpu.bucket","value":9847}
{"type":"stat","key":"stats.cpu.percent","value":76.15}
{"type":"stat","key":"stats.cpu.heap_mb","value":45.2}
{"type":"stat","key":"stats.gcl.level","value":3}
{"type":"stat","key":"stats.gcl.progress","value":500000}
{"type":"stat","key":"stats.gcl.progress_total","value":1000000}
{"type":"stat","key":"stats.gcl.progress_percent","value":50}
{"type":"stat","key":"stats.empire.rooms","value":3}
{"type":"stat","key":"stats.empire.creeps","value":42}
{"type":"stat","key":"stats.empire.energy.storage","value":850000}
{"type":"stat","key":"stats.empire.credits","value":125000}
{"type":"stat","key":"stats.room.W1N1.rcl","value":5}
{"type":"stat","key":"stats.room.W1N1.energy.available","value":550}
{"type":"stat","key":"stats.room.W1N1.energy.capacity","value":550}
{"type":"stat","key":"stats.room.W1N1.energy.storage","value":350000}
{"type":"stat","key":"stats.room.W1N1.pheromones.harvest","value":0.85}
{"type":"stat","key":"stats.room.W1N1.pheromones.build","value":0.3}
{"type":"stat","key":"stats.room.W1N1.profiler.avg_cpu","value":2.45}
{"type":"stat","key":"stats.subsystem.kernel.avg_cpu","value":1.2}
{"type":"stat","key":"stats.subsystem.rooms.avg_cpu","value":3.1}
{"type":"stat","key":"stats.role.harvester.count","value":10}
{"type":"stat","key":"stats.role.harvester.avg_cpu","value":0.15}
{"type":"stat","key":"stats.role.upgrader.count","value":5}
{"type":"stat","key":"stats.native.harvest","value":120}
{"type":"stat","key":"stats.native.transfer","value":85}
{"type":"stat","key":"stats.native.total","value":450}
```

## Format Specification

Each stat line is a JSON object with these fields:

- **type** (string, required): Always `"stat"` to identify this as a stat line
- **key** (string, required): The metric name in dot-separated format (e.g., `"stats.cpu.used"`)
- **value** (number, required): The numeric value of the metric
- **unit** (string, optional): An optional unit/range tag for the metric

## How the Exporter Processes Stats

The graphite exporter (in console mode):

1. Connects to the Screeps server via WebSocket
2. Subscribes to console events
3. For each console line received:
   - Attempts to parse as JSON
   - Checks if `type === "stat"` and `key` and `value` exist
   - Extracts metric information and sends to Grafana Cloud Graphite
4. Flushes metrics every 15 seconds

## Configuration

To use console mode in the graphite exporter:

```bash
# Set in .env file
EXPORTER_MODE=console
SCREEPS_TOKEN=your_token_here
GRAFANA_CLOUD_GRAPHITE_URL=https://graphite-prod-01-eu-west-0.grafana.net/graphite/metrics
GRAFANA_CLOUD_API_KEY=your_api_key_here
```

## Advantages Over Memory Polling

1. **Real-time**: Stats are available immediately, not delayed by polling interval
2. **No API limits**: WebSocket connections don't count against API rate limits
3. **Lower latency**: Stats appear in Grafana within seconds instead of minutes
4. **No missed data**: Captures every tick's stats, not just sampled polls
5. **More efficient**: One persistent WebSocket vs many HTTP requests

## Backward Compatibility

The bot still writes stats to `Memory.stats` for backward compatibility. You can switch between console and memory mode in the exporter without changing bot code.
