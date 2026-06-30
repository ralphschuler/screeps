## Changed by scout

None. Read-only inspection only.

## Dirty worktree observed

Tracked modified spans many active slices:

- `package.json`
- layouts: `linkNetworkPlanner.ts`, test
- memory: `README.md`, `heap-cache.ts`, test
- pheromones: `README.md`, `manager.ts`, test
- roles: `behaviors/*`, `roles/utility.ts`, tests
- stats: `README.md`, `unifiedStats.ts`
- bot: `dist/main.js`, docs/eslint/intershard/tests
- defense: `towerActionPolicy.ts`, test
- spawn: `roleDefinitions.ts`, `spawnNeedsAnalyzer.ts`, demand/compiler/pipeline files, tests

Untracked source dirs also active: `link-network/`, `heap-cache/`, pheromone helper modules, roles `behaviors/utility/`, stats `unified-stats/`, defense `tower/`, spawn demand/role modules, plus many `artifacts/*`.

## Safest next refactor slice

**Pick clean package:** `packages/@ralphschuler/screeps-visuals`

Evidence:
- `git status --short -- packages/@ralphschuler/screeps-visuals` → clean
- `src/roomVisualizer.ts` is 831 lines
- Internal pure-ish helpers:
  - `calculateCreepThreat` in `roomVisualizer.ts`
  - `getStructureDepthOpacity` in `roomVisualizer.ts`
- Existing tests: `test/roomVisualizer.test.ts`
- Public API stable via `src/index.ts`; no need to export new internals there.

Suggested files:
- Add: `packages/@ralphschuler/screeps-visuals/src/room-visualizer/renderRules.ts`
- Modify: `packages/@ralphschuler/screeps-visuals/src/roomVisualizer.ts`
- Add: `packages/@ralphschuler/screeps-visuals/test/renderRules.test.ts`

Scope:
- Move threat scoring + structure opacity rules only.
- No behavior/policy changes.
- Do not touch dirty packages or generated `packages/screeps-bot/dist/main.js`.

## Validation performed

```bash
git diff --check
npm test -w @ralphschuler/screeps-visuals
```

Result: ✅ diff check clean, ✅ visuals tests 6 passing.

## Exact validation for implementation

```bash
git status --short -- packages/@ralphschuler/screeps-visuals
npm test -w @ralphschuler/screeps-visuals
npm run lint -w @ralphschuler/screeps-visuals
npm run build -w @ralphschuler/screeps-visuals
```

Optional final gate:

```bash
npm run typecheck --workspaces --if-present
npm run check:alliance-safety
```

## Risks

- Huge dirty worktree: avoid layouts/memory/pheromones/roles/stats/defense/spawn for now.
- New tests need Screeps globals like `ATTACK`, `HEAL`, `STRUCTURE_TOWER`.
- Build may update generated `dist` if package emits tracked artifacts.
- Do not clean `artifacts/*` or untracked source dirs without review.