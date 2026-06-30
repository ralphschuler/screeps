## Must-fix findings

None found in scoped review.

## Suggestions

- `packages/@ralphschuler/screeps-remote-mining/README.md:113` names `remotePathSearch`, but `src/index.ts` does not export it. OK if internal. If meant public, export and document API.
- `test/remotePathSearch.test.ts:62` only tests invisible-room callback returning `true`. Add a visible-room callback case if you want coverage for road/creep/hostile avoidance delegation.

## Changed files reviewed

- `README.md`
- `src/paths/remotePathCache.ts`
- `src/paths/remotePathSearch.ts` new
- `test/remotePathSearch.test.ts` new

Reviewer file changes: none.

## Validation performed

- `npm test -w @ralphschuler/screeps-remote-mining -- --reporter dot` → 13 passing
- `npm run build -w @ralphschuler/screeps-remote-mining` → pass
- `npm run lint -w @ralphschuler/screeps-remote-mining` → pass; Node module-type warning only
- `npx tsc -p packages/@ralphschuler/screeps-remote-mining/tsconfig.test.json --noEmit` → pass
- Checked Screeps type doc: `PathFinderOpts.maxRooms` default/max 16 in local `@types/screeps`.

## Risks

- Full root `npm test -- --reporter dot` timed out at 120s during monorepo pretest, after remote-mining build had passed.
- Worktree has many unrelated dirty files; review scoped only to remote-mining files above.