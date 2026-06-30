## Findings

### Must-fix
- None found in `packages/screeps-spawn/src/creepCounts.ts` / `spawnNeedsAnalyzer.ts` extraction.

### Should-fix
- `packages/screeps-bot/dist/main.js`: `git diff --check` fails on tracked bundle trailing whitespace.
  - Evidence: many lines, e.g. `dist/main.js:26183`, `26188`, etc.
  - Risk: hygiene/CI gate failure if whitespace checks run; huge generated diff hides real source changes.

### Suggestions
- `packages/screeps-spawn/src/creepCounts.ts:76-84`: `countRemoteCreepsByTargetRoom` still scans all `Game.creeps` every call, unlike home-role counts.
  - Called from `spawnNeedsAnalyzer.ts:218-224`; can be repeated per remote/role.
  - Consider caching remote counts too if CPU shows spawn analysis hot.

## Validation performed

Passed:
- `npm run build:spawn`
- `npm test -w @ralphschuler/screeps-spawn` — 104 passing
- `npm run lint:spawn`
- `npm test -w @ralphschuler/screeps-defense/layouts/memory/roles/stats` — all passing
- `npm run build:roles`
- `npm run lint:roles`
- `npm run test:unit -w screeps-typescript-starter` — 2327 passing
- `npm run check:alliance-safety` — passed

Failed:
- `git diff --check` — trailing whitespace in `packages/screeps-bot/dist/main.js`

## Risks / gaps

- Did not run private-server smoke/long simulation.
- Did not run `npm run build:bot` because it writes `packages/screeps-bot/dist/main.js`; bundle/source consistency remains unverified.
- Many unrelated untracked `artifacts/` and module-split files in dirty tree; avoid accidental commit noise.
- No new ally-safety issue found; alliance safety script passed.

## Changed files by reviewer

- None.