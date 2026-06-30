## Must-fix findings

None found in scoped diff.

## Suggestions

- `src/portal/constants.ts:4-6`: comment says InterShardMemory entries “expire,” but `getPortalDataFromInterShardMemory()` only validates shape; no `lastUpdate` age check. Reword or add stale remote-data handling.
- `src/portal/portalManager.ts:155-156`: docs say `{ portals: {...} }`, actual key is `"portals:"`. Minor doc mismatch.
- Consider adding manager-level test that `publishPortalsToInterShardMemory()` preserves unrelated local keys, not just helper coverage.

## Behavior / API notes

- `StructurePortal.destination` shape matches `@types/screeps`: `RoomPosition | { shard: string; room: string }`.
- `InterShardMemory.getLocal(): string`, `getRemote(): string | null`, `setLocal(string)` usage OK.
- Payload key `"portals:"` preserved from old implementation.
- Type exports from `portalManager.ts` preserved for existing imports.

## Validation performed

- `npm run build:pathfinding` ✅
- `npm run test:pathfinding` ✅ 33 passing
- `npm run lint:pathfinding` ✅ only existing Node module-type warning
- `git diff --check -- <scoped files>` ✅

## Rerun before merge

```bash
npm run build:pathfinding
npm run test:pathfinding
npm run lint:pathfinding
npm run test:server:smoke
```

## Changed files by reviewer

None.