## Findings

Recommended bounded slice: **`@ralphschuler/screeps-visuals` map visualizer rule extraction**.

Why this slice:
- `packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts` is clean despite broad repo churn.
- Visual-only: no spawn/combat/economy behavior change.
- Aligns with `ROADMAP.md` modularity/testability: pure logic over fake game state.
- Does **not** touch TooAngel/TedRoastBeef ally safety or hostile classification.

## Planned changed files

None changed now.

Planned if implemented:
- Add `packages/@ralphschuler/screeps-visuals/src/map-visualizer/rules.ts`
- Add `packages/@ralphschuler/screeps-visuals/test/mapVisualizerRules.test.ts`
- Modify `packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts`

## Ordered phases

### 0. Preflight / stop gate

Checks:

```bash
git status --short -- \
  packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts \
  packages/@ralphschuler/screeps-visuals/test/mapVisualizer.test.ts
npm test -w @ralphschuler/screeps-visuals -- --grep "MapVisualizer"
```

Stop if:
- target files not clean
- baseline MapVisualizer test fails

---

### 1. Tests first: pure map rules

Add tests for current behavior:
- danger color clamps `swarm.danger` to `0..3`
- unknown posture color → `#ffffff`
- threat level = `hostiles + hostileStructures * 2`
- threat color: `>10` red, else orange
- highway detection: coord divisible by 10
- SK marker: both coords divisible by 10

Quick check:

```bash
npm test -w @ralphschuler/screeps-visuals -- --grep "MapVisualizer rules"
```

Acceptance:
- tests fail before extraction only because module missing
- no game globals needed

Rollback:
```bash
rm -f packages/@ralphschuler/screeps-visuals/test/mapVisualizerRules.test.ts
```

---

### 2. Extract rule helpers

Create `src/map-visualizer/rules.ts`.

Move only pure constants/helpers:
- `DANGER_COLORS`
- `POSTURE_COLORS`
- `getDangerColor(danger?: number)`
- `getPostureColor(posture: string)`
- `getThreatLevel(hostiles: number, hostileStructures: number)`
- `getThreatColor(threatLevel: number)`
- `getHighwayRoomInfo(roomName: string)`

Quick check:

```bash
npm test -w @ralphschuler/screeps-visuals -- --grep "MapVisualizer rules"
npm run build:visuals
```

Acceptance:
- pure tests pass
- TypeScript build passes
- no `Game`, `Room`, `RoomPosition` imports in rules module

Rollback:
```bash
rm -f packages/@ralphschuler/screeps-visuals/src/map-visualizer/rules.ts
rm -f packages/@ralphschuler/screeps-visuals/test/mapVisualizerRules.test.ts
```

---

### 3. Wire into `mapVisualizer.ts`

Replace inline calculations only:
- room status danger color
- posture color
- threat level/color
- highway/SK detection

Do **not** alter:
- `getActualHostileCreeps`
- `getActualHostileStructures`
- map visual no-op guards
- room-distance guard
- draw order

Quick check:

```bash
npm test -w @ralphschuler/screeps-visuals -- --grep "MapVisualizer|MapVisualizer rules"
npm run build:visuals
```

Acceptance:
- existing `MapVisualizer` tests unchanged/pass
- visual draw behavior preserved for same fake `Game`

Rollback:
```bash
git restore --source=HEAD -- packages/@ralphschuler/screeps-visuals/src/mapVisualizer.ts
rm -f packages/@ralphschuler/screeps-visuals/src/map-visualizer/rules.ts
rm -f packages/@ralphschuler/screeps-visuals/test/mapVisualizerRules.test.ts
```

---

### 4. Final validation

```bash
npm test -w @ralphschuler/screeps-visuals
npm run build:visuals
npm run lint:all
npm run check:alliance-safety
```

Optional before deployment:

```bash
npm run test:server:smoke
```

Final acceptance:
- visual package tests pass
- build passes
- alliance safety passes
- no combat/diplomacy/hostile targeting behavior changed

## Validation performed

Read/checked:
- `git status --short` → many unrelated uncommitted changes.
- Path status for `mapVisualizer.ts` + test → clean.
- `ROADMAP.md` modularity/testability + TooAngel section.
- root/package visuals scripts.
- `mapVisualizer.ts` and existing `mapVisualizer.test.ts`.
- searched `mapVisualizer.ts` for ally/TooAngel/TedRoastBeef impact.

No files modified.

## Risks

- Other uncommitted visuals changes may break full package tests unrelated to this slice.
- Extracted helpers must preserve exact current thresholds/colors.
- Do not “improve” hostile/ally handling; only reuse existing `getActualHostile*` calls.
- Avoid broad exports from package index unless needed.