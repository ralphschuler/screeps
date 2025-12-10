# Console Stats Output Example

## Overview

The bot outputs statistics to the console in JSON format every tick. The graphite exporter subscribes to the console stream and parses these JSON lines to send metrics to Grafana Cloud.

## Example Console Output

Here's what you'll see in the Screeps console (one JSON object per tick containing all stats):

```json
{"type":"stats","data":{"tick":12345678,"timestamp":1702123456789,"cpu":{"used":15.23,"limit":20,"bucket":9847,"percent":76.15,"heap_mb":45.2},"gcl":{"level":3,"progress":500000,"progress_total":1000000,"progress_percent":50},"gpl":{"level":0},"empire":{"rooms":3,"creeps":42,"energy":{"storage":850000,"terminal":125000,"available":1650,"capacity":3300},"credits":125000},"rooms":{"W1N1":{"rcl":5,"energy":{"available":550,"capacity":550,"storage":350000,"terminal":50000},"controller":{"progress":125000,"progress_total":200000,"progress_percent":62.5},"creeps":15,"hostiles":0,"brain":{"danger":0,"posture_code":0,"colony_level_code":3},"pheromones":{"expand":0.1,"harvest":0.85,"build":0.3,"upgrade":0.6,"defense":0,"war":0,"siege":0,"logistics":0.4},"metrics":{"energy":{"harvested":150,"spawning":20,"construction":10,"repair":5,"tower":0,"available_for_sharing":10000,"capacity_total":500000,"need":0},"controller_progress":1250,"hostile_count":0,"damage_received":0,"construction_sites":2},"profiler":{"avg_cpu":2.45,"peak_cpu":3.1,"samples":1000}}},"subsystems":{"kernel":{"avg_cpu":1.2,"peak_cpu":1.5,"calls":1,"samples":1000},"rooms":{"avg_cpu":3.1,"peak_cpu":4.2,"calls":3,"samples":1000}},"roles":{"harvester":{"count":10,"avg_cpu":0.15,"peak_cpu":0.25,"calls":10,"samples":1000,"spawning_count":0,"idle_count":1,"active_count":9,"avg_ticks_to_live":1400,"total_body_parts":50},"upgrader":{"count":5,"avg_cpu":0.12,"peak_cpu":0.20,"calls":5,"samples":1000,"spawning_count":0,"idle_count":0,"active_count":5,"avg_ticks_to_live":1350,"total_body_parts":25}},"native":{"pathfinder_search":5,"move_to":42,"move":42,"harvest":120,"transfer":85,"withdraw":60,"build":15,"repair":10,"upgrade_controller":50,"attack":0,"ranged_attack":0,"heal":0,"dismantle":0,"say":0,"total":450},"processes":{"roomRunner_W1N1":{"name":"Room Runner: W1N1","priority":75,"frequency":"high","state":"idle","total_cpu":5.5,"run_count":100,"avg_cpu":0.055,"max_cpu":0.15,"last_run_tick":12345678,"skipped_count":5,"error_count":0,"cpu_budget":0.1,"min_bucket":1000}},"creeps":{"harvester1":{"role":"harvester","home_room":"W1N1","current_room":"W1N1","cpu":0.15,"action":"harvesting","ticks_to_live":1500,"hits":100,"hits_max":100,"body_parts":5,"fatigue":0,"actions_this_tick":2}}}}
```

## Format Specification

The console output is a single JSON object per tick with these fields:

- **type** (string, required): Always `"stats"` to identify this as a stats object
- **data** (object, required): The complete `Memory.stats` object containing all metrics in nested structure

## How the Exporter Processes Stats

The graphite exporter (in console mode):

1. Connects to the Screeps server via WebSocket
2. Subscribes to console events
3. For each console line received:
   - Attempts to parse as JSON
   - Checks if `type === "stats"` and `data` exists
   - Flattens the nested `data` object into dot-separated keys (e.g., `cpu.used`, `room.W1N1.rcl`)
   - Extracts room names and subsystem names for tagging
   - Sends all metrics to Grafana Cloud Graphite
4. Flushes metrics every 15 seconds

This approach is identical to how the memory polling mode works, but gets data in real-time from console instead of polling the API.

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
