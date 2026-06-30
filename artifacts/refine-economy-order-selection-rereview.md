## Findings

**No findings.**

- Must-fix: none.
- Suggestions: none.
- Previous unit-mix concern: resolved. Evidence:
  - `packages/screeps-economy/src/market/orderSelection.ts:34` names `emergencyScore`.
  - `orderSelection.ts:85-88` documents it as a **unitless** emergency heuristic preserving existing behavior.
  - `marketManager.ts:1109-1116` delegates emergency buy ranking to that helper.

## Changed files

- `packages/screeps-economy/README.md`
- `packages/screeps-economy/src/market/marketManager.ts`
- `packages/screeps-economy/src/market/orderSelection.ts`
- `packages/screeps-economy/test/orderSelection.test.ts`

## Validation performed

- Reviewed scoped diff/status for `packages/screeps-economy`.
- Checked Screeps `Order` type in local `@types/screeps`.
- Ran:
  - `npx tsc --noEmit -p packages/screeps-economy/tsconfig.json`
  - `npm run lint -w @ralphschuler/screeps-economy`
  - `npm test -w @ralphschuler/screeps-economy`
- Result: `60 passing`; TS/lint passed. Lint emitted existing module-type warning only.

## Risks

None found in current diff.