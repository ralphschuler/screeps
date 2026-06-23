# Parent synthesis: live 500-tick observer

## Sample

- Shard: `shard1`
- Tick range: `71873740` → `71874241` (`501` ticks)
- Samples: `25`, about every `20-22` ticks
- Rooms observed: `W17S29`, `W18S27`, `W18S28`, `W18S29`, `W18S30`, `W18S33`, `W18S34`, `W19S26`, `W19S27`, `W19S28`, `W19S29`, `W20S20`, `W5S15`
- API policy: read-only only (`api.time`, `api.memory.get`, `api.raw.game.roomObjects`, `api.raw.game.roomStatus`, `api.me`); no state-changing endpoints.
- Ally safety: `TooAngel` and `TedRoastBeef` excluded from hostile classification.

## Ranked findings

1. **Recommended: gate pixel generation on empire health, not only full bucket.**
   - Evidence: bucket reached `10000` at tick `71874139`; `empire:pixelGeneration` last ran at `71874154`; next sample bucket was `199`, then only `2939` by final tick.
   - At the same observation window: `W19S26` had a boosted `admon` 50-part hostile for 19/25 samples; `W18S29` spawn queue peaked `22` total / `15` emergency; latest task board was `113` total / `109` open / `4` assigned.
   - Impact: prevents discretionary pixel spend from forcing low-bucket recovery while defense/spawn/logistics still have urgent work.
   - Likely code areas: `packages/@ralphschuler/screeps-empire/src/pixel/pixelGenerationManager.ts`, `packages/screeps-bot/src/empire/pixelGenerationManager.ts`, maybe spawn/defense health helpers in `packages/screeps-spawn` / `packages/screeps-defense`.

2. **W19S26 bootstrap-defense response was slow/risky.**
   - Evidence: boosted `admon/r_2_7075` observed with body `{tough:8,ranged_attack:16,move:10,heal:16}` from ticks `71873740` through `71874118`; cleared by `71874139`.
   - Room had RCL3, no spawn/tower energy capacity (`0/0` in stats), controller progress unchanged (`29.653%`), and 0-3 friendly creeps in sampled objects.
   - Defense request existed while hostile visible: `guardsNeeded=2`, `rangersNeeded=4`, `healersNeeded=0`, `urgency=1`.
   - Likely code areas: `packages/screeps-defense/src/emergency/emergencyResponse.ts`, `packages/screeps-defense/src/coordination/defenseCoordinator.ts`, `packages/screeps-spawn/src/spawn-demand/defenseAssistDemand.ts`, `packages/screeps-spawn/src/defenseAssistBody.ts`, military role behavior in `packages/@ralphschuler/screeps-roles`.

3. **Spawn queues and task board stayed backlogged.**
   - Evidence: `W18S29` avg queue `9.04`, max `22`, max emergency `15`; `W17S29` avg queue `7`, max `10`; latest task board `109/113` open with only `4` assigned.
   - Room assignment ratio weak: `W17S29` avg open/assigned `38.4/1.84`, `W18S29` `34.64/2.12`, `W18S28` `22.64/0.36`.
   - Likely code areas: `packages/screeps-spawn/src/spawnNeedsAnalyzer.ts`, `packages/screeps-spawn/src/spawnQueue.ts`, `packages/screeps-spawn/src/spawnCoordinator.ts`, task-producing economy/role modules.

4. **CPU spikes existed, but bucket drain was dominated by pixel generation.**
   - Evidence: CPU avg/max `30.403/55.52`; skipped processes avg/max `31.76/46`.
   - Top process stats in samples included high historical avg for `creep:scout_71872539_736e6jbge` (`avg≈16.28`, `max≈42.41`) and room `W17S29` (`avg≈5.84`, `max≈45.00`), but the abrupt bucket transition aligns with `empire:pixelGeneration`.
   - Likely code areas if pursued: `packages/@ralphschuler/screeps-roles/src/behaviors/utility/scout.ts`, `packages/screeps-kernel`, room process profiling.

5. **Non-allied remote/nearby room occupants observed.**
   - Latest room-object samples had `eduter` creeps in `W18S33`/`W18S34` with large `WORK` bodies. Not `TooAngel`/`TedRoastBeef`; no allied creeps misclassified as hostile.

## Single recommended change

Implement a **pixel generation safety gate**: only allow `Game.cpu.generatePixel()` when the bucket is full *and* empire health is quiet, e.g. no active `Memory.defenseRequests`, no visible owned-room hostiles, no emergency/high spawn backlog above threshold, and no active recovery/bootstrap rooms. Consider increasing `fullBucketTicksRequired` or making pixel generation disabled while `Game.cpu.bucket` recovery would starve low/medium processes.

## Validation/deploy risks

- Low code risk if limited to pixel generation gating + unit tests.
- Strategic risk: fewer pixels generated; trade-off favors survival/recovery.
- Must not alter combat targeting against allies; preserve `TooAngel`/`TedRoastBeef` safety.
- Validate with unit tests for pixel gate, then private-server smoke/long; live re-sample before/after deploy.
