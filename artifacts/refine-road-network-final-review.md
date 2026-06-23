## Must-fix

- `calculateRemoteRoads` now skips non-adjacent remotes before full-path planning.
  - Evidence: `src/road-network/exitGeometry.ts:44-45` returns `null` unless rooms are Manhattan-adjacent; `src/road-network/remoteRoads.ts:64-70` then `continue`s.
  - Runtime allows distance-2 remotes: `packages/screeps-bot/src/empire/expansionManager.ts:96-100`, and passes assignments into `calculateRemoteRoads`: `remoteInfrastructure.ts:147`.
  - Impact: valid distance-2 remote assignments get no remote-road map/protection/construction.
  - Fix: either restore non-adjacent path support, or cap remote assignment contract to adjacent-only everywhere. Add integration test.

## Suggestions

- Align README contract:
  - `packages/@ralphschuler/screeps-layouts/README.md:39` says remote rooms broadly.
  - API section says adjacent-only at `README.md:345/349`.
  - Pick one contract and make all docs/examples match.
- Add test beyond `exitGeometry` unit checks:
  - Current test asserts non-adjacent returns null: `test/roadNetworkExitGeometry.test.ts:36-38`.
  - Need `calculateRemoteRoads` test for distance-2 remote behavior per chosen contract.

## Changed files

Reviewer edits: none.

Reviewed scoped changes:
- `packages/@ralphschuler/screeps-layouts/src/roadNetworkPlanner.ts`
- `packages/@ralphschuler/screeps-layouts/src/road-network/**`
- `packages/@ralphschuler/screeps-layouts/test/roadNetworkExitGeometry.test.ts`
- `packages/@ralphschuler/screeps-layouts/README.md`
- root `README.md` checked; no road-network refs.

## Validation performed

- `npm test -w @ralphschuler/screeps-layouts -- --reporter dot` → 48 passing.
- `npm run build -w @ralphschuler/screeps-layouts --if-present` → passed.
- `npm run lint -w @ralphschuler/screeps-layouts` → passed; Node emitted existing module-type warning.

## Risks

- No private-server/runtime road-building simulation run.
- Worktree has many unrelated dirty files outside reviewed scope.