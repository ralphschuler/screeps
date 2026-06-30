## Must-fix

1. **GCL guard still undercounts cross-shard owned rooms**
   - Evidence: `footprintOperation.ts:269-276` uses `Math.max(claimedTargets, localOwnedRooms) < Game.gcl.level`.
   - But `claimedTargets` counts target **shards**, not owned rooms; `updateLocalTargetStatus()` stores only one local target room: `footprintOperation.ts:305-308`.
   - Example: GCL 3, current shard has 2 rooms, remote shard has 1 room → actual 3/3. Code sees `max(2,2)=2` → spawns another claimer.
   - `interShardClaim.ts:83-91` still returns `{ type: "claim" }` without handling `ERR_GCL_NOT_ENOUGH`.
   - Fix: count owned rooms from all shard health / operation state + in-flight claims; handle claim failure as blocked/backoff.

## Previous blocker status

- **ISM state preservation:** mostly fixed. Schema round-trips `footprintOperation` (`schema.ts:324-343`, `487-509`); ShardManager merges current op before write (`shardManager.ts:622-632`). Risk: no direct ShardManager merge regression test.
- **Double-run:** fixed. Early runner returns on owned shards before running roles (`footprintOperation.ts:348-355`); no-owned shards return before kernel (`SwarmBot.ts:252-260`).
- **Priorities:** fixed for defense/emergency preemption. Claimer now `NORMAL + 50` (`footprintOperation.ts:213`) vs `HIGH=500`, `EMERGENCY=1000` (`spawnQueue.ts:24-32`).
- **Unguarded ISM crash:** no crash blocker found. Calls are in `try`/`catch`; footprint load/save also feature-detect (`footprintOperation.ts:56-72`).

## Validation

- ✅ `npx tsc -p packages/screeps-bot/tsconfig.json --noEmit`
- ✅ package `tsc --noEmit`: intershard, roles, spawn
- ✅ `npm test -w @ralphschuler/screeps-intershard` — 7 passing
- ❌ `git diff --check` — trailing whitespace in `packages/screeps-bot/dist/main.js`

## Changed files

No edits by me. Worktree already has modified intershard/schema/roles/spawn/bot files + untracked intershard operation files/artifacts.

## Risks

- No private-server/live intershard validation.
- Full-GCL multi-shard case remains deploy blocker.
- `dist/main.js` whitespace may block CI/hooks if enforced.