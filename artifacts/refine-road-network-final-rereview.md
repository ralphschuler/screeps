## Must-fix findings

None.

Evidence checked:
- Distance-2+ remotes no longer skip full routing: `packages/@ralphschuler/screeps-layouts/src/road-network/remoteRoads.ts:64-85`
- Regression test covers non-adjacent remote: `packages/@ralphschuler/screeps-layouts/test/roadNetworkPlanner.test.ts:143-153`
- README contract matches behavior: `packages/@ralphschuler/screeps-layouts/README.md:343-345`

## Changed files by reviewer

None.

Scoped worktree changes present:
- `M packages/@ralphschuler/screeps-layouts/README.md`
- `M packages/@ralphschuler/screeps-layouts/src/roadNetworkPlanner.ts`
- `M packages/@ralphschuler/screeps-layouts/test/roadNetworkPlanner.test.ts`
- `?? packages/@ralphschuler/screeps-layouts/src/road-network/`
- `?? packages/@ralphschuler/screeps-layouts/test/roadNetworkExitGeometry.test.ts`

## Validation performed

Passed:
```bash
npm test -w @ralphschuler/screeps-layouts -- --reporter dot --grep 'roadNetwork'
npm test -w @ralphschuler/screeps-layouts -- --reporter dot
npm run build -w @ralphschuler/screeps-layouts
npm run lint -w @ralphschuler/screeps-layouts
```

Lint only emitted existing Node module-type warning for `eslint.config.js`.

## Risks

- Review limited to requested paths.
- No private-server/runtime road simulation.
- New scoped files are untracked; ensure they are included when committing.