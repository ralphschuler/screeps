## Findings

### Must-fix before PR/deploy

1. **Untracked source deps imported by tracked files**
   - 64 local imports in modified tracked files resolve to untracked package files.
   - Examples:
     - `packages/@ralphschuler/screeps-cache/src/CacheCoherence.ts:21,26`
     - `packages/@ralphschuler/screeps-intershard/src/schema.ts:8-10`
     - `packages/@ralphschuler/screeps-roles/src/behaviors/utility.ts:13-18`
     - `packages/screeps-defense/src/towerActionPolicy.ts:1-7`
     - `packages/screeps-spawn/src/spawnNeedsAnalyzer.ts:13,22-36,88`
   - Risk: clean checkout/CI fails if only tracked diff is committed.

2. **Staging ambiguity: generated bundle + artifacts**
   - `packages/screeps-bot/dist/main.js` has a large tracked generated diff.
   - 76 untracked files under `artifacts/**`; `.gitignore` does not ignore `artifacts/`.
   - Risk: accidental PR pollution or deploy bundle/source mismatch.

## Suggestions

- `package.json:106` `lint:all` still omits changed packages: cache, console, intershard, layouts, memory, stats, visuals. I ran them manually; consider adding if intended.
- Rebuild/deploy bundle only after staging source deps cleanly.

## Changed files

- I did not edit.
- Current worktree:
  - 66 modified tracked files
  - 168 untracked files
  - 92 untracked package files
  - 76 untracked artifacts
  - staged diff empty

## Validation performed

Passed:

- `git diff --check`
- `npm run check:alliance-safety` → passed, 935 runtime files scanned
- `npm run lint:all`
- individual lint for omitted changed packages
- `tsc --noEmit` for changed workspaces
- unit tests for changed workspaces: cache, console, intershard, kernel, layouts, memory, pathfinding, pheromones, remote-mining, roles, stats, visuals, chemistry, defense, economy, spawn

Not run:

- `npm run build` / deploy bundle rebuild
- private-server smoke/long tests

## Ally safety

No must-fix found. Alliance safety check passed; changed defense path still uses `getActualHostileCreeps` in `packages/screeps-defense/src/threat/threatAssessment.ts:17,77`.