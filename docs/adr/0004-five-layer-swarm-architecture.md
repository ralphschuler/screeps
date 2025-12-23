# ADR-0004: Five-Layer Swarm Architecture

## Status

Accepted

## Context

As the bot evolved from managing a single room to targeting 100+ rooms across multiple shards, architectural challenges emerged:

- **Flat organization doesn't scale**: Managing all rooms independently leads to redundant logic and missed optimization opportunities
- **Global optimization vs local autonomy**: Need balance between empire-wide coordination and room-level independence
- **Responsibility allocation**: Unclear which systems should handle cross-room vs intra-room decisions
- **Resource sharing**: No clear mechanism for inter-room resource distribution
- **Strategic planning**: Difficulty implementing empire-level strategies (expansion, warfare, defense)
- **CPU budget allocation**: Hard to distribute CPU budgets across different organizational scopes

### Goals

- Clear separation of concerns across different organizational scopes
- Efficient empire-wide coordination without centralization bottlenecks
- Room autonomy for local decisions while supporting global strategies
- Scalable CPU budget allocation per layer
- Support for multi-shard operations

### Constraints

- Total CPU: 20-30 per tick (bucket-dependent)
- Memory limit: 2MB for all persistent data
- Must scale to 100+ rooms across multiple shards
- Each layer should have predictable, bounded CPU cost

## Decision

Implement a **five-layer hierarchical swarm architecture** where each layer has distinct responsibilities and operates at different time scales:

```
Empire (Global Meta-Layer)
    ↓
Shard (Strategic Layer)
    ↓
Cluster (Colony Group)
    ↓
Room (Local Operations)
    ↓
Creep/Squad (Individual Agents)
```

### Layer 1: Empire (Global Meta-Layer)

**Scope**: All owned rooms across all shards

**Responsibilities**:
- Assign strategic roles to shards (Core, Expansion, Resource, Backup)
- Coordinate inter-shard resource transfers via portals
- Track global GCL progress and expansion targets
- Manage alliance/diplomacy data
- Store empire-wide configuration

**Data Location**: `Memory.empire`

**Update Frequency**: Every 100-500 ticks

**CPU Budget**: ~0.5-1.0 CPU per update (0.01-0.02 CPU per tick amortized)

**Example Structure**:
```typescript
Memory.empire = {
  shards: {
    'shard0': { role: 'core', roomCount: 15, status: 'stable' },
    'shard1': { role: 'expansion', roomCount: 8, status: 'growing' },
    'shard2': { role: 'resource', roomCount: 12, status: 'farming' }
  },
  globalTargets: {
    expansion: ['W5N5', 'E3S7'],
    war: []
  },
  config: { /* empire-wide settings */ }
};
```

### Layer 2: Shard (Strategic Layer)

**Scope**: All owned rooms on a single shard

**Responsibilities**:
- Prioritize clusters for expansion, warfare, or defense
- Allocate CPU budgets across clusters via `Game.cpu.setShardLimits`
- Track shard-wide metrics (total energy income, military strength)
- Coordinate shard-level strategies
- Manage inter-cluster resource flows

**Data Location**: `Memory.shards[shardName]` or shard-specific global

**Update Frequency**: Every 50-100 ticks

**CPU Budget**: ~1.0-2.0 CPU per update (0.02-0.04 CPU per tick amortized)

**Example Structure**:
```typescript
Memory.shards.shard0 = {
  clusters: ['cluster-west', 'cluster-east'],
  cpuAllocation: {
    'cluster-west': 15,  // CPU limit
    'cluster-east': 10
  },
  strategies: {
    primary: 'expansion',
    military: 'defensive'
  }
};
```

### Layer 3: Cluster (Colony Group)

**Scope**: Group of adjacent owned rooms + their remote mining rooms

**Responsibilities**:
- Coordinate inter-room logistics (terminal transfers, energy sharing)
- Manage cluster-level military operations (squad coordination, rallying)
- Share defensive resources between rooms
- Coordinate lab networks for efficient chemistry
- Aggregate cluster metrics (energy balance, threat level)

**Data Location**: `Memory.colonies[clusterId]`

**Update Frequency**: Every 10-20 ticks

**CPU Budget**: ~0.5-1.0 CPU per cluster per update (0.05-0.1 CPU per tick per cluster)

**Example Structure**:
```typescript
Memory.colonies['cluster-west'] = {
  rooms: {
    home: ['W1N1', 'W2N1'],
    remotes: ['W1N2', 'W2N2', 'W3N1'],
    military: []
  },
  status: 'war',  // eco | war | recovery
  aggregateStats: {
    energyIncome: 50000,
    militaryStrength: 12000,
    threatIndex: 7
  },
  sharedDefense: {
    defensePool: ['defenderId1', 'defenderId2'],
    rallyPoint: 'W1N1'
  }
};
```

### Layer 4: Room (Local Operations)

**Scope**: Single owned room and its immediate operations

**Responsibilities**:
- Local economy (spawning, harvesting, hauling, building)
- Tower defense and repair
- Controller upgrading
- Local construction management
- Pheromone production and diffusion
- Room-specific threat response

**Data Location**: `Room.memory.swarm`

**Update Frequency**: Every tick (critical functions) to every 5-10 ticks (non-critical)

**CPU Budget**: ~0.1-0.3 CPU per room per tick

**Example Structure**:
```typescript
Room.memory.swarm = {
  colonyLevel: 6,
  intent: 'eco',  // eco | defense | war
  danger: 0,      // 0-3 threat level
  pheromones: { /* 9 pheromone values */ },
  sourceMeta: [
    { slots: 2, distance: 5, containerId: 'abc123' }
  ],
  eventLog: [
    ['hostile', 12345678],
    ['nuke', 12345680]
  ]
};
```

### Layer 5: Creep/Squad (Individual Agents)

**Scope**: Individual creeps or coordinated squads

**Responsibilities**:
- Execute assigned role (harvester, hauler, defender, etc.)
- Respond to local pheromones and room intent
- Coordinate within squads for military operations
- Report status to room layer

**Data Location**: `Creep.memory` (minimal)

**Update Frequency**: Every tick (role logic)

**CPU Budget**: ~0.01-0.05 CPU per creep per tick

**Example Structure**:
```typescript
Creep.memory = {
  role: 'harvester',
  homeRoom: 'W1N1',
  targetId: 'sourceId123',
  state: 'working'  // minimal state machine
};
```

## Layer Interaction Patterns

### Bottom-Up Communication (Emergent)

- **Creeps → Room**: Creeps affect room pheromones through their actions
- **Room → Cluster**: Rooms aggregate stats; high threat/resource levels bubble up
- **Cluster → Shard**: Clusters signal need for resources or military support
- **Shard → Empire**: Shards report capacity for expansion or need for reinforcement

### Top-Down Direction (Strategic)

- **Empire → Shard**: Assign strategic roles and expansion targets
- **Shard → Cluster**: Allocate CPU budgets and set strategic postures
- **Cluster → Room**: Coordinate logistics and military operations
- **Room → Creep**: Set room intent and pheromone levels that influence spawning/behavior

## Consequences

### Positive

- **Clear separation of concerns**: Each layer has well-defined responsibilities
- **Scalable**: Layers operate at different frequencies; higher layers update less often
- **CPU budgeting**: Can allocate and measure CPU per layer accurately
- **Autonomous rooms**: Rooms function independently; cluster/shard failures don't cascade
- **Strategic coherence**: Empire and shard layers enable coordinated strategies
- **Testing**: Each layer can be unit tested in isolation
- **Debugging**: Can trace decisions through the hierarchy
- **Multi-shard support**: Empire layer naturally handles cross-shard coordination
- **Emergent behavior**: Bottom-up signals combine with top-down strategies
- **Graceful degradation**: If higher layers fail, lower layers continue operating

### Negative

- **Complexity**: Five layers add conceptual overhead for new contributors
- **Indirection**: Decisions flow through multiple layers, harder to trace
- **Latency**: Top-down decisions take multiple ticks to propagate to creeps
- **Memory overhead**: Each layer stores metadata (~5-10KB per layer)
- **Coordination lag**: Inter-layer coordination not instantaneous
- **Testing complexity**: Integration tests must span multiple layers
- **Over-engineering risk**: Some decisions could be simpler with fewer layers

## Alternatives Considered

### Alternative 1: Flat (All Rooms Independent)

- **Description**: Each room operates completely independently
- **Pros**:
  - Simple to understand
  - No inter-room coordination complexity
  - Minimal CPU overhead
  - Easy to test individual rooms
- **Cons**:
  - No resource sharing (inefficient)
  - Cannot coordinate military operations
  - Duplicate logic across rooms
  - No empire-level strategies possible
  - Miss optimization opportunities
- **Why rejected**: Too limited; cannot implement coordinated expansion, defense, or logistics

### Alternative 2: Three-Layer (Empire → Room → Creep)

- **Description**: Eliminate Shard and Cluster layers
- **Pros**:
  - Simpler than five layers
  - Easier to understand
  - Less memory overhead
  - Fewer coordination points
- **Cons**:
  - Empire layer becomes bottleneck at scale (managing 100+ rooms directly)
  - No natural grouping for adjacent rooms (cluster benefits lost)
  - Difficult to handle multi-shard operations
  - Poor CPU budget allocation (jump from empire to room too large)
- **Why rejected**: Doesn't scale well; empire managing 100+ rooms directly is inefficient

### Alternative 3: Six-Layer (Add Region Between Shard and Cluster)

- **Description**: Empire → Shard → Region → Cluster → Room → Creep
- **Pros**:
  - Even finer-grained organization
  - Could handle very large empires (500+ rooms)
  - More granular CPU allocation
- **Cons**:
  - Excessive complexity for current scale (100 rooms)
  - More layers = more coordination overhead
  - Diminishing returns on benefits
  - Higher learning curve
- **Why rejected**: Over-engineered for target scale; five layers are sufficient

### Alternative 4: Dynamic Hierarchy (Adjust Layers Based on Size)

- **Description**: Start with 3 layers, add more as empire grows
- **Pros**:
  - Grows complexity with empire size
  - Simpler for small empires
  - Flexible
- **Cons**:
  - Complex migration logic when adding layers
  - Inconsistent architecture over time
  - Difficult to test all configurations
  - Code must handle variable hierarchy depths
- **Why rejected**: Complexity of dynamic reorganization outweighs benefits; fixed hierarchy is simpler

### Alternative 5: Functional Decomposition (Economy, Military, Logistics)

- **Description**: Organize by function rather than geography
- **Pros**:
  - Clear functional boundaries
  - Easy to implement domain expertise
  - Function-specific optimizations
- **Cons**:
  - Cross-cutting concerns (e.g., defense affects economy)
  - No natural CPU budget allocation
  - Geographic coordination still needed (resource transfers)
  - Difficult to handle room-specific situations
- **Why rejected**: Geography-based hierarchy is more natural for Screeps; functional aspects handled within layers

## Performance Impact

### CPU Allocation by Layer (100 rooms)

| Layer   | Update Freq | CPU/Update | CPU/Tick | Percentage |
|---------|-------------|------------|----------|------------|
| Empire  | 500 ticks   | 1.0 CPU    | 0.002    | 0.01%      |
| Shard   | 100 ticks   | 2.0 CPU    | 0.02     | 0.1%       |
| Cluster | 20 ticks    | 1.0 CPU    | 0.5      | 2.5%       |
| Room    | 1 tick      | 0.2 CPU    | 20.0     | 80%        |
| Creep   | 1 tick      | 0.05 CPU   | 3.5      | 17.4%      |

**Total**: ~24 CPU per tick at 100 rooms (within 30 CPU limit)

### Memory Overhead

- Empire layer: ~5KB
- Shard layer: ~2KB per shard × 3 = 6KB
- Cluster layer: ~3KB per cluster × 10 = 30KB
- Room layer: ~5KB per room × 100 = 500KB
- Creep layer: ~50 bytes per creep × 500 = 25KB

**Total**: ~566KB (~28% of 2MB limit)

Acceptable overhead; leaves room for other systems (stats, intel, etc.)

### Scalability

Architecture scales well to 200+ rooms:
- Empire and Shard layers update infrequently (amortized cost negligible)
- Cluster layer cost grows linearly with cluster count (predictable)
- Room and Creep layers dominate but are inherently parallelizable

## References

- **Related GitHub Issues**: 
  - #711 (Architectural refactoring)
  - #704 (CPU budget management)
- **Related ADRs**:
  - ADR-0001 (POSIS Architecture) - Each layer implemented as POSIS processes
  - ADR-0002 (Pheromone System) - Room layer produces pheromones; Cluster/Shard consume them
  - ADR-0005 (Memory vs Heap) - Layer data storage decisions
  - ADR-0007 (Spawn Queue) - Room layer manages spawning based on pheromones
- **External Documentation**:
  - [Hierarchical Control Systems](https://en.wikipedia.org/wiki/Hierarchical_control_system)
  - [Subsumption Architecture](https://en.wikipedia.org/wiki/Subsumption_architecture) - Related but different approach
- **Internal Documentation**:
  - `ROADMAP.md` Section 3 - Architecture layers overview
  - `docs/ECONOMY_SYSTEM.md` - How economy spans layers
  - `docs/DEFENSE_COORDINATION.md` - Multi-layer defense coordination

## Implementation Notes

### Package Organization

Each layer has dedicated implementations:
- **Empire**: `packages/screeps-bot/src/empire/`
- **Shard**: `packages/screeps-bot/src/shard/`
- **Cluster**: `packages/screeps-bot/src/colony/` (historically named)
- **Room**: `packages/screeps-bot/src/room/`
- **Creep**: `packages/screeps-bot/src/roles/`

### Layer Update Scheduling

Updates managed by POSIS kernel with process priorities:
```typescript
// High priority (every tick)
registerProcess('room-defense', roomDefenseProcess, { priority: 100 });

// Medium priority (every 5-10 ticks)
registerProcess('cluster-logistics', clusterLogisticsProcess, { priority: 50 });

// Low priority (every 50-100 ticks)
registerProcess('shard-strategy', shardStrategyProcess, { priority: 20 });

// Very low priority (every 100-500 ticks)
registerProcess('empire-meta', empireMetaProcess, { priority: 10 });
```

### Inter-Layer APIs

Layers communicate via well-defined interfaces:
- **Bottom-up**: Data aggregation and event bubbling
- **Top-down**: Configuration and directives

Example:
```typescript
// Room layer exposes aggregate stats
interface RoomStats {
  energyIncome: number;
  threatLevel: number;
  creepCount: number;
}

// Cluster layer consumes room stats
const clusterStats = rooms.reduce((acc, room) => ({
  energyIncome: acc.energyIncome + room.stats.energyIncome,
  // ...
}), initialStats);
```

## Future Enhancements

Potential improvements:
- **Dynamic layer skipping**: Skip cluster layer for single-room colonies
- **Cross-cluster coordination**: Temporary coalitions for major operations
- **Layer-specific caching**: Different TTLs per layer based on update frequency
- **Adaptive update frequencies**: Adjust based on CPU bucket and activity level

---

*This ADR documents the core organizational principle of the swarm architecture. The five-layer hierarchy has proven effective at managing complexity while maintaining performance across multiple shards and hundreds of rooms.*
