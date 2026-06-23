## Scout result

Changed files by me: **none**.

### Worktree evidence

- `66` modified, `105` untracked, `0` staged.
- Current target files clean:
  - `packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts`
  - `packages/@ralphschuler/screeps-visuals/test/mapVisualizer.test.ts`

### Safest next slice

**Visual-only map rules extraction**

Files:
- add `packages/@ralphschuler/screeps-visuals/src/map-visualizer/rules.ts`
- add `packages/@ralphschuler/screeps-visuals/test/mapVisualizerRules.test.ts`
- modify `packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts`

Extract only pure helpers:
- danger color clamp
- posture color lookup
- threat score/color
- highway/SK room parsing

Do **not** change:
- draw order
- `getActualHostileCreeps`
- `getActualHostileStructures`
- ally/hostile targeting semantics

Why safe:
- Visual-only.
- Target files clean.
- Matches existing pattern: `src/room-visualizer/renderRules.ts`, `resourceFlowRules.ts`.
- Aligns ROADMAP §23 modular/testable plain-object logic.
- No combat/spawn/economy behavior.

### Avoid due overlap

Avoid dirty/refactor-active areas:
- `packages/@ralphschuler/screeps-visuals/README.md`
- `packages/@ralphschuler/screeps-visuals/src/roomVisualizer.ts`
- `packages/@ralphschuler/screeps-visuals/src/room-visualizer/*`
- `packages/@ralphschuler/screeps-visuals/test/pheromoneRules.test.ts`
- `packages/@ralphschuler/screeps-visuals/test/renderRules.test.ts`
- `packages/@ralphschuler/screeps-visuals/test/resourceFlowRules.test.ts`
- generated/dirty: `packages/screeps-bot/dist/main.js`
- broader dirty packages: cache, console, intershard, kernel, layouts, memory, pathfinding, pheromones, remote-mining, roles, stats, bot, chemistry, defense, economy, spawn.

### Validation performed

Ran:

```bash
npm test -w @ralphschuler/screeps-visuals -- --grep "MapVisualizer"
```

Result: **2 passing**.

Also inspected:
- `AGENTS.md`
- `ROADMAP.md`
- `package.json`
- `packages/@ralphschuler/screeps-visuals/package.json`
- target source/tests/status.

### Targeted validation for implementation

```bash
git status --short -- \
  packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts \
  packages/@ralphschuler/screeps-visuals/test/mapVisualizer.test.ts

npm test -w @ralphschuler/screeps-visuals -- --grep "MapVisualizer|MapVisualizer rules"
npm run build:visuals
npm run lint -w @ralphschuler/screeps-visuals
npm run check:alliance-safety
```

Risk: dirty tree may cause unrelated failures. Avoid full build until ready; bot `dist/main.js` already dirty.