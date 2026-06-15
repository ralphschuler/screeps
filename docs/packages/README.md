# Package index

Framework packages own reusable behavior. `packages/screeps-bot` composes them into the deployed Screeps runtime.

| Package | Path | Responsibility | Key deps | Test/build |
| --- | --- | --- | --- | --- |
| `@ralphschuler/screeps-core` | `packages/@ralphschuler/screeps-core` | Core primitives, logging, events, CPU budget, alliance helpers. | none | `npm test -w @ralphschuler/screeps-core`; `npm run build -w @ralphschuler/screeps-core` |
| `@ralphschuler/screeps-cache` | `packages/@ralphschuler/screeps-cache` | TTL/LRU cache, cache coherence, room/object/body/role cache helpers. | core | `npm test -w @ralphschuler/screeps-cache` |
| `@ralphschuler/screeps-kernel` | `packages/@ralphschuler/screeps-kernel` | Process scheduler, priorities, CPU budgets, health/suspension events. | none | `npm test -w @ralphschuler/screeps-kernel` |
| `@ralphschuler/screeps-memory` | `packages/@ralphschuler/screeps-memory` | Typed Memory schema, migrations, heap cache, room/creep memory models. | core, stats | `npm test -w @ralphschuler/screeps-memory` |
| `@ralphschuler/screeps-stats` | `packages/@ralphschuler/screeps-stats` | Unified stats, process/room metrics, memory segment stats, adaptive budgets. | core | `npm test -w @ralphschuler/screeps-stats` |
| `@ralphschuler/screeps-console` | `packages/@ralphschuler/screeps-console` | Canonical console command registry, decorators, help generation, and command collections. | none | `npm test -w @ralphschuler/screeps-console` |
| `@ralphschuler/screeps-layouts` | `packages/@ralphschuler/screeps-layouts` | Canonical room blueprints, stamp planner/fallback, extension/lab/link/road planning, construction queue. | core | `npm test -w @ralphschuler/screeps-layouts` |
| `@ralphschuler/screeps-pathfinding` | `packages/@ralphschuler/screeps-pathfinding` | Path cache, portal routing, inter-room path helpers. | source-map | `npm test -w @ralphschuler/screeps-pathfinding` |
| `@ralphschuler/screeps-remote-mining` | `packages/@ralphschuler/screeps-remote-mining` | Remote room analysis, movement/path support, remote mining utilities. | core | `npm test -w @ralphschuler/screeps-remote-mining` |
| `@ralphschuler/screeps-roles` | `packages/@ralphschuler/screeps-roles` | Creep behavior/state contracts, action executor, role adapters, task board. | core, cache, defense, utils, cartographer | `npm test -w @ralphschuler/screeps-roles` |
| `@ralphschuler/screeps-spawn` | `packages/screeps-spawn` | Body planning, role definitions, spawn priorities, queue/pipeline, defense spawn policy. | core, cache, memory, defense, empire, intershard, utils | `npm test -w @ralphschuler/screeps-spawn` |
| `@ralphschuler/screeps-economy` | `packages/screeps-economy` | Links, terminals, market, factories, resource flow. | core, kernel, memory | `npm test -w @ralphschuler/screeps-economy` |
| `@ralphschuler/screeps-defense` | `packages/screeps-defense` | Alliance filtering, threat scoring, tower policy, safe mode, perimeter/ramparts, cluster defense. | core, kernel, layouts, memory, stats | `npm test -w @ralphschuler/screeps-defense` |
| `@ralphschuler/screeps-empire` | `packages/@ralphschuler/screeps-empire` | Empire-level planning, remotes, nukes, pixels, threats. | core, defense, economy, stats | `npm test -w @ralphschuler/screeps-empire` |
| `@ralphschuler/screeps-clusters` | `packages/@ralphschuler/screeps-clusters` | Colony clusters, resource sharing, defense reinforcement coordination. | core, defense, kernel, memory, spawn, stats | `npm test -w @ralphschuler/screeps-clusters` |
| `@ralphschuler/screeps-intershard` | `packages/@ralphschuler/screeps-intershard` | InterShardMemory schema, shard coordination, and cross-shard transfer lifecycle with injected runtime spawn ports. | core, kernel | `npm test -w @ralphschuler/screeps-intershard` |
| `@ralphschuler/screeps-pheromones` | `packages/@ralphschuler/screeps-pheromones` | Pheromone signal update/decay/diffusion helpers. | core, memory, utils | `npm test -w @ralphschuler/screeps-pheromones` |
| `@ralphschuler/screeps-chemistry` | `packages/screeps-chemistry` | Reactions, lab planning, boost/lab configuration. | none | `npm test -w @ralphschuler/screeps-chemistry` |
| `@ralphschuler/screeps-standards` | `packages/@ralphschuler/screeps-standards` | Screepers standards / terminal communication helpers. | core | `npm test -w @ralphschuler/screeps-standards` |
| `@ralphschuler/screeps-visuals` | `packages/@ralphschuler/screeps-visuals` | RoomVisual/MapVisual rendering helpers and budget dashboard. | core | `npm test -w @ralphschuler/screeps-visuals` |
| `@ralphschuler/screeps-utils` | `packages/screeps-utils` | Generic helpers: safe find, error mapping, random/weighted selection, optimization helpers. | core | `npm test -w @ralphschuler/screeps-utils` |
| `@ralphschuler/screeps-posis` | `packages/screeps-posis` | POSIS-compatible process/kernel interfaces and examples. | none | `npm test -w @ralphschuler/screeps-posis` |
| `screeps-typescript-starter` | `packages/screeps-bot` | Runtime composition, config, command registration adapters, Rollup bundle, Screeps upload. | all runtime framework packages | `npm test -w screeps-typescript-starter`; `npm run build -w screeps-typescript-starter` |
| `@ralphschuler/screeps-server` | `packages/screeps-server` | Dockerized Screeps private-server harness and smoke/long tests. | tooling only | `npm run test:smoke -w @ralphschuler/screeps-server` |
| `screepsmod-testing` | `packages/screepsmod-testing` | Private-server in-game assertion mod. | none | `npm run build -w screepsmod-testing` |

## Package API rules

- Export public APIs from `src/index.ts`.
- Keep implementation details unexported unless another package needs a stable contract.
- Add package tests for new public behavior.
- Keep package dependencies synchronized with `npm run sync:deps` / `npm run sync:deps:check`.
- Do not import from `packages/screeps-bot` in framework packages.
