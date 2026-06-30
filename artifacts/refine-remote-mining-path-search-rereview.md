## Must-fix findings

None found.

## Changed files

Reviewer changes: none.

Scoped files reviewed:
- `packages/@ralphschuler/screeps-remote-mining/README.md`
- `packages/@ralphschuler/screeps-remote-mining/src/paths/remotePathCache.ts`
- `packages/@ralphschuler/screeps-remote-mining/src/paths/remotePathSearch.ts`
- `packages/@ralphschuler/screeps-remote-mining/test/remotePathSearch.test.ts`

## Validation performed

- `npm test --workspace packages/@ralphschuler/screeps-remote-mining -- --grep remotePathSearch` → 3 passing
- `npm test --workspace packages/@ralphschuler/screeps-remote-mining` → 14 passing
- `npm run build --workspace packages/@ralphschuler/screeps-remote-mining` → pass
- `npm run lint --workspace packages/@ralphschuler/screeps-remote-mining` → pass; Node module-type warning only
- `npx tsc -p packages/@ralphschuler/screeps-remote-mining/tsconfig.test.json --noEmit` → pass
- Checked local Screeps types: `PathFinderOpts.maxRooms` default/max is `16`.

## Risks

- Review scoped only to remote-mining path search/readme diff.
- Worktree has many unrelated dirty files.
- Did not run full monorepo tests or private-server simulation.