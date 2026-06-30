## Read-only plan

**Changed by me:** none.  
**Validation performed:** `git status --short`, `git diff --stat`, targeted diff reads, ROADMAP refs, `git diff --check` ✅ clean.  
**Tests run:** none.

## Assumptions

- Preserve current dirty worktree; no stash/reset.
- Refactor only: no spawn thresholds, combat targeting, diplomacy, strategy, or CPU policy behavior changes.
- Keep public import paths stable via facades.
- Required-code-only: delete moved duplicate logic after tests prove parity.
- Ally safety: never treat `TooAngel` / `TedRoastBeef` as hostile; run alliance check before final.

## Ordered phases

### 0 — Fence + baseline

**Files:** none.  
**Goal:** freeze scope, avoid trampling dirty work.

Checks:
```bash
git status --short
git diff --check
git diff --name-status -- package.json packages
```

**Acceptance:** known dirty set; no whitespace errors.  
**Stop:** unexpected unrelated source changes or generated-only noise dominates.  
**Rollback:** none.

---

### 1 — Link planner module split

**Files:**
- `packages/@ralphschuler/screeps-layouts/src/linkNetworkPlanner.ts`
- `packages/@ralphschuler/screeps-layouts/src/link-network/*`
- `packages/@ralphschuler/screeps-layouts/test/linkNetworkPlanner.test.ts`

**Acceptance:**
- `planLinkNetwork`, `getPlannedLinkRole`, cleanup helpers unchanged.
- New modules are pure geometry/classification helpers.
- Existing link placement tests pass.

Validate:
```bash
npm run build:layouts
npm run test:layouts -- --grep "link"
```

**Stop/rollback:** behavior diff in placement order/capacity → rollback this package only.

---

### 2 — Heap cache readability split

**Files:**
- `packages/@ralphschuler/screeps-memory/src/heap-cache.ts`
- `packages/@ralphschuler/screeps-memory/src/heap-cache/entries.ts`
- `packages/@ralphschuler/screeps-memory/test/heapCache.test.ts`
- `packages/@ralphschuler/screeps-memory/README.md`

**Acceptance:**
- TTL, `INFINITE_TTL`, rehydrate, dirty persistence unchanged.
- Memory shape remains serializable/plain.

Validate:
```bash
npm run build:memory
npm test -w @ralphschuler/screeps-memory -- --grep "HeapCache|heap"
```

**Stop:** any cache expiry semantic drift.

---

### 3 — Tower policy split

**Files:**
- `packages/screeps-defense/src/towerActionPolicy.ts`
- `packages/screeps-defense/src/tower/*`
- `packages/screeps-defense/test/towerActionPolicy.test.ts`

**Acceptance:**
- Attack/heal/repair priority unchanged.
- No new hostile selection path bypasses ally filtering.
- Public exports stable.

Validate:
```bash
npm run build:defense
npm run test:defense -- --grep "tower"
npm run check:alliance-safety
```

**Stop:** any ally-safety failure or combat behavior ambiguity.

---

### 4 — Pheromone manager/doc split

**Files:**
- `packages/@ralphschuler/screeps-pheromones/src/manager.ts`
- `packages/@ralphschuler/screeps-pheromones/src/{contributionRules,diffusionRules,eventSignals,metrics,sourceCache,limits}.ts`
- `packages/@ralphschuler/screeps-pheromones/test/pheromone.test.ts`
- `packages/@ralphschuler/screeps-pheromones/README.md`

**Acceptance:**
- Update cadence, decay, clamp, diffusion, event spikes unchanged.
- Hostile metrics still use actual hostiles only.
- README matches ROADMAP pheromone model.

Validate:
```bash
npm run build:pheromones
npm run test:pheromones
npm run lint:pheromones
```

**Stop:** tests require strategy/threshold changes.

---

### 5 — Roles behavior/state docs

**Files:**
- `packages/@ralphschuler/screeps-roles/src/behaviors/utility.ts`
- `packages/@ralphschuler/screeps-roles/src/behaviors/utility/*`
- `packages/@ralphschuler/screeps-roles/src/behaviors/stateMachine.ts`
- `packages/@ralphschuler/screeps-roles/test/behaviorContracts.test.ts`

**Acceptance:**
- Utility dispatcher import path stable.
- Scout/claimer/engineer/logistics decisions unchanged.
- State serialization/completion table-tested.

Validate:
```bash
npm run build:roles
npm run test:roles -- --grep "behavior|state|target"
```

**Stop:** behavior contracts become unclear or need gameplay decision.

---

### 6 — Spawn module depth

**Files:**
- `packages/screeps-spawn/src/roleDefinitions.ts`
- `packages/screeps-spawn/src/role-definitions/*`
- `packages/screeps-spawn/src/spawnNeedsAnalyzer.ts`
- `packages/screeps-spawn/src/spawn-demand/*`
- `packages/screeps-spawn/src/{creepCounts,remoteRoleDemand,remoteWorkerDemand}.ts`
- spawn tests + bot remote tests

**Acceptance:**
- `ROLE_DEFINITIONS` exact keys/body costs/priorities unchanged.
- Claimer/pioneer/remote/defense-assist demand unchanged.
- No import cycles.

Validate:
```bash
npm run build:spawn
npm run test:spawn
npm run test:unit -w screeps-typescript-starter -- --grep "remoteConstructionAssignment|remoteSpawning"
```

**Stop:** spawn counts/priorities change without explicit approval.

---

### 7 — Stats/docs/package glue

**Files:**
- `packages/@ralphschuler/screeps-stats/src/unifiedStats.ts`
- `packages/@ralphschuler/screeps-stats/src/unified-stats/alertFormatting.ts`
- `packages/@ralphschuler/screeps-stats/README.md`
- `package.json`
- `packages/screeps-bot/eslint.config.js`
- `packages/screeps-bot/docs/remote-harvesting.md`
- `packages/screeps-bot/dist/main.js`

**Acceptance:**
- Alert text equivalent except intended formatting limits.
- README APIs are real/current.
- Decide `dist/main.js`: include only if final build artifact required; otherwise restore to cut review noise.

Validate:
```bash
npm run build:stats
npm run test:stats -- --grep "alert"
npm run lint:all
```

**Stop:** generated bundle masks source review.

---

### 8 — Final integration gate

Validate:
```bash
npm run typecheck --workspaces --if-present
npm run test:all
npm run check:alliance-safety
npm run build
npm run test:server:smoke
```

Inspect:
```bash
cat packages/screeps-server/artifacts/smoke/summary.md
```

**Acceptance:**
- No type/lint/test failures.
- Smoke advances ticks; no critical bot errors.
- Alliance safety passes.

## Rollback pattern

Per phase:
```bash
git diff -- <phase-paths>
git restore --source=HEAD -- <tracked-phase-paths>
git clean -fd -- <new-phase-dirs>   # only after reviewing git status
```

## Main risks

- Broad dirty worktree overlap.
- Pure extraction can still alter order/timing.
- Import/barrel cycles.
- `dist/main.js` generated noise.
- Screeps globals in tests/lint.
- Any defense/spawn/pheromone drift could affect ally safety or CPU.