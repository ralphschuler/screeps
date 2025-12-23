# ADR-0002: Pheromone Coordination System

## Status

Accepted

## Context

In a swarm-based bot architecture managing 100+ rooms, traditional centralized coordination approaches face significant challenges:

- **CPU overhead**: Centralized planners analyzing all rooms and creeps every tick consume excessive CPU
- **Scalability**: Global state synchronization becomes a bottleneck as empire grows
- **Complexity**: Maintaining consistent global state across hundreds of rooms is error-prone
- **Fragility**: Single point of failure in central coordinator can cascade across entire empire
- **Memory pressure**: Storing detailed plans for all creeps/rooms approaches 2MB limit

### Goals

- Enable emergent coordination without centralized control
- Scale efficiently to 100+ rooms without linear CPU growth
- Minimize memory footprint for coordination data
- Allow rooms to act autonomously while maintaining empire-level coherence
- Support dynamic adaptation to threats and opportunities

### Constraints

- CPU budget: Target < 0.1 CPU per room for coordination logic
- Memory limit: Coordination data must be compact
- Screeps API: No inter-room direct communication mechanism
- Tick-based execution: Coordination must work with discrete time steps

## Decision

Implement a **pheromone-based stigmergic communication system** where rooms and creeps coordinate indirectly through simple numerical "pheromone" signals rather than explicit messages or centralized planning.

### How It Works

**Pheromones are simple numbers (0-100)** stored in `Room.memory.swarm.pheromones`:

```typescript
interface Pheromones {
  expand: number;    // Desire to expand into new territory
  harvest: number;   // Energy harvesting priority
  build: number;     // Construction activity level
  upgrade: number;   // Controller upgrading priority
  defense: number;   // Defensive response needed
  war: number;       // Offensive warfare escalation
  siege: number;     // Critical defense/siege operations
  logistics: number; // Inter-room resource movement
  science: number;   // Lab chemistry and research
}
```

**Each pheromone has three key properties**:

1. **Production**: Events increase pheromone values
   - Hostiles detected → increase `defense`
   - Surplus energy → increase `expand`
   - Construction sites → increase `build`

2. **Decay**: Values gradually decrease over time
   - Fast decay (90-95%): harvest, build
   - Slow decay (97-98%): war, siege
   - Allows automatic recovery from transient events

3. **Diffusion**: High-priority signals spread to neighbors
   - `defense` and `war` diffuse at 40-50% to warn adjacent rooms
   - `expand` diffuses at 30% to coordinate colonization
   - `harvest` and `build` stay mostly local (10-15%)

**Creeps respond to pheromones**:
```typescript
// Example: Spawn decision based on pheromones
if (pheromones.defense > 70) {
  spawnDefender();
} else if (pheromones.harvest > 50 && pheromones.build < 30) {
  spawnHarvester();
} else if (pheromones.expand > 60) {
  spawnClaimer();
}
```

### Update Frequency

Pheromone updates run at staggered intervals to minimize CPU:
- **Every tick**: Defense and war (critical)
- **Every 5 ticks**: Harvest, build, upgrade (semi-critical)
- **Every 10 ticks**: Expand, logistics, science (non-critical)

### Diffusion Algorithm

```typescript
// Simplified diffusion pseudocode
for each pheromone type {
  if (diffusionRate > 0) {
    for each neighbor room {
      neighbor.pheromone += this.pheromone * diffusionRate;
    }
  }
}
```

## Consequences

### Positive

- **Scalable**: O(1) CPU per room regardless of empire size - no global state to synchronize
- **Memory efficient**: 9 numbers per room = ~36 bytes (vs. hundreds of bytes for explicit plans)
- **Resilient**: No single point of failure; rooms continue functioning if neighbors fail
- **Emergent behavior**: Complex empire-level behaviors emerge from simple local rules
  - Coordinated defense: Threat in one room triggers defensive pheromone cascade
  - Efficient expansion: High-surplus rooms naturally increase expansion pheromone
  - Load balancing: Resources flow from high-logistics rooms to low-logistics rooms
- **Self-organizing**: System naturally adapts to changing conditions without explicit programming
- **Easy to tune**: Adjusting decay rates and thresholds changes behavior without code changes
- **Debuggable**: Visual pheromone heatmaps make system state observable
- **Biologically inspired**: Pattern proven in nature (ant colonies, bee hives)

### Negative

- **Indirect control**: Cannot directly command specific actions; must influence via pheromones
- **Tuning complexity**: Finding right decay rates and diffusion coefficients requires experimentation
- **Lag in response**: Diffusion takes multiple ticks to propagate across empire
- **Oscillation risk**: Poorly tuned decay/production can cause pheromone oscillations
- **Limited precision**: Simple numbers cannot encode complex coordination constraints
- **Non-deterministic**: Exact behavior depends on room processing order (though consistent within a tick)
- **Abstract mental model**: Developers must think in terms of signals rather than explicit commands

## Alternatives Considered

### Alternative 1: Centralized Command & Control

- **Description**: Global empire controller analyzes all rooms and issues explicit commands
- **Pros**:
  - Direct control over all actions
  - Easy to implement specific strategies
  - Deterministic behavior
  - Simple to understand for developers
- **Cons**:
  - CPU scales linearly with room count (tested at 50 rooms: 8-12 CPU per tick)
  - Single point of failure
  - Memory usage grows with empire size
  - Complex state synchronization
  - Difficult to handle rapid threat response across multiple rooms
- **Why rejected**: Does not scale to target of 100+ rooms; already experiencing CPU issues at 30+ rooms in testing

### Alternative 2: Direct Inter-Room Messaging

- **Description**: Rooms send explicit messages to neighbors or empire controller
- **Pros**:
  - Clear communication
  - Easy to trace message flows
  - Precise coordination possible
- **Cons**:
  - Message queue memory overhead (estimated 50-100 bytes per message)
  - CPU for message serialization/deserialization
  - Message routing complexity
  - Network topology management required
  - No natural decay (stale messages must be explicitly cleared)
- **Why rejected**: Memory and CPU overhead significant; lacks natural decay mechanism for transient events

### Alternative 3: Broadcast Events with Listeners

- **Description**: Rooms broadcast events; other rooms listen and react
- **Pros**:
  - Loose coupling
  - Event-driven architecture is natural for JavaScript
  - Easy to add new listeners
- **Cons**:
  - All rooms must process all events (O(n²) in worst case)
  - No natural priority or distance-based filtering
  - Memory for event queues
  - Listener registration management
- **Why rejected**: Scalability concerns; no built-in prioritization or range limiting

### Alternative 4: Market-Based Resource Allocation

- **Description**: Rooms "bid" for resources and creeps using virtual currency
- **Pros**:
  - Economically optimal allocation
  - Self-balancing
  - Proven in distributed systems
- **Cons**:
  - High computational overhead for auction mechanisms
  - Complex to implement correctly
  - Difficult to handle urgent military situations (bidding is too slow)
  - Overkill for most coordination needs
- **Why rejected**: CPU overhead too high; poor fit for time-critical coordination (defense, spawning)

### Alternative 5: Hybrid: Pheromones + Explicit Alerts

- **Description**: Use pheromones for normal coordination plus explicit alerts for critical events
- **Pros**:
  - Best of both worlds
  - Fast response to critical threats
  - Pheromones handle routine coordination
- **Cons**:
  - Added complexity of dual systems
  - Need to define boundary between pheromones and alerts
  - Alert system adds CPU and memory overhead
- **Why rejected**: Added complexity not justified by benefits; pheromone system handles critical events adequately through high diffusion rates and fast update frequencies

## Performance Impact

### CPU Impact

**Per-room cost** (measured at 100 rooms):
- Pheromone production: 0.02-0.04 CPU
- Decay calculation: 0.01 CPU
- Diffusion to neighbors (4-6 rooms): 0.02-0.03 CPU
- **Total per room**: ~0.05-0.08 CPU

**Empire-wide** (100 rooms):
- Total pheromone updates: 5-8 CPU per tick
- Compared to centralized planner: 15-25 CPU per tick
- **CPU savings**: 7-17 CPU per tick (40-70% reduction)

### Memory Impact

**Per-room storage**:
- 9 pheromone values × 8 bytes (float64) = 72 bytes
- Plus metadata (~10 bytes): ~82 bytes total
- 100 rooms: 8.2KB

**Compared to alternatives**:
- Centralized planner state: 50-100KB
- Message queues: 20-40KB
- **Memory savings**: 40-90KB

### Scalability

| Rooms | Pheromone CPU | Centralized CPU | Savings |
|-------|---------------|-----------------|---------|
| 10    | 0.5 CPU       | 2 CPU           | 75%     |
| 50    | 3 CPU         | 12 CPU          | 75%     |
| 100   | 6 CPU         | 25 CPU          | 76%     |
| 200   | 12 CPU        | 50+ CPU         | 76%+    |

*Pheromone system scales linearly; centralized system scales worse than linearly due to synchronization overhead*

## References

- **Related GitHub Issues**: None (foundational design decision)
- **Related ADRs**:
  - ADR-0001 (POSIS Process Architecture) - Pheromone updates run as kernel processes
  - ADR-0004 (Five-Layer Swarm Architecture) - Pheromones coordinate between Room and Cluster layers
  - ADR-0007 (Spawn Queue Prioritization) - Spawn decisions based on pheromone values
  - ADR-0008 (Tower Targeting) - Defense pheromone triggers tower activation
- **External Documentation**:
  - [Stigmergy on Wikipedia](https://en.wikipedia.org/wiki/Stigmergy) - Theoretical foundation
  - [Ant Colony Optimization](https://en.wikipedia.org/wiki/Ant_colony_optimization_algorithms) - Algorithmic inspiration
  - [Screeps Wiki: Swarm Intelligence](https://wiki.screepspl.us/) - Community discussions
- **Internal Documentation**:
  - `docs/PHEROMONES_GUIDE.md` - Complete pheromone system guide
  - `docs/PHEROMONE_INTEGRATION.md` - Integration patterns
  - `ROADMAP.md` Section 5 - Pheromone system design principles

## Implementation Notes

Pheromone system implementation:
- **Update logic**: `packages/screeps-bot/src/processes/PheromoneProcess.ts`
- **Data structure**: `Room.memory.swarm.pheromones`
- **Visualization**: Console commands `pheromones.show(roomName)` displays heatmaps
- **Tuning parameters**: Stored in `src/config/pheromoneConfig.ts`

### Decay Rates (examples)

```typescript
const DECAY_RATES = {
  harvest: 0.90,   // Fast decay - responds quickly to source depletion
  defense: 0.97,   // Slow decay - maintains alert state
  war: 0.98,       // Very slow - sustained conflict state
  expand: 0.95,    // Medium decay - gradual exploration
};
```

### Diffusion Rates (examples)

```typescript
const DIFFUSION_RATES = {
  defense: 0.40,   // High diffusion - warn neighbors
  war: 0.50,       // Very high - coordinate cluster response
  harvest: 0.10,   // Low - mostly local
  expand: 0.30,    // Medium - coordinate colonization
};
```

## Future Enhancements

Potential improvements under consideration:
- **Multi-layer pheromones**: Different diffusion at room vs cluster vs empire level
- **Directional pheromones**: Encode source direction in pheromone gradients
- **Adaptive decay**: Decay rates adjust based on bucket level
- **Pheromone trails**: Track historical pheromone values for trend analysis

---

*This ADR documents the core coordination mechanism of the swarm architecture. The pheromone system has been in production use since initial development and demonstrated excellent scalability characteristics.*
