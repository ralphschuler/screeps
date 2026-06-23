## Read-only scout result

No edits made.

### Git status: relevant paths

Dirty before/after scout; not from me:

- `M package.json` — pheromones script additions
- `M packages/@ralphschuler/screeps-roles/test/behaviorContracts.test.ts` — remoteWorker tests
- `M packages/@ralphschuler/screeps-roles/test/targetAssignmentManager.test.ts` — build-target test

Clean:

- `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`

### Recommended touched files

For low-risk patrol refactor:

1. `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`
   - remove patrol helper block
   - import helpers

2. `packages/@ralphschuler/screeps-roles/src/behaviors/military/patrol.ts` **new**
   - move:
     - `PATROL_CACHE_NAMESPACE`
     - `PATROL_WAYPOINT_TTL`
     - `CachedPatrolWaypoints`
     - `getPatrolWaypoints`
     - `getNextPatrolWaypoint`

3. `packages/@ralphschuler/screeps-roles/test/militaryPatrol.test.ts` **new optional**
   - focused tests for waypoint generation, wall filtering, patrol index wrap
   - mock `room.getTerrain()`

No `src/index.ts` export needed; keep internal.

### Behavior contract to preserve

From `military.ts`:

- cache namespace `patrol`, TTL `1000`
- cache key `room.name`
- invalidation only by `spawnCount`
- cached waypoints stored as plain `{ x, y, roomName }`
- reconstruct `RoomPosition` on cache hit
- waypoint order unchanged:
  - spawn offsets `+3,+3` and `-3,-3`
  - exits: top/bottom/left/right fixed points
  - corners
  - center `(25,25)`
- clamp to `2..47`
- filter walls via `room.getTerrain().get(x, y) !== TERRAIN_MASK_WALL`
- `patrolIndex` init `0`
- advance when `creep.pos.getRangeTo(currentWaypoint) <= 2`
- roles still return `{ type: "moveTo", target: nextWaypoint }` when idle/no target
- preserve alliance safety: use `getActualHostile*`, `isAllyPlayer`, `isAllyControlledRoom`; never target TooAngel/TedRoastBeef.

### Validation performed

Ran:

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military"
```

Result: `14 passing`.

Skipped build to avoid read-only `dist/` writes.

### Recommended validation after edit

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military|patrol"
npm run lint:roles
npm run build:roles
npm run check:alliance-safety
```

### Risks

- `RoomPosition` constructor throws if x/y out of bounds. Current spawn-offset code creates `RoomPosition` before clamp; edge spawn could throw. Fixing this is safer but not pure refactor—test it if changed.
- `test/setup.ts` `createMockRoom()` lacks default `getTerrain`; patrol tests must mock it or setup change will affect many tests.
- Cache only checks spawn count, not spawn positions/terrain changes. Preserve unless intentionally changing behavior.
- Existing dirty test files may conflict with follow-up edits.