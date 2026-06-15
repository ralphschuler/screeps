# Architecture overview

The bot uses a framework-first monorepo architecture. Reusable Screeps behavior lives in framework packages; `packages/screeps-bot` is the thin runtime composition layer that wires packages into the deployed bundle.

## Layers

1. **Empire / shard** — strategic goals, cross-shard coordination, expansion, war posture.
2. **Cluster / colony** — adjacent owned rooms plus remotes, shared logistics, defense assistance.
3. **Room** — local economy, spawn queue, construction, towers, memory, visuals.
4. **Creep / squad** — role state machines and action execution.
5. **Infrastructure** — kernel scheduling, cache, memory schema, stats, console commands.

## Package dependency direction

Dependencies should flow from high-level systems to lower-level primitives:

```text
screeps-bot
  -> roles/spawn/economy/defense/empire/clusters/visuals/console
    -> memory/cache/kernel/stats/pathfinding/layouts
      -> core
```

Rules:

- Framework packages must not import from `packages/screeps-bot`.
- `packages/screeps-bot` may adapt framework APIs to live Screeps runtime.
- Shared role/economy/spawn/defense/pathfinding/util logic belongs in packages, not bot-local copies.
- Public package APIs should be exported from `src/index.ts`; internals stay local.
- Avoid circular dependencies and sideways package tangles.

## Runtime loop lifecycle

1. Global reset/bootstrap: register config, commands, process classes, heap caches.
2. Tick start: refresh Memory schema/migrations, pre-tick movement/cache hooks.
3. Empire/cluster processes: strategic scans on bucket-aware intervals.
4. Room processes: economy, construction, defense, spawn planning.
5. Creep processes: role behavior/state transition, action execution, movement.
6. Observability: stats, CPU/process metrics, throttled logs, optional visuals.
7. Tick end: traffic reconciliation, cache cleanup, error isolation.

Errors in one room/process should be caught and reported without crashing the whole empire loop.

## Process/kernel model

`@ralphschuler/screeps-kernel` owns scheduling, priorities, CPU budgeting, suspension/recovery, and process events. Bot-local process managers adapt live room/creep/system processes into that kernel.

CPU strategy:

- Critical work runs every tick when possible.
- Medium/low frequency work is interval and bucket gated.
- Low bucket mode preserves spawn/mining/defense and skips expensive global planning.
- Process CPU metrics are emitted for observability.

## Memory and cache strategy

- `@ralphschuler/screeps-memory` owns typed Memory schema and migrations.
- `@ralphschuler/screeps-cache` owns heap/TTL/LRU cache primitives.
- Do not store live game objects in Memory; store IDs, room names, compact numbers, and timestamps.
- Heap cache may reset at any time; all systems must recover from global reset.
- Memory payloads must remain compact because parse/stringify is CPU-expensive.

## Layout and construction

Room layout planning is owned by `@ralphschuler/screeps-layouts`. The current target is a modular stamp planner with explicit fallback demand, not a brittle all-or-nothing bunker. See [Stamp blueprint planner](stamp-blueprint-planner.md).

## Core game systems

- **Economy:** static mining, hauling demand, links, storage, terminal, market in `screeps-economy` and role package behaviors.
- **Spawn:** body planning, priority scoring, queues, emergency defense in `screeps-spawn`.
- **Defense:** ally filtering, threat scoring, tower policy, safe mode, perimeter/ramparts in `screeps-defense`.
- **Pathfinding:** route/path/cache helpers in `screeps-pathfinding` and cache packages.
- **Roles:** behavior contracts and action execution in `screeps-roles`.
- **Visuals:** RoomVisual/MapVisual only in `screeps-visuals` or bot visualization adapters.
- **Console:** command registry/decorators/help generation in `screeps-console`; bot command modules only register runtime-specific commands.

## Safety invariant

`TooAngel` and `TedRoastBeef` are permanent allies. Targeting, tower, war, expansion, and hostile-classification logic must preserve ally filtering through shared core/defense helpers.

## Related ADRs

- [ADR-0004: Five-Layer Swarm Architecture](../adr/0004-five-layer-swarm-architecture.md)
- [ADR-0006: Cache Strategy and TTL Policy](../adr/0006-cache-strategy-and-ttl-policy.md)
- [ADR-0007: Spawn Queue Prioritization](../adr/0007-spawn-queue-prioritization.md)
- [ADR-0008: Tower Targeting Algorithm](../adr/0008-tower-targeting-algorithm.md)
- [ADR-0009: Console Command Registry Ownership](../adr/0009-console-command-registry-ownership.md)
- [ADR-0010: Intershard Spawn Port Injection](../adr/0010-intershard-spawn-port-injection.md)
