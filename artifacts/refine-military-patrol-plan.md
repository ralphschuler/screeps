## Findings

- Dirty tree is broad. Observed target `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts` is **not dirty**.
- Patrol logic currently private in `src/behaviors/military.ts`:
  - waypoint generation/cache: `getPatrolWaypoints`
  - index advance: `getNextPatrolWaypoint`
- Do **not** touch dirty package index/barrel files. Use internal test import.

## Assumptions

- New focused module allowed:  
  `packages/@ralphschuler/screeps-roles/src/behaviors/military/patrolWaypoints.ts`
- No public API export needed.
- Preserve exact behavior:
  - cache namespace `"patrol"`
  - TTL `1000`
  - cache key `room.name`
  - invalidation by `spawnCount`
  - waypoint order, clamp `2..47`, wall filter
  - `patrolIndex` init/advance/wrap semantics

## Planned files

- Modify: `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`
- Add: `packages/@ralphschuler/screeps-roles/src/behaviors/military/patrolWaypoints.ts`
- Add: `packages/@ralphschuler/screeps-roles/test/militaryPatrolWaypoints.test.ts`

## Phase plan

### 0. Guardrail / stop check

```bash
git status --short
git status --short -- \
  packages/@ralphschuler/screeps-roles/src/behaviors/military.ts \
  packages/@ralphschuler/screeps-roles/src/behaviors/military \
  packages/@ralphschuler/screeps-roles/test/militaryPatrolWaypoints.test.ts
```

Stop if any target path already dirty/untracked.

### 1. RED: module characterization tests

Add `militaryPatrolWaypoints.test.ts`.

Tests:
- exact generated waypoint order for one spawn at `(25,25)`
- clamp + wall filtering
- cache hit keeps same waypoints with same spawn count
- cache invalidates when spawn count changes
- empty waypoint list returns `null` and does not set `patrolIndex`
- far creep initializes `patrolIndex = 0`
- range `<= 2` advances to next waypoint
- last waypoint wraps to `0`

Expected RED:

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military patrol waypoints"
```

Fails because module does not exist.

### 2. GREEN: exact extraction

Create `src/behaviors/military/patrolWaypoints.ts`.

Move only:
- patrol constants
- patrol cache interfaces
- `getPatrolWaypoints`
- `getNextPatrolWaypoint`

Update `military.ts` import:

```ts
import { getNextPatrolWaypoint, getPatrolWaypoints } from "./military/patrolWaypoints";
```

Run:

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military patrol waypoints"
```

### 3. Refactor inside focused module only

Small cleanup only:
- private helpers for serialize/deserialize waypoints
- private static waypoint coordinate list
- private clamp/filter helper

No behavior changes. No call-site behavior changes.

Run:

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military patrol waypoints"
npm test -w @ralphschuler/screeps-roles -- --grep "military"
```

### 4. Final validation

```bash
npm run lint -w @ralphschuler/screeps-roles
npm run build -w @ralphschuler/screeps-roles
npm run test:roles
```

If broad failures involve unrelated dirty files/dependencies, stop and report; do not fix unrelated.

## Acceptance criteria

- `military.ts` no longer owns patrol generation/advance code.
- All patrol behavior tests pass.
- Existing military behavior tests pass.
- No edits to public exports.
- No changes to combat targeting, ally safety, squad logic, or role decisions beyond patrol helper imports.

## Rollback only own files

Only if preflight proved target files were clean:

```bash
git checkout -- packages/@ralphschuler/screeps-roles/src/behaviors/military.ts
rm -f packages/@ralphschuler/screeps-roles/src/behaviors/military/patrolWaypoints.ts
rm -f packages/@ralphschuler/screeps-roles/test/militaryPatrolWaypoints.test.ts
rmdir packages/@ralphschuler/screeps-roles/src/behaviors/military 2>/dev/null || true
```

## Risks / stop points

- Stop if `military.ts` already dirty.
- Stop if needing edits to dirty `src/index.ts` or behavior barrels.
- Stop if tests require changing waypoint semantics.
- Stop if cache namespace/TTL/invalidation must change.
- Stop if any change touches ally/hostile targeting logic.

## Changed files

None.

## Validation performed

Read-only only: repo status, relevant source/tests/package scripts, Screeps type signatures. No tests/build run.