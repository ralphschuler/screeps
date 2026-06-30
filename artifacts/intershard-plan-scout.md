## Read-only scout findings

### Changed files
- None by me.
- `git status --short`: only pre-existing untracked `artifacts/...` dirs shown; no tracked edits.

### Key evidence / plumbing

#### Intershard / roadmap
- `ROADMAP.md`: multi-shard meta layer, `InterShardMemory`, cross-shard tasks incl. colonization.
- `packages/@ralphschuler/screeps-intershard/src/schema.ts`
  - `InterShardTask.type` already includes `"colonize"`.
  - `PortalInfo` stores `sourceRoom`, `targetShard`, `targetRoom`, `threatRating`, stability.
  - Caution: compact serializer drops task `createdAt/updatedAt` and portal `lastScouted/decayTick` on deserialize → extend if colonization needs timeouts/route freshness.
- `packages/@ralphschuler/screeps-intershard/src/shardManager.ts`
  - `processInterShardTasks()` routes `"colonize"` to `handleColonizeTask()`.
  - `handleColonizeTask()` only marks active + logs. No spawn/route/claim behavior yet.
  - Public helpers: `createTask()`, `getOptimalPortalRoute()`, `updateTaskProgress()`.
- `packages/screeps-bot/src/core/shardCommands.ts`
  - `shard.createTask('colonize', targetShard, targetRoom, priority)` already exists.
  - No colonization-specific command/validation.

#### Role registration path
- Runtime dispatch: `packages/screeps-bot/src/core/creepProcessManager.ts`
  - `ROLE_PRIORITY_MAP` must include new role.
  - `executeCreepRole()` dispatches by `memory.family`: economy/military/utility/power.
- Behavior dispatch:
  - Economy: `packages/@ralphschuler/screeps-roles/src/behaviors/economy/index.ts`
  - Utility: `packages/@ralphschuler/screeps-roles/src/behaviors/utility.ts`
  - Exports: `packages/@ralphschuler/screeps-roles/src/index.ts`
- Caution: `crossShardCarrier` exists in:
  - `packages/@ralphschuler/screeps-roles/src/crossShardCarrier.ts`
  - but not wired into economy dispatcher/export path. If spawned as family `"economy"`, it falls back to `larvaWorker`. Avoid repeating.

#### Spawn demand path
- Entry: `packages/screeps-bot/src/SwarmBot.ts`
  - `runSpawns()` → `coordinateSpawning(room, swarm)`.
- Pipeline:
  - `packages/screeps-spawn/src/spawnCoordinator.ts`
  - `packages/screeps-spawn/src/spawnPipeline.ts`
  - `packages/screeps-spawn/src/spawnIntentCompiler.ts`
- Demand:
  - `planSpawnDemand()` iterates `ROLE_DEFINITIONS`.
  - Special assignment patterns: `getClaimerSpawnAssignment()`, `getPioneerSpawnAssignment()`, `getDefenseAssistSpawnAssignment()`.
  - `compileSpawnDemandToRequest()` carries `targetRoom`, `task`, `additionalMemory`.
- Spawn memory:
  - `packages/screeps-spawn/src/spawnRequestExecution.ts`
  - `buildSpawnMemory()` merges `role`, `family`, `homeRoom`, `targetRoom`, `additionalMemory`.

#### Spawn role definition
- `packages/screeps-spawn/src/roleDefinitions.ts`
  - Add new role body/priority/family/remoteRole.
- `packages/screeps-spawn/src/bodyOptimizer.ts`
  - Add fallback optimization case if no static body covers it.

#### Memory schemas / types
- Canonical used by bot/spawn:
  - `packages/@ralphschuler/screeps-memory/src/schemas/creepSchemas.ts`
- Duplicate local roles schema:
  - `packages/@ralphschuler/screeps-roles/src/memory/schemas/creep.ts`
- Likely add role + fields in both:
  - `targetShard`
  - `portalRoom`
  - `interShardTaskId` / `colonizationTaskId`
  - `workflowState` narrowed if possible.
- Intershard task schema likely needs assigned creeps / source room / portal route / timeout fields.

### Big cautions

- **No-owned-room guard**: `SwarmBot.loop()` returns early when `ownedRoomCount === 0`, before creep process sync. An intershard colonizer arriving on a fresh shard with no owned rooms will not run unless special handling is added before this guard.
- **Peaceful safety**:
  - Existing `claimer()` can `attackController` when `task === "attack"`.
  - New peaceful footprint role should not use attack task.
  - Use `isAllyPlayer()` / `getActualHostileCreeps()` from `@ralphschuler/screeps-defense`; never raw hostile targeting against TooAngel/TedRoastBeef.
- **InterShardMemory size/schema**: compact serialization is lossy today. Don’t add bulky route/state arrays without size checks.
- **Spawn duplication**: follow `spawnPipeline` preemption/dedupe patterns (`getSpawnRequestDedupeKey`) if colonization requests can coexist with stale queues.

### Test patterns to copy

- Role definitions: `packages/screeps-spawn/test/roleDefinitions.test.ts`
- Spawn demand/queue: `packages/screeps-bot/test/unit/spawnPipeline.test.ts`
- Role behavior: `packages/screeps-bot/test/unit/pioneer.test.ts`
- Intershard schema/manager: `packages/@ralphschuler/screeps-intershard/test/schema.test.ts`
- Shard commands: `packages/screeps-bot/test/unit/shardCommands.test.ts`
- Command registration: `packages/screeps-bot/test/unit/commandRegistry.test.ts`, `consoleCommands.test.ts`

### Validation performed
- Read-only `find`, `grep`, `read`.
- `git status --short`.
- No tests/build run.