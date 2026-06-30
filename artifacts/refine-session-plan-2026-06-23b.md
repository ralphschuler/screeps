## Findings / Scope

- **Chosen slice:** extract `military.ts` patrol waypoint logic into a private module.
- **Why:** clean source file, high readability gain, low behavior risk, quick tests.
- **Changed files:** none by me.
- **Current dirty tree:** broad; roles tests already dirty:
  - `packages/@ralphschuler/screeps-roles/test/behaviorContracts.test.ts`
  - `packages/@ralphschuler/screeps-roles/test/targetAssignmentManager.test.ts`
- **Node caveat:** current shell `v22.22.2`; repo wants `>=24 <25`. Use `nvm use` before final validation.

## Likely Files Touched

```text
packages/@ralphschuler/screeps-roles/src/behaviors/military.ts
packages/@ralphschuler/screeps-roles/src/behaviors/military/patrolWaypoints.ts
packages/@ralphschuler/screeps-roles/test/militaryPatrolWaypoints.test.ts
packages/@ralphschuler/screeps-roles/README.md   # optional tiny note
```

No package barrel/public export changes.

## Public Contracts / Behavior To Protect

- Existing military role exports unchanged.
- Patrol cache:
  - namespace: `"patrol"`
  - TTL: `1000`
  - invalidation by spawn count only.
- Waypoints:
  - spawn offsets
  - exits
  - corners
  - center
  - clamp `[2,47]`
  - filter walls.
- `patrolIndex` behavior unchanged.
- Do not touch ally safety paths:
  - `isAllyPlayer`
  - `isAllyControlledRoom`
  - hostile targeting filters.

## Plan

### Phase 0 — Fence

```bash
nvm use
npm run check-versions
git status --short
git diff --check
git status --short -- packages/@ralphschuler/screeps-roles
```

**Stop:** source/test dirty state not understood.

### Phase 1 — Characterization Test

Add `militaryPatrolWaypoints.test.ts`.

Test:
- empty waypoint list → `null`
- initializes `memory.patrolIndex`
- advances within range `<= 2`
- wraps index
- cached waypoint regeneration only when spawn count changes
- wall filtering/clamping

Run:

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military patrol"
```

### Phase 2 — Extract Module

Move only patrol types/constants/helpers from:

```text
src/behaviors/military.ts
```

to:

```text
src/behaviors/military/patrolWaypoints.ts
```

Import back into `military.ts`.

Run:

```bash
npm test -w @ralphschuler/screeps-roles -- --grep "military patrol|military (squad|assistance) behavior"
npm run build:roles
```

### Phase 3 — Minimal Docs

Optional README note: patrol waypoint generation is isolated for readability/CPU-sensitive cache preservation.

Run:

```bash
npm run lint:roles
npm run check:alliance-safety
```

## Acceptance Criteria

- No behavior/policy changes.
- `military.ts` smaller; patrol module cohesive.
- Existing military squad/assistance tests still pass.
- New patrol characterization tests pass.
- Build/lint pass for roles.
- Alliance safety check passes.
- No production deploy.

## Validation Performed

```bash
git status --short
git diff --stat
node --version
npm --version
npm test -w @ralphschuler/screeps-roles -- --grep "military (squad|assistance) behavior"
```

Result: targeted roles baseline **13 passing**.

## Rollback

Only own planned paths:

```bash
git restore -- packages/@ralphschuler/screeps-roles/src/behaviors/military.ts
rm -f packages/@ralphschuler/screeps-roles/src/behaviors/military/patrolWaypoints.ts
rm -f packages/@ralphschuler/screeps-roles/test/militaryPatrolWaypoints.test.ts
```

## Risks / Stop Points

- Dirty tree may cause unrelated full-package failures.
- Current Node version mismatch; stop if `check-versions` fails after `nvm use`.
- Stop if extraction touches targeting/combat/ally logic.
- Stop if cache semantics need changes.