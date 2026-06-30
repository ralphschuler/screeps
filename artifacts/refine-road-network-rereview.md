## Must-fix findings

None found in scoped files.

## Suggestions

1. **Clarify/enforce `getExitDirection` adjacency contract**  
   `exitGeometry.ts:30-33` says non-adjacent targets return `null`, but `:44-47` returns by sign only. Example: diagonal/non-adjacent rooms would return `"right"`/`"left"` before checking `dy`. Either:
   - enforce adjacency with `Math.abs(dx) + Math.abs(dy) === 1`, or
   - update docs/tests to say it returns first broad direction toward target.

2. **Add edge-case tests for non-adjacent/diagonal/embedded invalid room names**  
   Current test covers zero-axis adjacency and `"not-a-room"` only (`roadNetworkExitGeometry.test.ts:28-37`). Useful additions:
   - `W1N1 -> W0N0`
   - `W1N1 -> E0N1`
   - `"fooW1N1bar"` should be invalid if strict parsing intended.

## Changed files

No edits made by me. Scoped worktree changes present:

- `packages/@ralphschuler/screeps-layouts/src/roadNetworkPlanner.ts`
- `packages/@ralphschuler/screeps-layouts/src/road-network/**`
- `packages/@ralphschuler/screeps-layouts/test/roadNetworkExitGeometry.test.ts`

## Validation performed

Passed:

```bash
npm test -w @ralphschuler/screeps-layouts -- --grep roadNetworkExitGeometry
npm test -w @ralphschuler/screeps-layouts
npm run build -w @ralphschuler/screeps-layouts
npm run lint -w @ralphschuler/screeps-layouts
```

Lint emitted only Node module-type warning for `eslint.config.js`.

## Risks

- Review limited to requested files; repo has many unrelated dirty files.
- No private-server/runtime validation.
- Main remaining risk: ambiguous `getExitDirection` semantics for non-adjacent or diagonal remotes.