## Findings

- Target package clean: `git status --short -- packages/@ralphschuler/screeps-visuals` → no output.
- Broader repo has unrelated dirty work outside target.
- Current room rules mostly inline in `src/roomVisualizer.ts` (~large class): stats, pheromones, combat, spawn, resources, structures, performance.
- Current validation: `npm test --prefix packages/@ralphschuler/screeps-visuals` → **6 passing**.
- Files changed now: **none**.

## Assumptions

- Public API stays unchanged: `RoomVisualizer`, `VisualizerConfig`, `MapVisualizer`, manager exports, budget exports.
- Refactor limited to `packages/@ralphschuler/screeps-visuals`.
- RoomVisual call order/styles count as behavior.
- `dist/` may be regenerated only during implementation/build, not planning.

## Phase Plan

### Phase 1 — Golden behavior tests first

Touch:
- `test/roomVisualizer.test.ts`
- maybe `test/setup.ts`

Add tests recording `RoomVisual` calls for:
- pheromone bars + dominant heatmap
- combat threat marker + tower ranges
- spawn queue speech/progress
- resource flow badge/arrow with deterministic `Game.time`

Acceptance:
- Tests fail only if existing visual behavior changes.
- No source refactor yet.

Validate:
```bash
npm test --prefix packages/@ralphschuler/screeps-visuals
```

Stop point:
- If expected visual behavior is ambiguous, stop and document before refactor.

---

### Phase 2 — Vertical TDD slice: combat rules extraction

Touch:
- `src/roomVisualizer.ts`
- new `src/room-visual/combatRules.ts`
- `test/roomVisualizer.test.ts` or new `test/combatRules.test.ts`

Extract pure helpers:
- `calculateCreepThreat`
- threat color/radius/opacity decision

Keep `RoomVisualizer.drawCombatInfo()` behavior same, delegating to helper.

Acceptance:
- Same public draw output in golden combat test.
- No export from `src/index.ts`.

Validate:
```bash
npm test --prefix packages/@ralphschuler/screeps-visuals
npm run lint --prefix packages/@ralphschuler/screeps-visuals
```

Rollback:
```bash
git checkout -- packages/@ralphschuler/screeps-visuals/src/roomVisualizer.ts \
  packages/@ralphschuler/screeps-visuals/test/roomVisualizer.test.ts
rm -rf packages/@ralphschuler/screeps-visuals/src/room-visual
```

---

### Phase 3 — Extract room visualization rule modules

Touch:
- `src/roomVisualizer.ts`
- new internal modules:
  - `src/room-visual/pheromoneRules.ts`
  - `src/room-visual/structureRules.ts`
  - `src/room-visual/resourceFlowRules.ts`
  - `src/room-visual/panelLayout.ts`

Move constants/helpers:
- `DEFAULT_CONFIG`
- pheromone colors
- heatmap threshold/dominant pheromone rule
- structure depth opacity
- arrow flow point math
- common panel dimensions/fonts where useful

Acceptance:
- `RoomVisualizer` still owns orchestration/config.
- Extracted modules are package-internal.
- Existing + golden tests pass.

Validate:
```bash
npm test --prefix packages/@ralphschuler/screeps-visuals
npm run lint --prefix packages/@ralphschuler/screeps-visuals
```

Stop point:
- If extraction needs changing `types.ts` or `index.ts`, stop unless purely internal type reuse.

---

### Phase 4 — Split drawing sections into layer renderers

Touch:
- `src/roomVisualizer.ts`
- new internal modules:
  - `src/room-visual/roomStatsPanel.ts`
  - `src/room-visual/pheromoneLayer.ts`
  - `src/room-visual/combatLayer.ts`
  - `src/room-visual/spawnLayer.ts`
  - `src/room-visual/resourceFlowLayer.ts`
  - `src/room-visual/structureLayer.ts`
  - `src/room-visual/performancePanel.ts`

Goal:
- `RoomVisualizer.draw()` becomes readable orchestration:
  - update flags
  - get swarm
  - call enabled layers
  - track costs

Acceptance:
- No public API changes.
- No files outside package touched.
- Golden tests verify same RoomVisual calls.

Validate:
```bash
npm test --prefix packages/@ralphschuler/screeps-visuals
npm run lint --prefix packages/@ralphschuler/screeps-visuals
npm run build --prefix packages/@ralphschuler/screeps-visuals
```

---

### Phase 5 — Docs/readability finish

Touch:
- `README.md`
- optional source comments in new modules

Document:
- room layer responsibilities
- flag/layer behavior
- performance-cost tracking
- public API unchanged

Acceptance:
- README matches implementation.
- No dead exports.
- `src/index.ts` unchanged unless formatting-only impossible to avoid.

Validate:
```bash
npm test --prefix packages/@ralphschuler/screeps-visuals
npm run lint --prefix packages/@ralphschuler/screeps-visuals
npm run build --prefix packages/@ralphschuler/screeps-visuals
git diff --stat -- packages/@ralphschuler/screeps-visuals
git diff -- packages/@ralphschuler/screeps-visuals/src/index.ts
```

## Final Acceptance Criteria

- `npm test`, `lint`, `build` pass for package.
- No behavior drift in golden RoomVisual tests.
- Public exports unchanged.
- Only files under `packages/@ralphschuler/screeps-visuals` changed.
- `roomVisualizer.ts` reduced to orchestration + config, not rule bulk.

## Main Risks

- Visual behavior drift from tiny style/order changes.
- Singleton `visualizationManager` + global `Memory/Game` test isolation.
- `roomVisualExtensions.ts` side effects: avoid changing load/init timing.
- Build may update `dist/`; decide whether dist should be committed before implementation.

## Rollback

- Best: phase commits; revert last phase.
- Full target rollback:
```bash
git checkout -- packages/@ralphschuler/screeps-visuals
git clean -fd -- packages/@ralphschuler/screeps-visuals
```