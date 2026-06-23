## Findings

- Dirty tree confirmed. No edits made.
- Best target: `packages/@ralphschuler/screeps-layouts/src/roadNetworkPlanner.ts`
  - 892 LOC, currently clean in dirty tree.
  - Direct tests exist: `packages/@ralphschuler/screeps-layouts/test/roadNetworkPlanner.test.ts`
  - Targeted test passed: `4 passing`.

Avoid first:
- `unifiedStats.ts`, `marketManager.ts`, `kernel/events`, `roles/utility`: already dirty / higher overlap.
- `kernel.ts`: large but critical/high-risk.

## Plan: Behavior-Preserving Refactor

### Phase 0 — Guardrail baseline

**Goal:** prevent clobbering dirty work.

Checks:

```bash
git status --short
git diff -- packages/@ralphschuler/screeps-layouts/src/roadNetworkPlanner.ts \
  packages/@ralphschuler/screeps-layouts/test/roadNetworkPlanner.test.ts
npm test -w @ralphschuler/screeps-layouts -- --grep roadNetworkPlanner
```

**Stop if:** target files are dirty or targeted tests fail.

---

### Phase 1 — Extract cache/key helpers

Move only pure cache-key/freshness logic.

Proposed files:

- `src/road-network/cacheKeys.ts`
- update `src/roadNetworkPlanner.ts`
- maybe test via existing cache tests only.

**Acceptance:**

- cache invalidation behavior unchanged.
- anchor/storage/RCL/config still part of network key.
- existing 4 road planner tests pass.

---

### Phase 2 — Extract room/exit geometry

Move pure-ish helpers:

- `getExitDirection`
- `getExitPositions`
- `findClosestExit`
- `isNearExit`

Proposed file:

- `src/road-network/exitGeometry.ts`

Add focused tests for:
- adjacent room direction behavior.
- wall-filtered exits.
- nearest exit selection.
- near-exit threshold.

**Stop if:** tempted to “fix” room-coordinate semantics. Refactor only.

---

### Phase 3 — Extract path/cost matrix helpers

Move:

- `generateRoadCostMatrix`
- `findRoadPath`
- shared path-position accumulation helper.

Proposed file:

- `src/road-network/pathing.ts`

Tests:
- existing roads/site roads cost preferred.
- containers passable.
- non-container/non-owned-rampart blocked.
- incomplete paths skipped.

**API facts to verify:** `PathFinder.search`, `roomCallback(): boolean | CostMatrix`, `PathFinderPath.incomplete`.

---

### Phase 4 — Extract remote/exit route planners

Move:

- `calculateRemoteRoads`
- `calculateExitRoads`

Proposed file:

- `src/road-network/routePlanning.ts`

Tests:
- `includeRemoteRoads: false` returns empty.
- no hub returns empty.
- no exit direction warns/continues.
- successful path groups positions by room.

---

### Phase 5 — Thin public façade

Keep public API in:

- `src/roadNetworkPlanner.ts`

It should only orchestrate:

- `calculateRoadNetwork`
- `getValidRoadPositions`
- `isValidRoadPosition`
- `placeRoadConstructionSites`
- cache clearing/getter exports.

**Acceptance:**

- no public export removals.
- no changed constants/thresholds.
- main file meaningfully smaller, helper files cohesive.

---

### Phase 6 — Final validation

```bash
npm test -w @ralphschuler/screeps-layouts -- --grep roadNetworkPlanner
npm test -w @ralphschuler/screeps-layouts
npm run build:layouts
npm run lint -w @ralphschuler/screeps-layouts
git diff --check
```

Optional final runtime smoke if pathing behavior felt touched:

```bash
npm run test:server:smoke
```

## Rollback Points

After each phase:

```bash
git diff -- packages/@ralphschuler/screeps-layouts
```

Rollback uncommitted phase only:

```bash
git restore -- packages/@ralphschuler/screeps-layouts/src/roadNetworkPlanner.ts \
  packages/@ralphschuler/screeps-layouts/test/roadNetworkPlanner.test.ts \
  packages/@ralphschuler/screeps-layouts/src/road-network
```

If committed later: `git revert <phase-commit>`.

## Validation Performed

- Read dirty status.
- Checked large TS files by LOC.
- Read `roadNetworkPlanner.ts`, package scripts, test file.
- Checked Screeps types for `PathFinder.search`, `RoomPosition.getRangeTo`, `Game.map.getRoomTerrain`, `Room.createConstructionSite`.
- Ran:

```bash
npm test -w @ralphschuler/screeps-layouts -- --grep roadNetworkPlanner
```

Result: `4 passing`.

## Changed Files

None.

## Risks

- Same package has unrelated dirty layout work; full package tests may fail for unrelated reasons.
- Existing road planner tests are cache-heavy; add golden helper tests before deeper moves.
- Remote road behavior is gameplay-sensitive; no semantic cleanup in this slice.