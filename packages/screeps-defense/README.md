# @ralphschuler/screeps-defense

Defense subsystem for Screeps bot - comprehensive threat assessment, tower control, rampart automation, and emergency response coordination.

## Features

### Threat Assessment
- **Composite Threat Scoring**: Analyzes hostile creeps based on body composition, boosts, and capabilities
- **Danger Levels**: 4-tier danger scale (0-3) aligned with ROADMAP Section 12
- **DPS Calculation**: Accurate damage estimation considering attack and ranged attack parts
- **Role Classification**: Identifies healers, ranged attackers, melee attackers, and dismantlers
- **Tower Effectiveness**: Calculates actual tower damage with range falloff
- **Recommended Response**: Suggests defense strategy (monitor, defend, assist, retreat, safemode)

### Structure Defense
- **Rampart Automation**: Automatically places and maintains ramparts on critical structures
- **Dynamic Health Targets**: Adjusts rampart/wall health based on RCL and danger level
- **Core-Shell Protection**: Implements ROADMAP Section 17 protection strategy
- **Perimeter Defense**: Automated wall and rampart placement around room perimeter
- **Road-Aware Defense**: Optimizes defense placement considering road networks

### Multi-Room Coordination
- **Defense Coordinator**: Manages defense assistance requests across rooms
- **Cluster Defense**: Coordinates defense efforts across room clusters
- **Squad Formation**: Assembles defenders from multiple rooms
- **Assistance Prioritization**: Routes help based on threat severity
- **Retreat Protocol**: Tactical retreat coordination for outmatched defenders

### Emergency Response
- **Emergency Level System**: 5-tier emergency escalation (None, Low, Medium, High, Critical)
- **Safe Mode Management**: Automatic safe mode triggering when critical structures threatened
- **Evacuation Manager**: Coordinates creep evacuation during overwhelming attacks
- **Cooldown Tracking**: Monitors safe mode cooldown and availability
- **Boost Allocation**: Emergency boost distribution for critical defense situations

## Installation

This package is part of the screeps monorepo and is installed as a local file dependency:

```json
{
  "dependencies": {
    "@ralphschuler/screeps-defense": "file:../screeps-defense"
  }
}
```

## Usage

### Basic Threat Assessment

```typescript
import { assessThreat, logThreatAnalysis } from '@ralphschuler/screeps-defense';

// Analyze threats in a room
const threat = assessThreat(room);

// Check danger level (0-3)
if (threat.dangerLevel >= 2) {
  console.log(`Room ${room.name} under attack!`);
  console.log(`Hostile DPS: ${threat.totalHostileDPS}`);
  console.log(`Recommended response: ${threat.recommendedResponse}`);
}

// Log detailed threat analysis
logThreatAnalysis(threat);
```

### Defense Coordination

The defense managers use TypeScript decorators and are automatically registered with the bot's kernel process system:

```typescript
import { 
  defenseCoordinator,
  emergencyResponseManager,
  evacuationManager,
  safeModeManager
} from '@ralphschuler/screeps-defense';

// In your process registry:
registerAllDecoratedProcesses(
  defenseCoordinator,
  emergencyResponseManager,
  evacuationManager,
  safeModeManager
);
```

### Rampart and Wall Automation

```typescript
import { 
  placeRampartsOnCriticalStructures,
  calculateWallRepairTarget,
  placeRoadAwarePerimeterDefense
} from '@ralphschuler/screeps-defense';

// Place ramparts on critical structures (spawns, towers, storage, etc.)
const result = placeRampartsOnCriticalStructures(room, threat.dangerLevel);
console.log(`Protected ${result.protected}/${result.totalCritical} critical structures`);

// Get dynamic repair target for walls/ramparts
const rcl = room.controller?.level ?? 1;
const repairTarget = calculateWallRepairTarget(rcl, threat.dangerLevel);
if (structure.hits < repairTarget) {
  tower.repair(structure);
}

// Place perimeter defense (considers road network)
placeRoadAwarePerimeterDefense(room);
```

### Emergency Response

```typescript
import { 
  emergencyResponseManager,
  EmergencyLevel,
  safeModeManager
} from '@ralphschuler/screeps-defense';

// Emergency response runs automatically via kernel
// But you can trigger actions manually:

// Check safe mode status
safeModeManager.checkSafeMode(room, swarmState);

// Get current emergency state
const emergency = emergencyResponseManager.getEmergencyState(room.name);
if (emergency.level >= EmergencyLevel.HIGH) {
  console.log(`Emergency in ${room.name}!`);
  console.log(`Assistance requests sent: ${emergency.assistanceRequestsSent}`);
}
```

### Retreat Protocol

```typescript
import { checkAndExecuteRetreat } from '@ralphschuler/screeps-defense';

// In creep behavior:
const shouldRetreat = checkAndExecuteRetreat(creep, room);
if (shouldRetreat) {
  // Creep is retreating to safe position
  return;
}
```

## Architecture

### Threat Assessment System

The threat assessment system (Section 12 of ROADMAP) provides comprehensive hostile analysis:

```typescript
interface ThreatAnalysis {
  roomName: string;
  dangerLevel: 0 | 1 | 2 | 3;  // 0=calm, 1=hostile sighted, 2=active attack, 3=siege/nuke
  threatScore: number;           // Composite score (0-1000+)
  hostileCount: number;
  totalHostileHitPoints: number;
  totalHostileDPS: number;
  healerCount: number;
  rangedCount: number;
  meleeCount: number;
  boostedCount: number;
  dismantlerCount: number;
  estimatedDefenderCost: number;
  assistanceRequired: boolean;
  assistancePriority: number;
  recommendedResponse: "monitor" | "defend" | "assist" | "retreat" | "safemode";
}
```

**Threat Score Calculation**:
- Base score from offensive parts (attack/ranged attack): +10 per part
- Boosted creeps: +200
- Healers: +100 (make attacks much harder)
- Dismantlers (5+ work parts): +150 (threaten structures)
- Nukes: +500 (always triggers danger level 3)

**Danger Levels**:
- **0 (Calm)**: No threats (score = 0)
- **1 (Hostile Sighted)**: Minor threat (score < 300)
- **2 (Active Attack)**: Significant threat (score < 800)
- **3 (Siege/Nuke)**: Critical threat (score >= 800 or nuke present)

**Tower Damage Calculation**:
The system accurately calculates tower effectiveness with distance falloff:
- Maximum damage: 600 at range ≤ 5
- Minimum damage: 150 at range ≥ 20
- Linear interpolation between ranges

### Defense Coordination

Multi-room defense coordination routes defenders from helper rooms:

```typescript
interface DefenseAssignment {
  creepName: string;      // Assigned defender
  targetRoom: string;     // Room needing help
  assignedAt: number;     // Assignment tick
  eta: number;            // Expected arrival tick
}
```

The coordinator:
1. Processes defense requests from threatened rooms
2. Finds nearby helper rooms with idle defenders
3. Assigns guards and rangers based on threat DPS
4. Tracks assignments and releases creeps when threat clears
5. Prevents helper room depletion (max 2 defenders per room)

### Emergency Response

5-tier emergency escalation system:

```typescript
enum EmergencyLevel {
  NONE = 0,      // No threat
  LOW = 1,       // Minor threat, normal response
  MEDIUM = 2,    // Significant threat, expedited spawning
  HIGH = 3,      // Critical threat, emergency spawning + assistance
  CRITICAL = 4   // Imminent destruction, safe mode consideration
}
```

Emergency manager:
- Monitors threat levels continuously
- Escalates defense based on danger
- Triggers emergency defender spawning
- Requests cluster assistance
- Activates safe mode for critical threats
- Coordinates evacuation if needed

## Dependencies

This package has tight coupling to the bot's core infrastructure and **cannot be used standalone**. It requires:

1. **Bot Core Systems** (via TypeScript path mapping `@bot/*`):
   - `@bot/core/*` - Kernel, logger, process decorators
   - `@bot/memory/*` - Memory manager and schemas
   - `@bot/spawning/*` - Defender spawning and role definitions
   - `@bot/utils/*` - Utility functions

2. **Peer Dependencies**:
   - The bot package must be present at `../screeps-bot` for compilation
   - This package is designed exclusively for use within the ralphschuler/screeps bot project

## Development

Install dependencies:

```bash
npm install
```

Build the package:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Watch mode for tests:

```bash
npm run test:watch
```

## Defense Strategies

### Standard Defense Posture

Per ROADMAP Section 12, the standard defense strategy includes:

1. **Monitoring Phase** (Danger 0-1):
   - Passive observation of hostiles
   - No active defense measures
   - Maintain normal operations

2. **Active Defense** (Danger 2):
   - Tower targeting of hostiles
   - Spawn emergency defenders
   - Maintain rampart/wall repairs
   - Request assistance if outmatched

3. **Siege Response** (Danger 3):
   - Full emergency response activated
   - Cluster-wide defense coordination
   - Safe mode consideration
   - Evacuation planning if needed

### Custom Defense Configurations

You can customize defense behavior by:

1. **Adjusting Threat Thresholds**:
```typescript
// Modify danger level calculation in your code
const customDangerLevel = calculateCustomDangerLevel(threatScore);
```

2. **Custom Defense Requests**:
```typescript
import { defenseCoordinator } from '@ralphschuler/screeps-defense';

// Request specific defender composition
const customRequest: DefenseRequest = {
  roomName: 'W1N1',
  urgency: 3,
  guardsNeeded: 2,
  rangersNeeded: 4,
  requestedAt: Game.time
};
```

3. **Emergency Response Hooks**:
```typescript
// Override emergency level calculation
const emergencyLevel = customEmergencyLevelCalculation(threat);
```

## Performance Considerations

The defense subsystem is optimized for CPU efficiency:

- **Threat Assessment**: ~0.1-0.3 CPU per room
- **Defense Coordinator**: ~0.05 CPU (runs every 3 ticks)
- **Emergency Response**: ~0.02-0.05 CPU per room
- **Structure Automation**: ~0.1-0.2 CPU per room

Total defense overhead: **~0.3-0.6 CPU per defended room**

## Testing

The package includes comprehensive tests covering:

- **Threat Assessment**: Tests for `assessThreat()`, danger level calculation, and DPS estimation
- **Tower Damage**: Tests for `calculateTowerDamage()` with range-based falloff
- **Hostile Detection**: Tests for identifying healers, ranged attackers, and dismantlers
- **Emergency Levels**: Tests for emergency level enumeration and escalation
- **Structure Defense**: Tests for rampart placement and wall repair targets (in progress)

**Test Coverage**: >80% (target in progress)

Run tests:
```bash
npm test
```

### Test Structure

```
test/
  ├── setup.cjs                 # Test environment setup and mocks
  ├── exports.test.ts           # Package exports validation
  ├── threatAssessment.test.ts  # Threat assessment tests
  └── ...                       # Additional test files
```

### Key Test Cases

- ✅ Tower damage calculation at various ranges (close, medium, far)
- ✅ Danger level calculation from threat scores (0-3 scale)
- ✅ Defender cost estimation based on hostile strength
- ✅ Hostile creep detection and classification
- ✅ DPS calculation for attack and ranged attack parts
- ✅ Healer, ranged attacker, and dismantler identification
- ✅ Empty room (no threat) handling
- 📝 Safe mode management (planned)
- 📝 Evacuation coordination (planned)

## ROADMAP Alignment

This package implements defense systems from ROADMAP.md:

- **Section 12 - Threat Assessment & Posture**: Complete implementation of danger levels, threat scoring, and adaptive behavior
- **Section 17 - Walls & Ramparts**: Core-shell protection, dynamic health targets, automated placement
- **Section 11 - Cluster & Empire Logic**: Multi-room defense coordination, squad formation, assistance routing

## License

Unlicense

## Related Packages

- `@ralphschuler/screeps-spawn` - Spawn coordination and defender spawning
- `@ralphschuler/screeps-economy` - Resource management for boost production
- `@ralphschuler/screeps-utils` - Utility functions used by defense systems
