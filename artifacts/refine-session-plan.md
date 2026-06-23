## Findings

- No files modified.
- `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts` is clean.
- Repo/worktree is **not clean** on `main`; many unrelated modified/untracked files, including roles package files.
- Patrol waypoint logic lives in `military.ts` around:
  - constants/interfaces: patrol cache + metadata
  - `getPatrolWaypoints(room)`
  - `getNextPatrolWaypoint(creep, waypoints)`
- Used by `guard()` and `remoteGuard()` home-patrol paths.

## Stop Gate

Do **not** edit now unless existing dirty work is committed/stashed or this work is done on an isolated branch.

Check:

```bash
git status --short
git diff -- packages/@ralphschuler/screeps-roles/src/behaviors/military.ts
```

Proceed only if target files are clean.

## Plan

### Phase 1 — Characterization tests first

Add `packages/@ralphschuler/screeps-roles/test/militaryPatrol.test.ts`.

Test current behavior before extraction:

- guard with no hostiles returns `moveTo` first patrol waypoint.
- `patrolIndex` initializes and advances when creep is within range `<= 2`.
- all waypoint terrain walls → patrol empty → guard falls back to idle/spawn fallback.
- spawn-count change invalidates cached patrol points.

Validate:

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military patrol"
```

Stop if tests expose existing behavior uncertainty.

### Phase 2 — Extract helper module only

Create:

```text
packages/@ralphschuler/screeps-roles/src/behaviors/military/patrol.ts
```

Move only:

- `PATROL_CACHE_NAMESPACE`
- `PATROL_WAYPOINT_TTL`
- patrol cache interfaces
- `getPatrolWaypoints`
- `getNextPatrolWaypoint`

Update `military.ts`:

```ts
import { getNextPatrolWaypoint, getPatrolWaypoints } from "./military/patrol";
```

Remove `globalCache` from the existing `../cache` import, keep `findCachedClosest`.

Do **not** re-export from package root.

Validate:

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military patrol"
npm run build:roles
```

### Phase 3 — Direct helper tests

Extend same test file to import internal helper:

```ts
import { getNextPatrolWaypoint, getPatrolWaypoints } from "../src/behaviors/military/patrol";
```

Assert:

- waypoint ordering unchanged.
- spawn offsets included.
- positions clamped to `2..47`.
- wall filtering works.
- cached same-tick result uses namespace `"patrol"`.
- `patrolIndex` wraps modulo waypoint count.

Validate:

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military patrol"
npm run lint:roles
```

### Phase 4 — Broader validation

```bash
npm run test:roles
npm run build:roles
npm run lint:roles
npm run check:alliance-safety
```

Optional runtime smoke if behavior risk feels nonzero:

```bash
npm run test:server:smoke
```

Inspect:

```text
packages/screeps-server/artifacts/smoke/summary.md
packages/screeps-server/artifacts/smoke/summary.json
```

## Acceptance Criteria

- Guard/remoteGuard patrol actions unchanged.
- Patrol waypoint order unchanged.
- Cache namespace/TTL/spawn-count invalidation unchanged.
- No public API exports added.
- `military.ts` shrinks; behavior code remains readable.
- All listed validations pass.

## Rollback

If on clean branch:

```bash
git checkout -- packages/@ralphschuler/screeps-roles/src/behaviors/military.ts
rm -rf packages/@ralphschuler/screeps-roles/src/behaviors/military
rm -f packages/@ralphschuler/screeps-roles/test/militaryPatrol.test.ts
```

If other work touches same paths, stop and use `git diff`/manual reverse only.

## Risks

- Current dirty worktree makes edits unsafe now.
- `globalCache` default heap store may be same-tick only; preserve behavior, don’t “fix” during extraction.
- Internal helper import path can create accidental public API expectations; keep package root unchanged.
- Mock tests need `room.getTerrain()` defined.