## Scout result: primary candidate

**Pick:** `packages/@ralphschuler/screeps-layouts/src/roadNetworkPlanner.ts`

**Why**
- Large clean module: **892 LOC**, not listed in `git status --short`.
- Existing focused tests: `packages/@ralphschuler/screeps-layouts/test/roadNetworkPlanner.test.ts`.
- Low/medium gameplay risk: mostly planning/caching, not direct creep combat/behavior.
- ROADMAP-aligned: roads/blueprints + CPU amortization sections.

## Exact refactor seam

Keep `src/roadNetworkPlanner.ts` as public facade. Extract internals:

- `src/road-network/config.ts`
  - lines ~58-80 constants/default config
- `src/road-network/cache.ts`
  - lines ~85-120 cache maps/key builders/freshness
  - lines ~774-891 cache clear/get helpers
- `src/road-network/exits.ts`
  - lines ~230-320 `getExitDirection`, `getExitPositions`, `findClosestExit`
  - lines ~546-591 `findExistingExitRoads`, `isNearExit`
- `src/road-network/costMatrix.ts`
  - lines ~497-529 `generateRoadCostMatrix`
- `src/road-network/pathing.ts`
  - lines ~457-493 `findRoadPath`
  - lines ~607-677 `calculateExitRoads`
- `src/road-network/planner.ts`
  - lines ~139-226 `calculateRoadNetwork`
  - lines ~338-448 `calculateRemoteRoads`
  - lines ~687-766 valid-road aggregation
  - lines ~805-868 validation/construction-site public wrappers

Preserve current public exports from `packages/@ralphschuler/screeps-layouts/src/index.ts`.

## Existing tests / commands

Relevant tests:
- `packages/@ralphschuler/screeps-layouts/test/roadNetworkPlanner.test.ts`
  - cache reuse
  - fresh exit-road fallback
  - anchor cache invalidation
  - room cache clearing

Validation run:
```bash
npm test -w @ralphschuler/screeps-layouts -- --grep roadNetworkPlanner
```

Result: **4 passing**.

## Risks

- Road validity feeds blueprint enforcement; mistakes can destroy valid roads.
- Remote-road and exit-road pathing depend on subtle room-coordinate logic.
- Some bot tests around exit roads are conceptual, not full integration assertions.
- Avoid changing cache keys or public function behavior unless covered.

## Alternatives checked

- `packages/@ralphschuler/screeps-kernel/src/kernel.ts` — 1909 LOC, clean, tested, but higher runtime risk.
- `packages/screeps-bot/src/empire/expansionManager.ts` — 1040 LOC, clean, tested, but strategic/gameplay risk higher.
- `packages/@ralphschuler/screeps-layouts/src/blueprints/planner.ts` — 593 LOC, clean, already partly modular.

## Changed files

None by scout. Repo was already dirty before inspection; status unchanged after validation.