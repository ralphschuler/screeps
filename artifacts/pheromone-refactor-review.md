## Findings

### Must-fix
None found.

### Suggestions
- `package.json:26,105` — `verify` uses `lint:all`, but `lint:all` still excludes `@ralphschuler/screeps-pheromones`. New pheromone files are linted only if someone runs the package lint directly. Consider adding `lint:pheromones` and including it in `lint:all`.

## Changed files reviewed

- `package.json`
- `packages/@ralphschuler/screeps-pheromones/README.md`
- `packages/@ralphschuler/screeps-pheromones/src/manager.ts`
- `packages/@ralphschuler/screeps-pheromones/test/pheromone.test.ts`
- New untracked:
  - `src/contributionRules.ts`
  - `src/diffusionRules.ts`
  - `src/eventSignals.ts`
  - `src/limits.ts`
  - `src/metrics.ts`
  - `src/sourceCache.ts`

## Validation performed

- `git diff -- package.json packages/@ralphschuler/screeps-pheromones`
- `git diff --check -- package.json packages/@ralphschuler/screeps-pheromones` ✅
- `npm run test:pheromones` ✅ 37 passing
- `npm run lint -w @ralphschuler/screeps-pheromones --if-present` ✅
- `npx tsc -p packages/@ralphschuler/screeps-pheromones/tsconfig.json --noEmit` ✅
- `npm run check:alliance-safety` ✅

## Risks

- No emitted build/private-server runtime run.
- Public `PheromoneManager` API appears stable; removed methods were private.
- Ally safety preserved in metrics path via `getActualHostileCreeps`; no new ally-targeting behavior found.