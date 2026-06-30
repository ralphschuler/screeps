## Findings

- Dirty tree already present. Respect it; no broad restore/clean.
- Good vertical slice: `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts`
  - Large: ~1,257 LOC.
  - Clean currently.
  - Patrol waypoint logic is isolated, behavior-preserving, easy to contract-test.
- Validation performed:
  - `git status --short`
  - Read `ROADMAP.md`, `package.json`, roles military files/tests.
  - Ran:
    ```bash
    npm test -w @ralphschuler/screeps-roles -- --grep "military (squad|assistance) behavior"
    ```
    Result: `13 passing`.

## Vertical TDD Refactor Plan

### Goal

Extract military patrol waypoint behavior into a deeper module while preserving public role behavior.

### Likely touched files

```text
packages/@ralphschuler/screeps-roles/src/behaviors/military.ts
packages/@ralphschuler/screeps-roles/src/behaviors/military/patrolWaypoints.ts   # new
packages/@ralphschuler/screeps-roles/test/militaryPatrolWaypoints.test.ts       # new
packages/@ralphschuler/screeps-roles/README.md                                  # optional tiny docs
```

No barrel export changes.

## Behavior Contract to Lock First

Patrol helper must keep:

- Cache namespace: `patrol`
- TTL: `1000`
- Cache invalidation: spawn count only
- Waypoints:
  - 2 spawn-offset points per spawn
  - exit-side points
  - corner points
  - center point
  - clamp to room bounds `[2,47]`
  - filter wall terrain
- `getNextPatrolWaypoint`:
  - returns `null` for empty waypoints
  - initializes `memory.patrolIndex`
  - advances when creep is within range `<= 2`
  - wraps index safely

## Phases

### Phase 0 — Baseline guard

```bash
git status --short
npm test -w @ralphschuler/screeps-roles -- --grep "military (squad|assistance) behavior"
```

Stop if `military.ts` is already dirty or baseline tests fail unexpectedly.

### Phase 1 — RED

Add `militaryPatrolWaypoints.test.ts` importing planned module:

```ts
import { getPatrolWaypoints, getNextPatrolWaypoint } from "../src/behaviors/military/patrolWaypoints";
```

Tests should fail because module does not exist yet.

### Phase 2 — GREEN

Create `src/behaviors/military/patrolWaypoints.ts`.

Move only patrol constants/types/functions from `military.ts`.

Update `military.ts` to import:

```ts
import { getPatrolWaypoints, getNextPatrolWaypoint } from "./military/patrolWaypoints";
```

Run:

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military patrol|military (squad|assistance) behavior"
```

### Phase 3 — Refactor/docs

- Keep public role exports unchanged.
- Add short JSDoc in new module.
- Optional README note: military behavior now delegates patrol waypoint generation.

### Phase 4 — Full validation

```bash
npm test -w @ralphschuler/screeps-roles
npm run build:roles
npm run lint:roles
npm run check:alliance-safety
```

## Acceptance Criteria

- Tests pass.
- No public API/memory schema changes.
- `military.ts` shrinks and only delegates patrol logic.
- Dirty unrelated files untouched.
- Alliance safety check still passes.

## Rollback / Stop Points

Rollback only own files:

```bash
git restore -- packages/@ralphschuler/screeps-roles/src/behaviors/military.ts
rm -f packages/@ralphschuler/screeps-roles/src/behaviors/military/patrolWaypoints.ts
rm -f packages/@ralphschuler/screeps-roles/test/militaryPatrolWaypoints.test.ts
```

Stop if:
- validation requires edits to unrelated dirty files
- behavior tests change action outputs
- alliance safety check fails
- build/lint failures originate outside planned paths

## Changed Files

None. Read-only planning only.

## Risks

- Dirty tree may cause unrelated full-test failures.
- Internal helper tests may couple to implementation; keep contract-level only.
- Cache behavior is CPU-sensitive; preserve namespace, TTL, and invalidation exactly.