## Findings

Scope: `packages/@ralphschuler/screeps-visuals`

Best tiny pure-helper extraction targets in `src/roomVisualizer.ts`:

- `calculateCreepThreat` — lines `426-448`
  - Pure over `creep.body ?? []`; existing indirect test covers missing body: `test/roomVisualizer.test.ts:89-107`.
- `getStructureDepthOpacity` — lines `664-680`
  - Pure `StructureConstant -> opacity` switch.
- `selectDominantPheromone` / heatmap math — lines `318-334`
  - Preserve strict `value > 10` threshold behavior.
- `getTopStoredResources` — duplicated logic lines `538-542` and `557-561`
  - Same top-3 resources over `1000` for storage + terminal.
- Minor pure math candidates:
  - spawn progress: `459-460`
  - flowing-arrow interpolation: `589-592`
  - road traffic color: `756-758`

Smallest safe refactor: new internal `src/roomVisualizerHelpers.ts`, move `calculateCreepThreat` + `getStructureDepthOpacity`, update class calls. No public `index.ts` export needed.

## Existing tests

- `test/roomVisualizer.test.ts`
  - room stats controller progress fallback: lines `65-87`
  - hostile creep without body: lines `89-107`
- Package tests also include:
  - `test/budgetDashboard.test.ts`
  - `test/mapVisualizer.test.ts`

## Validation performed

Passed:

```bash
npm test -w @ralphschuler/screeps-visuals
# 6 passing
```

```bash
npm run lint -w @ralphschuler/screeps-visuals
# passed; warning about missing "type": "module" in package package.json
```

```bash
npx tsc -p packages/@ralphschuler/screeps-visuals/tsconfig.json --noEmit
# passed
```

## Changed files

None. Package scope clean:

```bash
git status --short -- packages/@ralphschuler/screeps-visuals
# no output
```

Repo has unrelated dirty files outside scope.

## Risks

- Direct helper tests for `calculateCreepThreat` need Screeps body-part globals (`ATTACK`, `HEAL`, etc.) mocked.
- Preserve exact pheromone threshold semantics: current dominant requires `value > 10`, not `>= 10`.
- Keep helpers internal to avoid accidental public API expansion.