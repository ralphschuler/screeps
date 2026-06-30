# @ralphschuler/screeps-clusters

Framework package for multi-room colony coordination. `packages/screeps-bot` should consume this package instead of reimplementing cluster logic in the runtime layer.

## Responsibilities

- Cluster role/focus-room policy.
- Inter-room resource sharing and emergency energy routing.
- Military reservations, rally points, squad formation, and attack target selection.
- Defense assistance coordination across member rooms.
- Defense reinforcement spawn planning through `@ralphschuler/screeps-spawn` contracts.
- Offensive operation planning behind doctrine and alliance-safety checks.

## Defense assistance assignment

`ClusterManager` assigns idle military creeps from safe helper rooms to active `defenseRequests` before asking spawn policy to create new reinforcements.

Assignment rules:

- Recompute candidate defenders separately for each defense request.
- Never reuse a stale candidate list from another target room.
- Skip creeps already carrying `memory.assistTarget`.
- Use only non-spawning creeps with live role parts (`ATTACK`/`RANGED_ATTACK` for guards, `RANGED_ATTACK` for rangers, `HEAL` for healers).
- Fill requested roles independently (`guard`, `ranger`, `healer`) so extra nearby guards cannot consume ranger/healer demand.
- Stamp assigned creeps with `assistTarget`, `targetRoom`, `task: "defenseAssist"`, and local squad metadata.

## Public entry points

```ts
import { clusterManager, buildClusterOperationIntent } from "@ralphschuler/screeps-clusters";
```

Most implementation helpers stay internal. Add exports from `src/index.ts` only when another package needs a stable contract.

## Validation

```bash
npm test -w @ralphschuler/screeps-clusters
npm run build -w @ralphschuler/screeps-clusters
```

## Key dependencies

- `@ralphschuler/screeps-core` for logging/alliance-safe utilities.
- `@ralphschuler/screeps-defense` for threat and defense request analysis.
- `@ralphschuler/screeps-memory` for cluster memory schema.
- `@ralphschuler/screeps-spawn` for reinforcement spawn queue contracts.
- `@ralphschuler/screeps-kernel` and `@ralphschuler/screeps-stats` for process/runtime integration.

## License

Unlicense
