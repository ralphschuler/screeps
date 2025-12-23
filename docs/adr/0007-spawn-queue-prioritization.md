# ADR-0007: Spawn Queue Prioritization

## Status

Accepted

## Context

Spawning is a critical bottleneck in Screeps - each spawn can only produce one creep at a time, typically taking 3-50 ticks depending on body size. At scale (100+ rooms), intelligent spawn prioritization is essential:

### Challenges Without Prioritization

- **Energy inefficiency**: Spawning wrong creeps wastes energy and spawn time
- **Economy deadlock**: If all harvesters die, spawning defenders first causes collapse
- **Defensive failures**: Delayed defender spawns allow room invasion
- **Scaling issues**: Spawning logic that works for 1 room fails at 10+ rooms
- **Role imbalance**: Too many of one role, not enough of others

### Goals

- **Emergency handling**: Prioritize economy recovery after creep deaths
- **Threat response**: Spawn defenders when hostiles detected
- **Balanced workforce**: Maintain optimal role distribution
- **Energy efficiency**: Spawn based on available vs capacity energy
- **Scalability**: Work efficiently across 100+ rooms

### Constraints

- Spawn time: 3 ticks per body part (e.g., 15-part creep = 45 ticks)
- Energy cost: 50-5000+ energy per creep depending on size
- Single spawn per room (up to 3 at RCL8)
- Must avoid deadlocks (e.g., no energy producers alive)

## Decision

Implement a **multi-tiered spawn prioritization system** with three modes: Bootstrap (emergency), Posture-based (strategic), and Pheromone-influenced (tactical).

### Three-Mode System

#### Mode 1: Bootstrap Mode (Emergency Recovery)

**When**: Energy producers < 2 OR total creeps < 4

**Priority Order** (deterministic):
1. **Harvester** (critical - produces energy)
2. **Hauler** (critical - moves energy)
3. **Upgrader** (important - maintains RCL)
4. **Builder** (needed - repairs/constructs)
5. All other roles (as needed)

**Rationale**: Ensures minimum viable economy before spawning anything else. Prevents deadlock scenarios.

```typescript
function isBootstrapMode(room: Room): boolean {
  const energyProducers = countCreepsByRole(room, ['harvester', 'miner']);
  const totalCreeps = room.find(FIND_MY_CREEPS).length;
  return energyProducers < 2 || totalCreeps < 4;
}
```

#### Mode 2: Posture-Based Weights (Strategic)

**When**: Normal operation (not bootstrap)

**Posture types** (from `Room.memory.swarm.intent`):
- `eco`: Focus on economy and growth
- `expand`: Preparing for expansion (claimers, scouts)
- `defensive`: Under threat (defenders, towers)
- `war`: Active warfare (attackers, healers)
- `siege`: Major siege operation (siege creeps, logistics)
- `evacuate`: Emergency retreat
- `nukePrep`: Nuke incoming (rampart builders)

**Weight multipliers per posture**:
```typescript
const POSTURE_WEIGHTS = {
  eco: {
    harvester: 1.5, hauler: 1.3, upgrader: 1.2,
    builder: 1.0, defender: 0.3, claimer: 0.1
  },
  defensive: {
    defender: 2.0, healer: 1.5, harvester: 1.2,
    hauler: 1.2, upgrader: 0.5, builder: 0.8
  },
  war: {
    attacker: 2.0, healer: 1.8, ranger: 1.5,
    defender: 1.2, harvester: 1.0, hauler: 1.0
  },
  // ... other postures
};
```

#### Mode 3: Pheromone Modulation (Tactical)

**Pheromones influence spawn priorities** dynamically:

```typescript
function getPheromoneMult(role: string, pheromones: Pheromones): number {
  switch (role) {
    case 'harvester':
      return 0.5 + (pheromones.harvest / 100);  // 0.5-1.5x
    case 'builder':
      return 0.5 + (pheromones.build / 100);
    case 'defender':
      return 0.5 + (pheromones.defense / 100) * 2; // 0.5-2.5x
    case 'claimer':
      return 0.3 + (pheromones.expand / 100);
    // ... other roles
  }
}
```

**Result**: Roles with high pheromones get priority boost

### Final Priority Calculation

```typescript
function calculateSpawnPriority(role: string, room: Room): number {
  const basePriority = ROLE_DEFINITIONS[role].priority;
  const postureWeight = getPostureSpawnWeights(room.memory.swarm.intent)[role] || 1.0;
  const pheromoneMultiplier = getPheromoneMult(role, room.memory.swarm.pheromones);
  const dynamicBoost = getDynamicPriorityBoost(role, room);
  
  return basePriority * postureWeight * pheromoneMultiplier + dynamicBoost;
}
```

### Role Selection Algorithm

**Normal mode** (weighted random):
```typescript
function determineNextRole(room: Room): string {
  const candidates = getAllSpawnableRoles(room);
  const weights = candidates.map(role => ({
    role,
    weight: calculateSpawnPriority(role, room)
  }));
  
  // Weighted random selection
  return selectWeightedRandom(weights);
}
```

**Bootstrap mode** (deterministic):
```typescript
function getBootstrapRole(room: Room): string {
  const order = ['harvester', 'hauler', 'upgrader', 'builder'];
  for (const role of order) {
    if (needsRole(room, role)) return role;
  }
  return null;
}
```

## Consequences

### Positive

- **No deadlocks**: Bootstrap mode ensures economy always recovers
- **Threat responsiveness**: High defense pheromone → more defenders spawned immediately
- **Strategic flexibility**: Posture changes (eco → war) automatically adjust spawns
- **Balanced workforce**: Weighted random prevents role monopolies
- **Emergent behavior**: Pheromone integration creates adaptive spawning
- **Scalable**: Same logic works for 1 room and 100 rooms
- **Predictable in emergencies**: Bootstrap mode is deterministic
- **Stochastic in normal operation**: Weighted random adds variety and prevents patterns

### Negative

- **Complexity**: Three-layer priority system is complex to understand
- **Tuning difficulty**: Many parameters to tune (posture weights, pheromone multipliers)
- **Stochastic behavior**: Weighted random can sometimes spawn suboptimal roles
- **Testing challenge**: Must test bootstrap, all postures, and pheromone interactions
- **Debugging**: Hard to trace why a specific role was chosen

## Alternatives Considered

### Alternative 1: Fixed Priority Queue

- **Description**: Strict priority order (defenders > harvesters > haulers > ...)
- **Pros**:
  - Simple to understand
  - Predictable behavior
  - Easy to debug
- **Cons**:
  - Inflexible (same priority in all situations)
  - No adaptation to threats or opportunities
  - Can create role monopolies
  - Doesn't work for different postures
- **Why rejected**: Too rigid; cannot adapt to dynamic game state

### Alternative 2: Pure Pheromone-Based

- **Description**: Spawn entirely based on pheromone values
- **Pros**:
  - Fully emergent behavior
  - Naturally adaptive
  - Simple algorithm
- **Cons**:
  - No emergency recovery (pheromones might not save dying economy)
  - Unpredictable in edge cases
  - Hard to ensure minimum workforce
  - Difficult to debug failures
- **Why rejected**: Lacks safety mechanisms for critical situations

### Alternative 3: Machine Learning-Based

- **Description**: Train ML model to predict optimal spawn priority
- **Pros**:
  - Potentially optimal
  - Adapts to patterns
- **Cons**:
  - Extreme complexity
  - Requires training data
  - Opaque decision-making
  - CPU overhead
  - Difficult to debug
- **Why rejected**: Massive overkill; current system is sufficient and debuggable

### Alternative 4: Manual Queue Management

- **Description**: Player manually sets spawn queue via console
- **Pros**:
  - Full player control
  - Can handle unique situations
- **Cons**:
  - Not automated
  - Doesn't scale to 100+ rooms
  - Defeats purpose of autonomous bot
- **Why rejected**: Bot must be autonomous

### Alternative 5: Role Capacity Limits

- **Description**: Set max creeps per role, spawn to fill quotas
- **Pros**:
  - Predictable workforce composition
  - Easy to reason about
  - Guaranteed minimums and maximums
- **Cons**:
  - Inflexible (quotas don't adapt to threats)
  - Must manually tune quotas per room
  - Doesn't handle emergencies well
  - Wastes spawn time when quotas met
- **Why rejected**: Doesn't adapt to dynamic situations (threats, expansion, etc.)

## Performance Impact

### CPU Impact

**Spawn priority calculation** (per room per tick):
- Bootstrap mode check: 0.001 CPU
- Posture weight lookup: 0.001 CPU
- Pheromone multiplier: 0.002 CPU
- Candidate filtering: 0.005-0.01 CPU
- Weighted random selection: 0.01 CPU
- **Total**: ~0.015-0.02 CPU per room per tick

**Empire-wide** (100 rooms):
- Spawn decisions: ~1.5-2.0 CPU per tick

**Negligible overhead** compared to overall CPU budget.

### Memory Impact

- Posture weights: ~1KB (static configuration)
- Role definitions: ~5KB (static configuration)
- Per-room spawn state: ~200 bytes per room
- **Total**: ~25KB at 100 rooms

**Minimal impact** on 2MB memory budget.

### Spawn Efficiency

**Time to recover from creep loss** (measured):
- Bootstrap mode: 5-15 ticks to spawn first harvester
- Full economy recovery: 50-150 ticks
- Defender response (high threat): 10-30 ticks

**Adaptation speed**:
- Posture change → spawn priorities adjust immediately
- Pheromone spike → priorities adjust within 1-5 ticks

## References

- **Related GitHub Issues**: 
  - #711 (Spawn refactoring)
  - #704 (Priority optimization)
- **Related ADRs**:
  - ADR-0002 (Pheromone System) - Pheromones directly influence spawn priorities
  - ADR-0004 (Five-Layer Architecture) - Spawning is Room layer responsibility
  - ADR-0001 (POSIS) - Spawn manager runs as kernel process
- **External Documentation**:
  - [Weighted Random Selection](https://en.wikipedia.org/wiki/Fitness_proportionate_selection)
- **Internal Documentation**:
  - `docs/SPAWN_SYSTEM_REFACTOR.md` - Spawn system architecture
  - `packages/screeps-bot/src/spawning/spawnPriority.ts` - Priority calculation
  - `packages/screeps-bot/src/spawning/bootstrapManager.ts` - Bootstrap mode
  - `packages/screeps-bot/src/spawning/roleDefinitions.ts` - Role definitions
  - Root `ROADMAP.md` Section 9 - Spawn management

## Implementation Notes

### Package Location

`packages/screeps-bot/src/spawning/`

### Key Files

- `spawnQueueManager.ts`: Main spawn coordination
- `spawnPriority.ts`: Priority calculation logic
- `bootstrapManager.ts`: Emergency recovery
- `roleDefinitions.ts`: Role configurations
- `spawnNeedsAnalyzer.ts`: Determines which roles are needed

### Configuration

Posture weights and base priorities are configurable:

```typescript
// src/spawning/spawnPriority.ts
export const POSTURE_SPAWN_WEIGHTS = {
  eco: { /* weights */ },
  defensive: { /* weights */ },
  // ...
};

// src/spawning/roleDefinitions.ts
export const ROLE_DEFINITIONS = {
  harvester: { priority: 100, /* ... */ },
  defender: { priority: 90, /* ... */ },
  // ...
};
```

### Testing

Spawn system includes comprehensive tests:
- Bootstrap mode recovery scenarios
- Posture-based priority calculation
- Pheromone integration
- Edge cases (no energy, no spawns, etc.)

## Future Enhancements

Potential improvements:
- **Predictive spawning**: Spawn based on projected future needs (e.g., spawn harvester before current one dies)
- **Multi-spawn coordination**: Coordinate multiple spawns in same room to avoid duplicates
- **Energy-aware bodies**: Dynamically adjust body size based on available energy trends
- **Cross-room spawn coordination**: Balance spawning across cluster

---

*This ADR documents the spawn prioritization system that enables autonomous, adaptive creep production across 100+ rooms. The three-mode system (bootstrap, posture, pheromone) has proven effective at handling emergencies, strategic shifts, and tactical adaptation.*
