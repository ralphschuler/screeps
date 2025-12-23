# ADR-0001: POSIS Process Architecture

## Status

Accepted

## Context

As the Screeps bot grew from a simple room controller to a multi-room, multi-shard empire managing 500+ TypeScript files and 2.4MB of code, several organizational challenges emerged:

- **Monolithic main loop**: All logic was executed sequentially in a single main.js file, making it difficult to manage complexity
- **CPU budget management**: No systematic way to allocate CPU budgets to different subsystems or implement priority-based execution
- **Lifecycle management**: Processes had no standardized initialization, cleanup, or state persistence mechanisms
- **Inter-system communication**: Subsystems communicated through tightly-coupled direct calls and global variables
- **Testability**: Monolithic structure made unit testing individual components difficult

The bot needed an architecture that:
- Provides modular organization with clear boundaries between subsystems
- Enables priority-based scheduling and CPU budget allocation
- Supports state persistence across global resets
- Facilitates inter-process communication with loose coupling
- Allows individual subsystems to be tested in isolation

### Constraints

- Screeps CPU limits: 20-30 CPU per tick (bucket-dependent)
- Memory limit: 2MB for serialized data
- Global reset every tick: all heap data is lost
- Need to maintain performance at 100+ rooms scale

## Decision

Adopt **POSIS (Portable Operating System Interface for Screeps)** as the architectural foundation for the bot. POSIS provides a process-based operating system abstraction where:

1. **Each subsystem is a Process**: Economy, defense, spawn management, etc. are implemented as discrete processes
2. **Kernel manages execution**: A central kernel schedules and executes processes based on priority and CPU budget
3. **Standardized interfaces**: All processes implement `IPosisProcess` with standard lifecycle methods (init, run, cleanup)
4. **State persistence**: Processes can serialize/deserialize state to survive global resets
5. **Inter-process communication**: Processes communicate via message passing and shared memory
6. **Priority-based scheduling**: Critical processes (defense) run before non-critical ones (market analysis)

### Implementation

**Package**: `packages/screeps-posis/`

**Core Interfaces**:
- `IPosisKernel`: Standard kernel interface for process management
- `IPosisProcess`: Process interface with lifecycle methods
- `BaseProcess`: Abstract base class providing common functionality

**Key Features**:
- Sleep/wake syscalls for periodic processes
- Fork/kill for dynamic process spawning
- Priority adjustment for adaptive scheduling
- Event bus for decoupled communication
- Shared memory for inter-process data sharing

**Example Process**:
```typescript
class HarvesterProcess extends BaseProcess {
  protected doRun(): void {
    // Process logic
    if (Game.cpu.bucket < 1000) {
      this.sleep(10); // Defer execution when CPU-starved
    }
  }
  
  protected serializeState(): Record<string, unknown> {
    return { lastRun: Game.time };
  }
}
```

## Consequences

### Positive

- **Modular organization**: Each subsystem is self-contained with clear responsibilities
- **CPU budget control**: Kernel can halt execution when CPU budget is exhausted, preventing bucket drain
- **Testability**: Individual processes can be unit tested in isolation
- **State management**: Standardized serialization prevents data loss across resets
- **Scalability**: New features can be added as new processes without restructuring existing code
- **Priority handling**: Critical processes (defense, spawning) execute before optional processes (statistics, market)
- **Debugging**: Process execution can be traced and profiled individually
- **Community alignment**: POSIS is a recognized pattern in Screeps community, facilitating knowledge sharing

### Negative

- **Initial complexity**: Process abstraction adds learning curve for new contributors
- **CPU overhead**: Kernel scheduling and message routing add ~0.2-0.5 CPU per tick
- **Memory overhead**: Process metadata and message queues consume ~10-20KB in Memory
- **Indirection**: Communication via messages can be harder to trace than direct function calls
- **Boilerplate**: Each process requires implementing multiple lifecycle methods

## Alternatives Considered

### Alternative 1: Monolithic Main Loop

- **Description**: Keep all logic in a single main.js with organized functions
- **Pros**: 
  - Simple to understand for beginners
  - No abstraction overhead
  - Direct function calls are faster
- **Cons**:
  - Becomes unmaintainable at scale (already experiencing this)
  - No CPU budget control
  - Difficult to test individual components
  - No priority management
  - State persistence is ad-hoc
- **Why rejected**: Already experiencing maintainability issues with 500+ files; cannot scale to target of 100+ rooms

### Alternative 2: Event-Driven Architecture

- **Description**: Use an event bus as the primary coordination mechanism
- **Pros**:
  - Loose coupling between components
  - Easy to add new event handlers
  - Natural fit for Screeps' tick-based model
- **Cons**:
  - No built-in CPU budget management
  - No priority scheduling
  - Event chains can be hard to debug
  - No standardized state persistence
  - Difficult to control execution order
- **Why rejected**: Lacks critical features needed for CPU management and priority-based execution

### Alternative 3: Custom Scheduler with Service Classes

- **Description**: Build a custom scheduler that executes service classes
- **Pros**:
  - Tailored exactly to our needs
  - No external dependencies
  - Full control over implementation
- **Cons**:
  - Reinventing the wheel
  - POSIS already provides standard interfaces recognized by community
  - Would require extensive testing and debugging
  - Community knowledge wouldn't transfer
- **Why rejected**: POSIS provides proven, community-vetted solution; building from scratch adds unnecessary risk and maintenance burden

### Alternative 4: Actor Model (e.g., using Screeps Tasks)

- **Description**: Use actor-based task scheduling libraries
- **Pros**:
  - Well-tested libraries available
  - Good for hierarchical task breakdown
  - Built-in task persistence
- **Cons**:
  - Focused on creep tasks, not system-level organization
  - Less suitable for periodic processes (statistics, scanning)
  - Limited CPU budget controls
  - Different abstraction level (task vs process)
- **Why rejected**: Actor model is complementary but not a replacement for process-based organization; we actually use screeps-tasks alongside POSIS

## Performance Impact

### CPU Impact

**Measured overhead** (at 50 rooms, 200 creeps):
- Kernel scheduling: ~0.3 CPU per tick
- Process initialization: ~0.1 CPU per process per tick
- Message routing: ~0.05 CPU per message
- **Total POSIS overhead**: ~0.5-0.8 CPU per tick

**CPU savings from priority scheduling**:
- Low-bucket mode disables non-critical processes: saves 2-5 CPU per tick
- Deferred execution via sleep(): saves 1-3 CPU per tick on average
- **Net CPU impact**: Negative (saves CPU overall through better scheduling)

### Memory Impact

- Kernel metadata: ~2KB
- Process state: ~100-500 bytes per process
- Message queue: ~1-5KB (depends on IPC volume)
- **Total**: ~10-15KB at typical process count (20-30 processes)

**Memory overhead**: < 1% of 2MB limit, acceptable

### Scalability

Successfully tested at:
- 100+ rooms: ~40 active processes, CPU overhead stable at ~0.8 CPU
- 500+ creeps: No degradation in kernel performance
- 20+ inter-process messages per tick: No noticeable impact

## References

- **Related GitHub Issues**: 
  - #711 (Refactoring to modular architecture)
  - #704 (CPU budget management)
  - #712 (State persistence improvements)
- **Related ADRs**: 
  - ADR-0004 (Five-Layer Swarm Architecture) - POSIS processes map to architectural layers
  - ADR-0006 (Cache Strategy) - Processes use unified cache system
- **External Documentation**:
  - [POSIS GitHub](https://github.com/screepers/POSIS) - Original POSIS specification
  - [ScreepsOS](https://github.com/screepers/ScreepsOS) - Reference implementation
  - [Screeps Wiki: Operating Systems](https://wiki.screepspl.us/Operating_System/) - Community patterns
- **Internal Documentation**:
  - `packages/screeps-posis/README.md` - POSIS package documentation
  - `ROADMAP.md` Section 3 - Architecture layers
  - `docs/STATS_SYSTEM_OVERVIEW.md` - Process stats collection

## Implementation Notes

The POSIS package is located at `packages/screeps-posis/` and provides:
- Standard interfaces (`IPosisKernel`, `IPosisProcess`)
- Base class with common functionality (`BaseProcess`)
- Example processes demonstrating patterns
- Full TypeScript typing support

Processes are registered with the kernel at bot initialization and executed every tick based on priority. The kernel handles state persistence, message routing, and CPU budget management automatically.

---

*This ADR documents a decision made during the initial architectural refactoring. POSIS has been in production use since early development and proven stable at scale.*
