## Plan: bounded readability/refactor slice

### Assumptions
- Preserve current dirty worktree. No stash/reset.
- Target clean package only: `packages/@ralphschuler/screeps-pheromones`.
- No strategy/constant/threshold changes.
- ROADMAP alignment: Sections 5, 18, 23 + ADR-0002/0004.

### Current status
- Dirty worktree exists; many packages touched.
- `screeps-pheromones` appears clean.
- Changed files now: **none by me**.

---

## Phase 0 — Safety fence + baseline

**Goal:** isolate work.

Steps:
1. Check target clean:
   ```bash
   git status --short
   git diff --name-only -- packages/@ralphschuler/screeps-pheromones
   ```
2. Prefer isolated worktree:
   ```bash
   git worktree add ../screeps-pheromone-refactor -b refactor/pheromone-readability HEAD
   ```
3. Baseline:
   ```bash
   npm run build:pheromones
   npm run test:pheromones
   ```

**Stop if:** target path dirty, baseline fails unexpectedly, or worktree creation unsafe.

---

## Phase 1 — Characterization tests first

**Goal:** lock current behavior before extraction.

Add/extend tests for:
- update cadence: `nextUpdateTick`, `lastUpdate`
- decay rates + clamping
- contribution effects: harvest/build/upgrade/logistics/expand
- hostile metrics excluding allies
- diffusion cap: target never exceeds source
- neighbor room parsing edge cases

**Acceptance:**
- Tests pass before refactor.
- Tests fail on intentional behavior drift.

**Validate:**
```bash
npm run test:pheromones
```

**Rollback:** delete only new test file/blocks.

---

## Phase 2 — Extract pure modules

**Goal:** make `manager.ts` orchestration-only.

Candidate modules:
- `src/manager/sourceCache.ts`
- `src/manager/metricsUpdater.ts`
- `src/manager/contributionRules.ts`
- `src/manager/diffusionRules.ts`
- `src/manager/roomNeighbors.ts`
- `src/manager/eventSignals.ts`

Keep public API unchanged:
- `PheromoneManager`
- `pheromoneManager`
- `DEFAULT_PHEROMONE_CONFIG`
- existing exports/import paths

**Acceptance:**
- `manager.ts` much shorter.
- No config values changed.
- No public export breakage.
- New helpers use plain inputs where practical.

**Validate:**
```bash
npm run build:pheromones
npm run test:pheromones
```

**Stop if:** behavior tests require strategy changes.

---

## Phase 3 — Add focused docs/TSDoc

**Goal:** improve understandability.

Update only:
- `packages/@ralphschuler/screeps-pheromones/README.md`
- maybe TSDoc in new helper modules

Document:
- module map
- ROADMAP Section 5 relation
- update cadence
- decay/diffusion responsibilities
- “no direct commands; numeric swarm signals”

**Acceptance:**
- README matches actual current `PheromoneState`.
- No invented roadmap behavior.

**Validate:**
```bash
npm run build:pheromones
npm run test:pheromones
```

---

## Phase 4 — Final narrow + broader validation

Quick:
```bash
npm run build:pheromones
npm run test:pheromones
npm run typecheck -w @ralphschuler/screeps-pheromones --if-present
```

Optional broader, only in isolated worktree:
```bash
npm run test:all
npm run check:alliance-safety
npm run verify
```

**Stop if:** root validation mutates tracked dirty files in main worktree. Use worktree only.

---

## Risks
- Existing dirty worktree overlap → use worktree or strict path fence.
- Refactor can alter timing/diffusion subtly → characterization tests first.
- Barrel/export breakage → keep imports stable.
- README drift vs ROADMAP/API → document observed code + cited ROADMAP only.

## Rollback points
- After each phase:
  ```bash
  git diff -- packages/@ralphschuler/screeps-pheromones
  ```
- Revert slice only:
  ```bash
  git restore --source=HEAD -- packages/@ralphschuler/screeps-pheromones
  ```
- If using worktree: remove whole worktree branch, main dirty tree untouched.