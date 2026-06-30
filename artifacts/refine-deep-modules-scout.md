## Read-only scout result

Changed by me: **none**.  
Validation run: **no tests**; read-only inspection only.

## Key findings

### Deepen next

- `packages/screeps-spawn/src/spawnNeedsAnalyzer.ts` — **936 LOC**, many domains:
  - remote eligibility, claimer/reserver/recovery, pioneer bootstrap, defense assist, role gates.
  - Recommendation: keep public facade, extract:
    - `claimerDemand.ts`
    - `pioneerDemand.ts`
    - `defenseAssistDemand.ts`
    - `remoteEligibility.ts`
  - Strong seam coverage: `packages/screeps-bot/test/unit/spawnIntentCompiler.test.ts`, `remoteSpawning.test.ts`, `remoteConstructionAssignment.test.ts`, `packages/screeps-spawn/test/defenseSpawning.test.ts`.

- `packages/@ralphschuler/screeps-stats/src/unifiedStats.ts` — **2098 LOC**.
  - Only `unified-stats/alertFormatting.ts` extracted so far.
  - Next safe splits: `budgetValidation.ts`, `anomalyDetection.ts`, `cpuDetails.ts`, `memoryPublisher.ts`, `snapshotFactory.ts`.
  - Higher risk than spawn: Memory.stats shape + console export behavior.

- `packages/@ralphschuler/screeps-roles/src/behaviors/stateMachine.ts` — **545 LOC**.
  - Extract pure pieces:
    - state validity
    - completion rules
    - action/state serialization
  - Add table tests for every `CreepAction` round-trip before moving.

- `packages/screeps-spawn/src/spawnPipeline.ts` — **465 LOC**.
  - Extract defender power/request accounting into `defenseSpawnRequests.ts`.

- `packages/screeps-bot/src/intershard/footprintOperation.ts` — **439 LOC**, no direct tests found.
  - Needs tests/docs before refactor.
  - Split later: memory IO, portal lookup, spawn request builders, CPU floors, status rendering.

## Good seams already present

- `packages/@ralphschuler/screeps-layouts/src/linkNetworkPlanner.ts` now facade over `src/link-network/`; has README + focused tests.
- `packages/screeps-defense/src/towerActionPolicy.ts` now facade over `src/tower/`; tests cover attack/heal/repair policy.
- `packages/@ralphschuler/screeps-roles/src/behaviors/utility.ts` now dispatcher over `behaviors/utility/`; README explains ownership.
- `packages/screeps-spawn/src/{creepCounts,remoteRoleDemand,remoteWorkerDemand}.ts` already good small modules with tests.

## Docs/comments gaps

- `packages/@ralphschuler/screeps-stats/README.md` is stale:
  - lines mention nonexistent API: `startSubsystemMeasurement`, `endSubsystemMeasurement`, `finalize`.
  - Actual API uses `startTick()`, `finalizeTick()`, `measureSubsystem()`.
- `packages/screeps-bot/src/intershard/footprintOperation.ts` lacks module-level contract docs for `Memory.interShardOperation`, InterShardMemory shape, CPU-floor side effects.
- `packages/@ralphschuler/screeps-roles/src/behaviors/stateMachine.ts` has dated comments like `REFACTORED` / `BUGFIX`; convert to stable invariants.
- `packages/screeps-bot/dist/main.js` is generated/noisy; don’t use as refactor source.

## Highest-value low-risk next slice

Extract **claimer + pioneer demand** from:

`packages/screeps-spawn/src/spawnNeedsAnalyzer.ts`

into:

- `packages/screeps-spawn/src/claimerDemand.ts`
- `packages/screeps-spawn/src/pioneerDemand.ts`

Keep exports/imports stable. Behavior should be unchanged.

Suggested validation after edit:

```bash
npm run test:spawn
npm run test:unit -w screeps-typescript-starter -- --grep "spawnIntentCompiler|remoteSpawning|remoteConstructionAssignment|spawnPipeline"
```

## Risks

- Preserve ROADMAP/AGENTS constraints: no behavior change, no allied aggression regression, CPU/memory discipline.
- Avoid import cycles between `spawnNeedsAnalyzer.ts`, `spawnIntentCompiler.ts`, and new demand modules.
- Don’t refactor `footprintOperation.ts` first: weak direct test coverage.