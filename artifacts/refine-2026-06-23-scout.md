## Read-only scout result

Changed files by me: **none**.

### Dirty state noted

- Worktree already dirty: **52 tracked modified files** + many untracked `artifacts/` and new module dirs.
- Important dirty/generated file: `packages/screeps-bot/dist/main.js` → avoid manual edits.
- Current refine work spans cache, kernel, layouts, memory, pathfinding, pheromones, roles, stats, visuals, bot, chemistry, defense, economy, spawn.

### Low-risk remaining opportunities

1. **Stats serializer split**
   - Evidence: `packages/@ralphschuler/screeps-stats/src/unifiedStats.ts` is ~2098 lines.
   - Heavy methods: `publishToMemory()` around line 1568, `createEmptySnapshot()` around 1140.
   - Existing split precedent: `src/unified-stats/alertFormatting.ts` + `test/alertFormatting.test.ts`.
   - Low-risk move: extract memory-shape mapping to `src/unified-stats/memoryPublisher.ts`; keep `UnifiedStatsManager` facade.
   - Validate:
     ```bash
     npm test -w @ralphschuler/screeps-stats
     npm run build -w @ralphschuler/screeps-stats
     ```

2. **Military behavior combat helper**
   - Evidence: `packages/@ralphschuler/screeps-roles/src/behaviors/military.ts` ~1115 lines.
   - Repeated ranged/melee decision blocks at lines ~305, 315, 335, 415, 640, 1035.
   - Existing tests: `test/militarySquadBehavior.test.ts`, `test/militaryPatrolWaypoints.test.ts`, `test/behaviorContracts.test.ts`.
   - Low-risk move: extract `getCombatAttackAction(creep, target)` helper; no strategy rewrite.
   - Validate:
     ```bash
     npm test -w @ralphschuler/screeps-roles
     npm run build -w @ralphschuler/screeps-roles
     ```

3. **Room visualizer layer modules**
   - Evidence: `packages/@ralphschuler/screeps-visuals/src/roomVisualizer.ts` ~733 lines.
   - Layer methods: room stats, pheromones, combat, spawn queue, resource flow, structures, performance.
   - Existing rule modules already present under `src/room-visualizer/`.
   - Low-risk move: extract `resourceFlowLayer` or `performanceLayer`; keep `RoomVisualizer.draw()` orchestration.
   - Validate:
     ```bash
     npm test -w @ralphschuler/screeps-visuals
     npm run build -w @ralphschuler/screeps-visuals
     ```

4. **HybridStore expiry/size helpers**
   - Evidence: `packages/@ralphschuler/screeps-cache/src/stores/HybridStore.ts` repeats TTL expiry checks in `rehydrate()` and `cleanup()`.
   - Existing tests: `packages/@ralphschuler/screeps-cache/test/hybridStore.test.ts`.
   - Low-risk move: extract pure `isExpiredCacheEntry(entry, tick)` and `estimateSerializedSize()`.
   - Validate:
     ```bash
     npm test -w @ralphschuler/screeps-cache
     npm run build -w @ralphschuler/screeps-cache
     ```

5. **Kernel event queue policy split**
   - Evidence: `packages/@ralphschuler/screeps-kernel/src/events.ts` ~597 lines; config/types/priorities already split.
   - Queue/coalescing helpers clustered around lines ~288-389 and `processQueue()` around ~461.
   - Existing tests cover queue/coalescing: `packages/@ralphschuler/screeps-kernel/test/events.test.ts`.
   - Low-risk move: extract pure queue key/coalescing helpers; leave `EventBus` API unchanged.
   - Validate:
     ```bash
     npm test -w @ralphschuler/screeps-kernel
     npm run build -w @ralphschuler/screeps-kernel
     ```

### Validation performed

Read-only only. Ran inspection commands:
- `git status --short`
- `git diff --stat`
- `git diff --name-only`
- package/test discovery via `find`
- targeted `read`/`grep`
- random sample seed: `refine-current-readonly-scout-2026-06-23`

No tests/builds executed to avoid side effects.

### Risks

- Broad worktree dirtiness → avoid overlapping large rewrites.
- Generated `dist/main.js` dirty → do not hand-edit.
- Best next changes: small extraction-only commits, one package at a time.