# Console Stats Output Example

## Overview

The bot outputs statistics to the console in JSON format every tick. These lines can be inspected locally or consumed by custom tooling outside this repository. The built-in Grafana Graphite/Loki exporter packages have been removed.

## Example Console Output

Here's what you'll see in the Screeps console (one JSON object per tick containing all stats):

```json
{"type":"stats","data":{"tick":12345678,"timestamp":1702123456789,"cpu":{"used":15.23,"limit":20,"bucket":9847,"percent":76.15,"heap_mb":45.2},"gcl":{"level":3,"progress":500000,"progress_total":1000000,"progress_percent":50},"rooms":{"W1N1":{"rcl":5,"energy":{"available":550,"capacity":550},"creeps":15,"hostiles":0}}}}
```

## Format Specification

The console output is a single JSON object per tick with these fields:

- **type** (string, required): Always `"stats"` to identify this as a stats object.
- **data** (object, required): The complete `Memory.stats` object containing all metrics in nested structure.

## Local Consumption

Stats are also written to `Memory.stats` for compatibility with local inspection, private-server validation, and custom external tooling.
