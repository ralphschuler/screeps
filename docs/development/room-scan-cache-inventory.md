# Room scan cache inventory

Issue: #3176 — use the framework `GameObjectCache` for remaining per-tick room scans.

## 2026-07-09 slice

This slice removes the bot-local `_ownedRooms` cache and routes these owned-room snapshots through `@ralphschuler/screeps-cache`:

- `packages/screeps-bot/src/SwarmBot.ts` — one owned-room snapshot feeds no-owned-room guard, task-board cadence, spawn planning, and visualization profile selection.
- `packages/screeps-bot/src/core/roomNode.ts` — `RoomManager.run()` and `RoomManager.runRoom()` share the framework same-tick owned-room snapshot.
- `packages/@ralphschuler/screeps-stats/src/memorySegmentStats.ts` — global stats room collection uses `getOwnedRooms()`.

Expected CPU impact: removes duplicate `Object.values(Game.rooms).filter(room => room.controller?.my)` work from high-frequency loop/stats paths. The live 2026-07-09 sample still showed CPU pressure in scout, market, expansion, stats, and remote-infrastructure processes, so this remains a staged cleanup rather than a single complete CPU fix.

## Remaining direct `Game.rooms` scan candidates

Intentional source of truth:

- `packages/@ralphschuler/screeps-cache/src/domains/GameObjectCache.ts` — owns `getOwnedRooms()` / `getVisibleRooms()`.

Runtime candidates for later #3176 slices:

- `packages/screeps-bot/src/empire/expansionManager.ts` — repeated owned-room scans across remote assignment, expansion readiness, target selection, and energy checks.
- `packages/screeps-bot/src/empire/empireManager.ts` — owned-room scans for expansion/objective checks.
- `packages/screeps-bot/src/empire/roomIntelManager.ts` — visible/owned-room scan queue setup.
- `packages/screeps-bot/src/empire/remoteInfrastructure.ts` — owned rooms with remote assignments.
- `packages/screeps-bot/src/core/coreProcessManager.ts` — pheromone/lab owned-room loops.
- `packages/screeps-bot/src/empire/clusterMonitor.ts` and `powerCreepManager.ts` — owned-room/power-spawn enumeration.
- `packages/screeps-bot/src/intershard/footprintOperation.ts` — intershard owned/spawn room and portal scans.
- `packages/screeps-defense/src/emergency/evacuationManager.ts` and `coordination/defenseCoordinator.ts` — helper/evacuation room scans.
- `packages/screeps-spawn/src/spawn-demand/claimerDemand.ts`, `defenseAssistDemand.ts`, and `pioneerDemand.ts` — spawn-demand room enumeration and assignment accounting.
- `packages/@ralphschuler/screeps-intershard/src/shardManager.ts` and `resourceTransferCoordinator.ts` — owned room/terminal source scans.
- `packages/@ralphschuler/screeps-remote-mining/src/paths/remotePathScheduler.ts` — owned-room remote path scheduling.
- `packages/@ralphschuler/screeps-empire/src/threat/threatPredictor.ts`, `pixel/pixelBuyingManager.ts`, and `nuke/targeting.ts` — empire strategy owned-room scans.

Test-only scans in `packages/screepsmod-testing/tests/` are not runtime cache targets.
