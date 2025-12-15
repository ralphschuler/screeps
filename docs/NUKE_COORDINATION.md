# Nuke Coordination System

## Overview

The comprehensive nuke coordination system manages all aspects of nuclear warfare in Screeps, from targeting and economics to defense and counter-strikes.

## Features

### 1. Nuke Salvo Coordination

**Purpose**: Coordinate multiple nukes to hit the same target simultaneously for maximum impact.

**How it works**:
- Tracks all nukes in flight via `NukeInFlight` data structure
- Groups nukes by target room
- Assigns salvo IDs when nukes hit within 10 ticks of each other
- Logs coordination status

**Example**:
```typescript
// Two nukes launched from different rooms
Nuke 1: Impact at tick 51000
Nuke 2: Impact at tick 51005
Spread: 5 ticks (< 10 tick window)
Result: Assigned salvo ID "salvo-W2N2-51000"
```

### 2. Impact Prediction & Damage Assessment

**Purpose**: Calculate expected damage before launching to ensure strikes are worthwhile.

**Calculations**:
- **Center damage**: 10M hits at landing position
- **Radius damage**: 5M hits within range 2
- **Structure value**: Estimated energy equivalent of destroyed structures
- **ROI**: Estimated gain / (300k energy + 5k ghodium)

**Intelligence modes**:
- **Visible room**: Precise calculation using actual structure positions
- **Intel-based**: Estimation based on cached room intel (towers, spawns, RCL)

### 3. Siege Squad Deployment

**Purpose**: Coordinate ground troops to arrive as nukes land, exploiting the safe mode cooldown.

**Timing**:
- Deploy squads when nuke impact is ~1000 ticks away
- Squads arrive to exploit 200-tick safe mode cooldown
- Links nukes with siege squads via `siegeSquadId`

**Process**:
1. Monitor nukes in flight
2. When impact < 1000 ticks, find nearest cluster
3. Create or assign siege squad to target
4. Squad arrives to capitalize on weakened defenses

### 4. Incoming Nuke Detection & Alerts

**Purpose**: Early warning system for defending against incoming nukes.

**Detection**:
- Scans `Game.rooms[room].nukes` each tick
- Creates `IncomingNukeAlert` for each detected nuke
- Tracks source room, landing position, ETA

**Alert system**:
- Updates danger level to 3 (maximum)
- Increases defense pheromone by 50
- Increases siege pheromone by 30
- Logs threatened structures

**Evacuation**:
- Triggered when critical structures (spawn/storage/terminal) are threatened
- If impact < 5000 ticks: Switch to "evacuate" posture
- If impact >= 5000 ticks: Switch to "defensive" posture

### 5. Counter-Nuke Strategies

**Purpose**: Automatically retaliate against nuke attackers.

**Conditions for counter-nuke**:
1. Source room identified (via `nuke.launchRoomName`)
2. Enemy has RCL 8 (nuker capability)
3. War pheromone >= 60 in threatened room
4. Sufficient resources (2x nuke cost as buffer)

**Actions**:
- Adds source room to `warTargets`
- Increases war pheromone by 30 empire-wide
- Logs counter-nuke authorization

### 6. Nuke Economics Analysis

**Purpose**: Track costs vs gains to ensure nukes are cost-effective.

**Tracked metrics**:
- `nukesLaunched`: Total count
- `totalEnergyCost`: 300k per nuke
- `totalGhodiumCost`: 5k per nuke
- `totalDamageDealt`: Cumulative hits dealt
- `totalValueDestroyed`: Estimated energy equivalent
- `lastROI`: Most recent return on investment

**ROI threshold**: 2.0x (gain must be at least 2x cost)

**Logging**: Reports every 5 nukes launched

### 7. Strategic Target Prioritization

**Purpose**: Score targets based on strategic value and war objectives.

**Scoring factors**:
1. **Enemy RCL** (×3 per level): Higher level = more valuable
2. **Structure density**: 
   - Towers: +5 per tower
   - Spawns: +10 per spawn
3. **Ownership**: +30 for owned rooms
4. **War pheromone**: +1 per 10 pheromone
5. **Strategic position**: +10 for highways
6. **High threat**: +20 for threat level >= 2
7. **Distance penalty**: -2 per room away
8. **War target**: +15 for alignment with empire objectives
9. **ROI bonus**: Up to +20 for high ROI, -20 for low ROI

**Minimum score**: 35 (configurable)

## Configuration

### Default Settings

```typescript
const DEFAULT_CONFIG = {
  updateInterval: 500,           // Ticks between updates
  minGhodium: 5000,             // Min ghodium to launch
  minEnergy: 300000,            // Min energy to launch
  minScore: 35,                 // Min target score
  siegeCoordinationWindow: 1000, // Deploy squads this many ticks before impact
  nukeFlightTime: 50000,        // Nuke flight time
  terminalPriority: 5,          // Priority for resource transfers
  donorRoomBuffer: 1000,        // Buffer to keep in donor rooms
  salvoSyncWindow: 10,          // Max ticks between salvo nukes
  roiThreshold: 2.0,            // Min ROI to launch (2x)
  counterNukeWarThreshold: 60   // Min war pheromone for counter-nuke
};
```

### Customization

```typescript
// Create custom nuke manager
const customNukeManager = new NukeManager({
  minScore: 40,              // Raise target threshold
  roiThreshold: 3.0,         // Require 3x ROI
  salvoSyncWindow: 5         // Tighter salvo timing
});
```

## Memory Structure

### NukeInFlight

```typescript
interface NukeInFlight {
  id: string;                  // Unique ID
  sourceRoom: string;          // Launching room
  targetRoom: string;          // Target room
  targetPos: { x, y };        // Landing position
  launchTick: number;         // When launched
  impactTick: number;         // When impacts (launchTick + 50000)
  salvoId?: string;           // Salvo coordination ID
  siegeSquadId?: string;      // Linked siege squad
  estimatedDamage?: number;   // Predicted hits dealt
  estimatedValue?: number;    // Predicted energy value destroyed
}
```

### IncomingNukeAlert

```typescript
interface IncomingNukeAlert {
  roomName: string;                  // Room under threat
  landingPos: { x, y };             // Impact position
  impactTick: number;               // When nuke lands
  timeToLand: number;               // Ticks remaining
  detectedAt: number;               // First detection tick
  threatenedStructures?: string[];  // Structures in blast radius
  evacuationTriggered: boolean;     // Whether evacuation started
  sourceRoom?: string;              // Nuke source (for counter-strike)
}
```

### NukeEconomics

```typescript
interface NukeEconomics {
  nukesLaunched: number;        // Total nukes fired
  totalEnergyCost: number;      // 300k per nuke
  totalGhodiumCost: number;     // 5k per nuke
  totalDamageDealt: number;     // Cumulative hits dealt
  totalValueDestroyed: number;  // Cumulative value destroyed
  lastROI?: number;             // Most recent ROI calculation
  lastLaunchTick?: number;      // Last nuke launch tick
}
```

## Usage Examples

### Launching a Nuke

The system automatically handles launching when conditions are met:

1. War mode enabled: `overmind.objectives.warMode = true`
2. Target in war targets: `overmind.warTargets.push("W2N2")`
3. Nuker loaded with 300k energy + 5k ghodium
4. Target score >= 35
5. ROI >= 2.0x

### Coordinating a Salvo

```typescript
// System automatically coordinates if:
// - Multiple nukers available
// - Same target room
// - Impact times within 10 ticks

// Nuke 1 from W1N1 → W3N3, impact: 51000
// Nuke 2 from W1N2 → W3N3, impact: 51005
// Result: Both assigned salvoId "salvo-W3N3-51000"
```

### Defending Against Nukes

```typescript
// Automatic when nuke detected:
// 1. Alert created in overmind.incomingNukes
// 2. Danger level → 3
// 3. Defense pheromone +50
// 4. If critical structures threatened:
//    - timeToLand < 5000: posture = "evacuate"
//    - timeToLand >= 5000: posture = "defensive"
```

### Counter-Nuke Response

```typescript
// Automatic when conditions met:
// 1. Incoming nuke detected with source room
// 2. Enemy has RCL 8
// 3. War pheromone >= 60
// 4. Resources available (600k energy, 10k ghodium)
// → Enemy added to warTargets
// → War pheromone +30 empire-wide
```

## Integration Points

### With Siege Squads

- Nukes trigger automatic siege squad deployment
- Squads created via cluster's squad system
- Timing coordinated to exploit safe mode cooldown

### With War System

- Respects `overmind.objectives.warMode`
- Uses `overmind.warTargets` for targeting
- Updates war pheromones for escalation

### With Terminal Manager

- Requests ghodium transfers to nuker rooms
- Uses priority 5 for nuke resource transfers
- Maintains donor room buffers

### With Intel System

- Uses `overmind.roomIntel` for scoring
- Updates intel when nukes detected
- Tracks enemy capabilities (RCL, structures)

## Logging

### Info Level
- Nuke candidates identified
- Resources transferred for nukers
- Nukers ready to launch
- Siege squads deployed
- Cleanup operations

### Warn Level
- **NUKE LAUNCHED** with damage/ROI predictions
- **INCOMING NUKE DETECTED** with ETA and count
- **COUNTER-NUKE AUTHORIZED** for retaliation
- **EVACUATION TRIGGERED** for critical threats
- Desynchronized salvos
- Resource shortages

### Error Level
- Nuke launch failures
- Configuration errors

## Performance

- **CPU Budget**: 0.01 per tick (low frequency process)
- **Update Interval**: 500 ticks
- **Memory Impact**: ~100 bytes per nuke in flight
- **Cleanup**: Automatic removal of impacted nukes

## Roadmap Alignment

Implements **ROADMAP.md Section 13** requirements:

✅ Nuke detection (incoming)
✅ Nuke scoring & targeting
✅ Resource management (ghodium accumulation)
✅ Coordination with siege squads
✅ Safe mode impact handling
✅ Cost/benefit analysis
✅ Strategic alignment

## Testing

Comprehensive unit tests cover:
- Timing calculations
- ROI calculations
- Impact prediction
- Salvo coordination
- Counter-nuke logic
- Evacuation triggers
- Economics tracking
- Cleanup operations

Run tests: `npm run test:unit`
