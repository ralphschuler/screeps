## Findings

- Read: `ROADMAP.md`, ADR-0004, ADR-0002, `README.md`, package scripts.
- Current worktree already dirty: 23 tracked files changed + untracked extracted module dirs.
- Existing in-progress deepening appears in:
  - `screeps-layouts/src/link-network/`
  - `screeps-memory/src/heap-cache/`
  - `screeps-roles/src/behaviors/utility/`
  - `screeps-stats/src/unified-stats/`
  - `screeps-defense/src/tower/`
  - `screeps-spawn/src/remoteRoleDemand.ts`
- `npm run check-versions` failed: Node `22.22.2`; repo requires Node `>=24 <25`.

Changed files by this planning task: **none**.

---

## Assumptions

- “Deepening modules” = extract cohesive private helpers behind stable public façades.
- No behavior change: same exports, role names, spawn priorities, Memory keys, TTLs, constants.
- Framework-first: shared logic stays in framework packages; `packages/screeps-bot` remains wiring/shims.
- No deploy. Private-server smoke only after local package gates pass.

---

## Global Stop / Rollback Rules

Before any phase:

```bash
nvm use
npm run check-versions
git status --short
git diff --stat
```

Stop if:

- Node is not `24`.
- Dirty work cannot be attributed/checkpointed.
- Package tests fail before refactor.
- Diff changes gameplay policy, Memory schema, ally safety, spawn priority, or CPU budget values.

Rollback:

- Prefer one commit per phase.
- Rollback with `git revert <phase-commit>`.
- Do **not** use broad `git restore .` while current dirty work exists.

---

## Ordered Small Phases

### 0. Baseline + Characterization

Likely files: tests only.

Add/confirm tests around current behavior before extraction.

Validation:

```bash
npm run check:alliance-safety
npm run build:framework
npm run test:all
```

Acceptance:

- Baseline known.
- Existing dirty tree reconciled or checkpointed.

---

### 1. Layout Link Planner Facade

Likely files:

- `packages/@ralphschuler/screeps-layouts/src/linkNetworkPlanner.ts`
- `packages/@ralphschuler/screeps-layouts/src/link-network/*`
- `packages/@ralphschuler/screeps-layouts/test/linkNetworkPlanner.test.ts`

Work:

- Keep `planLinkNetwork`, `classifyFunctionalLink`, construction-site API stable.
- Extract geometry/candidates/classification only.

Validation:

```bash
npm run test:layouts
npm run build:layouts
```

Acceptance:

- Same planned link roles/positions for fixtures.
- No RCL/link-limit logic changes.

---

### 2. Defense Tower Policy

Likely files:

- `packages/screeps-defense/src/towerActionPolicy.ts`
- `packages/screeps-defense/src/tower/*`
- `packages/screeps-defense/test/towerActionPolicy.test.ts`

Work:

- Deepen target selection vs maintenance selection.
- Preserve decision order: attack → low-bucket defer → heal → repair → walls → idle.

Validation:

```bash
npm run test:defense
npm run build:defense
npm run check:alliance-safety
```

Acceptance:

- Hostile targeting tests unchanged.
- Ally safety still passes.

---

### 3. Memory Heap Cache Codec

Likely files:

- `packages/@ralphschuler/screeps-memory/src/heap-cache.ts`
- `packages/@ralphschuler/screeps-memory/src/heap-cache/*`
- `packages/@ralphschuler/screeps-memory/test/heapCache.test.ts`

Work:

- Extract entry serialization/expiration helpers.
- Preserve TTL, persistence interval, `memory:*` non-persistence rule.

Validation:

```bash
npm test -w @ralphschuler/screeps-memory
npm run build:memory
```

Acceptance:

- Rehydrate/persist behavior identical.
- No Memory format version bump unless explicitly required.

---

### 4. Utility Role Behavior Modules

Likely files:

- `packages/@ralphschuler/screeps-roles/src/behaviors/utility.ts`
- `packages/@ralphschuler/screeps-roles/src/behaviors/utility/*`
- `packages/@ralphschuler/screeps-roles/src/behaviors/stateMachine.ts`
- `packages/@ralphschuler/screeps-roles/test/behaviorContracts.test.ts`

Work:

- One utility role per module.
- Keep dispatcher and public exports stable.

Validation:

```bash
npm run test:roles
npm run build:roles
```

Acceptance:

- Same `CreepAction` outputs for scout/claimer/engineer/remoteWorker/logistics fixtures.
- Remote-worker safety interrupt unchanged.

---

### 5. Stats Formatting / Alerts

Likely files:

- `packages/@ralphschuler/screeps-stats/src/unifiedStats.ts`
- `packages/@ralphschuler/screeps-stats/src/unified-stats/*`
- `packages/@ralphschuler/screeps-stats/test/*.test.ts`

Work:

- Extract pure alert/anomaly formatting only.
- Do not alter stat keys, Memory shape, or log throttling.

Validation:

```bash
npm run test:stats
npm run build:stats
```

Acceptance:

- Same `Memory.stats` output.
- Same alert throttling/capping tests.

---

### 6. Spawn Remote Demand Helpers

Likely files:

- `packages/screeps-spawn/src/spawnNeedsAnalyzer.ts`
- `packages/screeps-spawn/src/remoteRoleDemand.ts`
- `packages/screeps-spawn/src/remoteWorkerDemand.ts`
- `packages/screeps-spawn/src/spawnIntentCompiler.ts`
- `packages/screeps-spawn/test/remoteRoleDemand.test.ts`

Work:

- Extract remote eligibility/count/demand rules.
- Keep spawn request priority/order/role assignment stable.

Validation:

```bash
npm run test:spawn
npm run build:spawn
```

Acceptance:

- Remote mining/pioneer/claimer tests pass.
- No spawn priority regression.

---

### 7. Spawn Needs Analyzer Next Slice

Likely files:

- `packages/screeps-spawn/src/spawnNeedsAnalyzer.ts`
- new `packages/screeps-spawn/src/spawn-needs/*`

Work, one sub-slice at a time:

1. creep count cache
2. defense assist assignment
3. pioneer/claimer assignment
4. role target count policy

Validation each sub-slice:

```bash
npm run test:spawn
npm run build:spawn
```

Acceptance:

- `needsRole` behavior unchanged.
- Existing tests plus focused characterization tests pass.

---

### 8. Large-File Follow-ups Only After Above

Targets:

- `packages/@ralphschuler/screeps-stats/src/unifiedStats.ts`
- `packages/@ralphschuler/screeps-kernel/src/kernel.ts`
- `packages/screeps-economy/src/market/marketManager.ts`
- `packages/@ralphschuler/screeps-intershard/src/shardManager.ts`

Rule:

- One private module extraction per PR/commit.
- Add characterization test first.
- Keep public class/function API as façade.

Validation examples:

```bash
npm run test:kernel && npm run build:kernel
npm run test:economy && npm run build:economy
npm test -w @ralphschuler/screeps-intershard && npm run build:intershard
```

---

## Final Gate

After grouped phases:

```bash
npm run lint:all
npm run build
npm run typecheck
npm run test:all
npm run check:alliance-safety
npm run test:server:smoke
cat packages/screeps-server/artifacts/smoke/summary.md
```

Acceptance:

- No critical errors.
- CPU bucket not worse in smoke summary.
- No ally-safety regression.
- No unexplained gameplay output changes.