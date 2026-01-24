# Room Managers

This directory contains focused manager modules that handle specific aspects of room operations. These modules were extracted from the monolithic `roomNode.ts` to improve separation of concerns, testability, and maintainability.

## Architecture

The room management system follows a **orchestration pattern** where `RoomNode` coordinates high-level room operations by delegating to specialized manager modules:

```
┌─────────────────────────────────────────────────────────┐
│                     RoomNode                             │
│                (Orchestration Layer)                     │
│                                                          │
│  - Main loop coordination                               │
│  - Manager delegation                                   │
│  - Stats collection                                     │
└────────────┬────────────┬───────────┬───────────────────┘
             │            │           │
    ┌────────▼───┐  ┌────▼────┐  ┌──▼──────────┐
    │  Defense   │  │Construct│  │  Economy    │
    │  Manager   │  │ Manager │  │  Manager    │
    └────────────┘  └─────────┘  └─────────────┘
```

## Managers

### RoomDefenseManager (`RoomDefenseManager.ts`)

**Responsibilities:**
- Threat assessment and hostile detection
- Tower control (attack, heal, repair)
- Structure count tracking (destroyed structures)
- Nuke detection
- Kernel event emission for defense events

**Key Methods:**
- `updateThreatAssessment(room, swarm, cache)` - Assess threats and update danger levels
- `runTowerControl(room, swarm, towers)` - Coordinate tower actions (focus fire, heal, repair)

**Lines:** 292

### RoomConstructionManager (`RoomConstructionManager.ts`)

**Responsibilities:**
- Blueprint-based construction planning
- Perimeter defense (walls, ramparts) with road awareness
- Road network planning (sources, controller, mineral)
- Rampart automation on critical structures
- Misplaced structure cleanup

**Key Methods:**
- `getConstructionInterval(rcl)` - Calculate construction check interval based on RCL
- `runConstruction(room, swarm, constructionSites, spawns)` - Execute construction logic

**Features:**
- Early game (RCL 2-3): Faster construction interval (5 ticks) for rapid fortification
- Mid-late game (RCL 4+): Regular interval (10 ticks) for CPU efficiency
- Road-aware perimeter defense (walls don't block roads)

**Lines:** 179

### RoomEconomyManager (`RoomEconomyManager.ts`)

**Responsibilities:**
- Lab reactions and boosting
- Factory production (commodity compression)
- Power spawn processing
- Link transfers (source → storage → controller)

**Key Methods:**
- `runResourceProcessing(room, swarm, cache)` - Coordinate all economic processing

**Features:**
- RCL-gated operations (labs at 6+, factory at 7+, power spawn at 8)
- Automatic reaction planning via chemistry planner
- Bidirectional link transfers with priority management

**Lines:** 204

## Refactoring Impact

**Before:**
- `roomNode.ts`: 905 lines (monolithic, hard to test, unclear responsibilities)

**After:**
- `RoomNode`: 309 lines (orchestration only)
- `RoomDefenseManager`: 292 lines
- `RoomConstructionManager`: 179 lines
- `RoomEconomyManager`: 204 lines
- **Total**: 984 lines across 4 focused modules

**Benefits:**
- ✅ **66% reduction** in main orchestration file (905 → 309 lines)
- ✅ **Clear separation** of concerns (defense, construction, economy)
- ✅ **Easier testing** - each manager can be tested independently
- ✅ **Better maintainability** - changes isolated to specific domains
- ✅ **CPU profiling** - easier to identify performance bottlenecks per subsystem

## Usage Example

```typescript
// In RoomNode.run()
const cache = getStructureCache(room);
const swarm = memoryManager.getOrInitSwarmState(roomName);

// Defense management
roomDefenseManager.updateThreatAssessment(room, swarm, {
  spawns: cache.spawns,
  towers: cache.towers
});
roomDefenseManager.runTowerControl(room, swarm, cache.towers);

// Construction management (every N ticks)
if (Game.time % roomConstructionManager.getConstructionInterval(rcl) === 0) {
  roomConstructionManager.runConstruction(
    room,
    swarm,
    cache.constructionSites,
    cache.spawns
  );
}

// Economy management (every 5 ticks)
if (Game.time % 5 === 0) {
  roomEconomyManager.runResourceProcessing(room, swarm, {
    factory: cache.factory,
    powerSpawn: cache.powerSpawn,
    links: cache.links,
    sources: cache.sources
  });
}
```

## Testing

Each manager has corresponding unit tests in `test/unit/`:
- `roomDefenseManager.test.ts`
- `roomConstructionManager.test.ts`
- `roomEconomyManager.test.ts`

Tests verify:
- Configuration and interval calculation
- Manager initialization
- Integration with dependencies (placeholder tests for future mock-based testing)

## Future Improvements

Potential enhancements to consider:
1. **RoomMemoryManager** - Extract memory initialization logic
2. **RoomCreepManager** - Extract creep role coordination (currently in separate processes)
3. **RoomMetricsCollector** - Extract metrics collection into dedicated module
4. **Manager interfaces** - Define common interface for all managers for consistency
5. **Mock-based testing** - Add comprehensive unit tests with mocked game objects

## Related Documentation

- [ROADMAP.md](../../../ROADMAP.md) - Swarm architecture principles
- [DEFENSE_COORDINATION.md](../../../docs/DEFENSE_COORDINATION.md) - Defense system integration
- [STATS_SYSTEM_OVERVIEW.md](../../../docs/STATS_SYSTEM_OVERVIEW.md) - Stats collection
