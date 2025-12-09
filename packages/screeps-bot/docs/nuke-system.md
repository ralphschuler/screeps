# Nuke System Documentation

## Overview

The nuke system implements comprehensive nuclear warfare capabilities as specified in ROADMAP Section 13. It handles nuke candidate evaluation, resource management, launch coordination, incoming nuke detection, and evacuation.

## Components

### 1. Nuke Manager (`src/empire/nukeManager.ts`)

The central component that coordinates all nuke operations.

#### Key Features

**Incoming Nuke Detection**
- Monitors all owned rooms for incoming nukes via `FIND_NUKES`
- Updates room danger level to maximum (3) on detection
- Sets `nukeDetected` flag in SwarmState to prevent spam
- Increases defense pheromones by 50 points
- Logs warnings with impact time
- Adds events to room event log

**Resource Management**
- Monitors nuker resource needs (energy and ghodium)
- Coordinates with Terminal Manager for inter-room transfers
- Finds optimal donor rooms based on:
  - Available resource amounts
  - Distance to target room
  - Terminal availability
- Requests high-priority transfers (priority 5)
- Logs nuker readiness status

**Nuke Launch Automation**
- Evaluates and scores nuke candidates based on:
  - Owner status (+30 points)
  - Threat level (+20 points for high threat)
  - Tower count (+5 points per tower)
  - Spawn count (+10 points per spawn)
  - Controller level (+3 points per RCL)
  - Distance penalty (-2 points per room)
  - War target bonus (+15 points)
- Only launches when in war mode
- Checks nuker readiness (300k energy, 5k ghodium)
- Targets room center (25, 25)
- Maximum range: 10 rooms

**Siege Coordination**
- Monitors active siege squads in all clusters
- Calculates optimal launch timing based on:
  - Squad ETA to target
  - Nuke flight time (50,000 ticks)
  - Coordination window (1,000 ticks before impact)
- Increases `nukeTarget` pheromone when launch window opens
- Ensures nukes land shortly before siege squads arrive
- Estimates squad ETA based on member positions or rally room

#### Configuration

```typescript
{
  updateInterval: 500,          // Run every 500 ticks
  minGhodium: 5000,            // Min ghodium to launch
  minEnergy: 300000,           // Min energy to launch
  minScore: 50,                // Min candidate score
  siegeCoordinationWindow: 1000, // Ticks before impact to coordinate
  nukeFlightTime: 50000,       // Nuke flight duration
  terminalPriority: 5          // High priority for transfers
}
```

### 2. Terminal Manager Integration (`src/economy/terminalManager.ts`)

Enhanced with public API for resource transfer requests.

#### New Public Method

```typescript
requestTransfer(
  fromRoom: string,
  toRoom: string,
  resourceType: ResourceConstant,
  amount: number,
  priority: number = 3
): boolean
```

**Features:**
- Validates rooms and terminals exist
- Prevents duplicate transfer requests
- Queues transfers by priority
- Used by nuke manager for ghodium/energy acquisition

### 3. Evacuation Manager Enhancement (`src/defense/evacuationManager.ts`)

Improved nuke detection and awareness.

**Enhancements:**
- Uses `nukeDetected` flag from SwarmState
- Logs detailed nuke count and impact timing
- Triggers evacuation 5,000 ticks before impact (configurable)
- Prioritizes resources for evacuation:
  1. Energy, Power, Ghodium
  2. T3 Boosts (catalyzed compounds)
  3. OPS
  4. Other resources
- Recalls all creeps from evacuating rooms

## Integration Points

### Pheromone System

The nuke system integrates with pheromones:

- **defense**: Increased by 50 on nuke detection
- **war**: Increased based on siege/war status
- **siege**: Coordinated with nuke launches
- **nukeTarget**: Set to high value when launch window opens

### Squad System

Coordinates with siege squads:
- Monitors squad state (gathering, moving, attacking)
- Calculates ETA based on member positions
- Times nuke launches to arrive before squads
- Increases tactical effectiveness

### Memory/State

Uses SwarmState fields:
- `nukeDetected`: Boolean flag for incoming nukes
- `danger`: Set to 3 on nuke detection
- `pheromones`: Multiple pheromone updates
- `eventLog`: Records nuke events

## Usage Example

### Launching Offensive Nukes

1. Set war mode: `Memory.empire.objectives.warMode = true`
2. Add war targets: `Memory.empire.warTargets.push("W2N2")`
3. Ensure nukers are built (RCL 8 required)
4. System automatically:
   - Scores targets
   - Requests ghodium transfers
   - Coordinates with siege squads
   - Launches at optimal timing

### Responding to Incoming Nukes

1. System automatically detects via `FIND_NUKES`
2. Updates room state and pheromones
3. Logs warnings with impact time
4. Evacuation manager triggers at 5,000 ticks
5. Resources transferred to safe rooms
6. Creeps recalled automatically

## Testing

Comprehensive test coverage in `test/unit/nukeManager.test.ts`:

- Incoming nuke detection (2 tests)
- Nuke candidate scoring (2 tests)
- Resource management (1 test)
- Siege coordination (1 test)
- Squad ETA estimation (2 tests)

All tests use proper mocking and validate:
- Pheromone updates
- Danger level changes
- Event logging
- Resource transfer logic
- Timing calculations

## Performance Considerations

- Runs at low frequency (500 tick interval)
- CPU budget: 0.01 (1% of available CPU)
- Minimum bucket: 8,000
- Priority: LOW (defers to critical operations)

## Future Enhancements

Potential improvements not yet implemented:

1. **Multi-nuke salvos**: Coordinate multiple nukes on same target
2. **Nuke dodging**: Move valuable structures away from impact zones
3. **Decoy nukes**: Launch at secondary targets to split defenses
4. **Nuke trading**: Coordinate with allies for simultaneous strikes
5. **Impact zone optimization**: Calculate optimal impact points based on structure positions
6. **Automated safe mode**: Trigger safe mode after nuke impact if needed

## Related ROADMAP Sections

- **Section 13**: Nukes (Atomschläge) - Primary specification
- **Section 11**: Cluster- & Empire-Logik - Squad coordination
- **Section 5**: Pheromon-System - Integration with pheromones
- **Section 15**: Markt-Integration - Resource acquisition

## Command Reference

Manual commands for testing/debugging:

```javascript
// Check nuke status
for (const room of Object.values(Game.rooms)) {
  const nukes = room.find(FIND_NUKES);
  if (nukes.length > 0) {
    console.log(`${room.name}: ${nukes.length} nuke(s), impact in ${nukes[0].timeToLand} ticks`);
  }
}

// Check nuker readiness
for (const room of Object.values(Game.rooms)) {
  const nuker = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_NUKER
  })[0];
  if (nuker) {
    console.log(`${room.name} nuker: ${nuker.store[RESOURCE_ENERGY]}E, ${nuker.store[RESOURCE_GHODIUM]}G`);
  }
}

// View nuke candidates
console.log(JSON.stringify(Memory.empire.nukeCandidates, null, 2));

// Force evacuation test
const evacuationManager = require('./defense/evacuationManager').evacuationManager;
evacuationManager.startEvacuation("W1N1", "manual");
```
