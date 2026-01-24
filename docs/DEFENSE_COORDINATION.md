# Defense Coordination System

## Overview

The Defense Coordination System provides comprehensive multi-room defense coordination following the swarm architecture principles outlined in ROADMAP.md Sections 11 (Cluster- & Empire-Logik) and 12 (Kampf & Verteidigung).

## Architecture

The system consists of several integrated components:

### 1. Threat Assessment (`threatAssessment.ts`)

Analyzes hostile presence in rooms to provide actionable defense intelligence.

**Key Features:**
- DPS calculation based on body part composition
- Boost detection and threat scoring
- Role classification (healers, ranged, melee, dismantlers)
- Tower effectiveness evaluation
- Danger level classification (0-3 per ROADMAP Section 12)
- Assistance priority calculation

**Threat Analysis Output:**
```typescript
interface ThreatAnalysis {
  roomName: string;
  dangerLevel: 0 | 1 | 2 | 3;  // Per ROADMAP: 0=ruhig, 1=hostile, 2=attack, 3=siege/nuke
  threatScore: number;          // Composite score (0-1000+)
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
  assistancePriority: number;   // 0-100
  recommendedResponse: "monitor" | "defend" | "assist" | "retreat" | "safemode";
}
```

**Usage:**
```typescript
import { assessThreat } from "../defense/threatAssessment";

const threat = assessThreat(room);
if (threat.assistanceRequired) {
  // Request cluster assistance
}
```

### 2. Defense Coordinator (`defenseCoordinator.ts`)

Coordinates defense efforts across multiple rooms, managing assistance requests and defender assignments.

**Key Features:**
- Multi-room defense coordination
- Automatic defender assignment from helper rooms
- ETA calculation for incoming assistance
- Assignment tracking and cleanup
- Integration with threat assessment

**Process Details:**
- **Process ID:** `cluster:defense`
- **Priority:** HIGH
- **Interval:** Every 3 ticks
- **CPU Budget:** 0.05

**Defense Assignment Flow:**
1. Receives defense requests from attacked rooms
2. Assesses threat using threat assessment system
3. Calculates defender needs (guards, rangers)
4. Finds available defenders in nearby owned rooms
5. Assigns defenders and sets `assistTarget` in creep memory
6. Tracks assignments with ETA and cleanup logic

**Helper Room Selection:**
Rooms are scored based on:
- Distance to target room (closer is better)
- Available idle defenders (more is better)
- Current threat level (safer rooms can spare more)
- Urgency threshold (critical situations can pull from threatened rooms)

### 3. Cluster Defense Coordinator (`clusterDefense.ts`)

Provides cluster-wide defense coordination and mutual aid following ROADMAP Section 11.

**Key Features:**
- Cluster-wide threat assessment
- Defender sharing between cluster members
- Coordinated safe mode activation
- Priority-based assistance allocation

**Coordination Strategy:**
1. Assess threats across all cluster rooms
2. Prioritize assistance requests by threat score and priority
3. Allocate defenders from safe rooms to threatened rooms
4. Coordinate safe mode to prevent multiple activations
5. Only activate safe mode in highest priority room

**Safe Mode Coordination:**
- Prevents multiple rooms from activating safe mode simultaneously
- Prioritizes rooms with highest threat scores
- Checks availability and cooldown before activation

### 4. Retreat Protocol (`retreatProtocol.ts`)

Implements intelligent retreat logic for military creeps following ROADMAP Section 12.

**Key Features:**
- Threat-based retreat decisions
- Outnumbered detection (3:1 ratio)
- Damage and healer assessment
- Boosted enemy handling
- Safe room pathfinding

**Retreat Triggers:**
- Safe mode or retreat recommended by threat assessment
- Heavily outnumbered (3:1 hostile to friendly ratio)
- Damaged without healer support against enemy healers
- Facing boosted enemies without sufficient support

**Retreat Behavior:**
1. First priority: Move to spawn (range 3)
2. Second priority: Flee to nearest exit leading to owned room
3. Last resort: Move to any nearest exit

**Usage:**
```typescript
import { checkAndExecuteRetreat } from "../defense/retreatProtocol";

// In military creep logic
if (checkAndExecuteRetreat(creep)) {
  return; // Creep is retreating, skip other actions
}
```

### 5. Safe Mode Manager (`safeModeManager.ts`)

Triggers safe mode when defense fails, per ROADMAP Section 12.

**Key Features:**
- Critical structure protection (spawn, storage, terminal)
- Overwhelmed detection
- Boosted hostile handling
- Cooldown and availability checks

**Activation Conditions:**
- Danger level >= 2
- Critical structures below 20% health
- Overwhelmed by 3:1 ratio
- Boosted hostiles without adequate defense

## Integration Points

### Room Node Integration (`core/roomNode.ts` and `core/managers/RoomDefenseManager.ts`)

The room processing loop integrates defense systems through the defense manager:

```typescript
// In RoomNode.run()
roomDefenseManager.updateThreatAssessment(room, swarm, cache);

// In RoomDefenseManager.updateThreatAssessment()
const threat = assessThreat(room);
safeModeManager.checkSafeMode(room, swarm);

// Tower control handled by defense manager
roomDefenseManager.runTowerControl(room, swarm, towers);
```

### Cluster Manager Integration (`clusterManager.ts`)

Cluster coordination includes defense:

```typescript
// Coordinate defense across cluster
coordinateClusterDefense(cluster.id);
```

### Military Creep Integration (`roles/behaviors/military.ts`)

Military creeps use retreat protocol:

```typescript
import { checkAndExecuteRetreat } from "../../defense/retreatProtocol";

// Check retreat condition before taking offensive action
if (checkAndExecuteRetreat(creep)) {
  return;
}
```

## Defense Request Flow

### Creating Defense Requests

Defense requests are created by `defenderManager.ts` when a room needs assistance:

```typescript
import { createDefenseRequest, needsDefenseAssistance } from "../spawning/defenderManager";

if (needsDefenseAssistance(room, swarm)) {
  const request = createDefenseRequest(room, swarm);
  // Request is stored in Memory.defenseRequests
}
```

### Processing Defense Requests

The DefenseCoordinator process automatically:
1. Reads requests from `Memory.defenseRequests`
2. Evaluates each request using threat assessment
3. Assigns available defenders from helper rooms
4. Tracks assignments and ETAs
5. Cleans up completed or stale assignments

## ROADMAP Alignment

### Section 11: Cluster- & Empire-Logik

**Cluster Tasks Implemented:**
- ✅ Squad formation from multiple rooms (via defenseCoordinator)
- ✅ Shared rally points (common defense targets)
- ✅ Assistance for attacked rooms (cluster defense coordination)

**Military Coordination:**
- Multi-room defender coordination
- Automatic resource pooling for defense
- Priority-based assistance allocation

### Section 12: Kampf & Verteidigung

**Threat-Level & Posture:**
- ✅ Danger levels 0-3 (ruhig, hostile, attack, siege/nuke)
- ✅ Threat scoring with DPS, boosts, composition analysis
- ✅ Adaptive response strategies (monitor, defend, assist, retreat, safemode)

**Tower Control:**
- Tower DPS included in threat calculations
- Distance-based damage considered (TODO: improve accuracy)

**Defensive Creeps & Safe Mode:**
- ✅ Dynamic defender spawning based on threat
- ✅ Safe mode coordination to prevent waste
- ✅ Cluster-wide safe mode prioritization

**Retreat Logic:**
- ✅ Outnumbered detection
- ✅ Damage and healer assessment
- ✅ Boosted enemy handling
- ✅ Safe pathfinding to owned rooms

## Configuration

### DefenseCoordinator Configuration

```typescript
@MediumFrequencyProcess("cluster:defense", "Defense Coordinator", {
  priority: ProcessPriority.HIGH,
  interval: 3,              // Check every 3 ticks
  minBucket: 0,            // No bucket requirement
  cpuBudget: 0.05          // 5% of CPU budget
})
```

### Threat Assessment Thresholds

- **Danger Level 0:** No threats (threatScore = 0) - "ruhig" (calm)
- **Danger Level 1:** Hostile sighted (threatScore < 300)
- **Danger Level 2:** Active attack (threatScore < 800)
- **Danger Level 3:** Siege/nuke (threatScore >= 800)

### Defender Assignment Limits

- Maximum 2 defenders per helper room (prevents depletion)
- Distance-based ETA: 50 ticks per room distance
- Assignment timeout: 1000 ticks

### Retreat Thresholds

- Outnumbered: 3:1 hostile to friendly ratio
- Damaged: < 30% health facing enemy healers without support
- Boosted: Need 2x defenders per boosted enemy

## Monitoring and Debugging

### Console Commands

The system integrates with the unified logging system:

```javascript
// Check defense assignments
Memory.defenseRequests

// View threat assessment for a room
// (Use threat assessment in room processing)

// Check process status
kernel.getProcesses().filter(p => p.id.includes('defense'))
```

### Statistics

Defense metrics are tracked in unified stats:
- Defender counts by room
- Threat levels by room
- Defense assignments active
- Safe mode activations

### Logs

Defense operations log with subsystem `"Defense"`:
- Defender assignments
- Safe mode activations
- Threat analysis (for danger level >= 2)
- Retreat decisions
- Assignment cleanup

## Performance Considerations

### CPU Budget

- **DefenseCoordinator:** 0.05 CPU budget, runs every 3 ticks
- **Threat Assessment:** Cached per tick via room processing
- **Cluster Defense:** Part of ClusterManager, runs every 10 ticks

### Memory Usage

- Defense requests stored in `Memory.defenseRequests[]`
- Assignments tracked in DefenseCoordinator instance (not in Memory)
- Swarm state includes danger level (0-3)

### Optimization Tips

1. **Threat assessment is relatively expensive** - only run when needed (danger > 0)
2. **Assignment cleanup prevents memory leaks** - runs every coordinator tick
3. **Helper room scoring is cached** - reuses room.find() results
4. **Retreat logic is lightweight** - early exit for most cases

## Future Enhancements

See TODOs in source code:

1. **Improve tower DPS accuracy** - Calculate distance-based damage falloff
   - Issue: #741
   - File: `threatAssessment.ts:154`
   
2. **Refine defender cost estimation** - Use actual defender templates
   - Issue: #740
   - File: `threatAssessment.ts:265`

## Related Documentation

- [ROADMAP.md](/ROADMAP.md) - Sections 11 & 12
- [Offensive Roles](/docs/roles/offensive-roles.md) - Military creep roles
- [Nuke Coordination](/docs/NUKE_COORDINATION.md) - Nuclear defense

## API Reference

### Exported Functions

#### `assessThreat(room: Room): ThreatAnalysis`

Analyzes threats in a room and returns comprehensive threat data.

#### `shouldRetreat(creep: Creep, threat: ThreatAnalysis): boolean`

Determines if a creep should retreat based on threat assessment.

#### `executeRetreat(creep: Creep): void`

Executes retreat behavior for a creep.

#### `checkAndExecuteRetreat(creep: Creep): boolean`

Convenience function that checks and executes retreat in one call.

#### `coordinateClusterDefense(roomName: string): void`

Coordinates defense for all rooms in the cluster containing the given room.

### Exported Classes

#### `DefenseCoordinator`

Main defense coordination class, registered as kernel process.

**Methods:**
- `run(): void` - Main coordination loop (called by kernel)
- `getAssignmentsForRoom(roomName: string): DefenseAssignment[]`
- `getAllAssignments(): DefenseAssignment[]`
- `cancelAssignment(creepName: string): void`

#### `ClusterDefenseCoordinator`

Cluster-wide defense coordination.

**Methods:**
- `coordinateDefense(clusterId: string): void`

#### `SafeModeManager`

Safe mode activation management.

**Methods:**
- `checkSafeMode(room: Room, swarm: SwarmState): void`

## Testing

Test files:
- `test/unit/defenseCoordinator.test.ts` - Defense coordinator tests
- `test/unit/defenseAssistance.test.ts` - Assistance protocol tests
- `test/unit/defenseAssistanceThreshold.test.ts` - Threshold tests

Run tests:
```bash
npm test
```

## Troubleshooting

### Defense not activating

1. Check that DefenseCoordinator is registered with kernel
2. Verify danger level is being set correctly in swarm state
3. Check defense request creation in `defenderManager.ts`
4. Review logs for subsystem "Defense"

### Defenders not being assigned

1. Verify helper rooms have available defenders
2. Check helper room threat levels (they must be safe to spare defenders)
3. Review scoring logic in `findHelperRooms()`
4. Ensure defenders don't already have `assistTarget` set

### Safe mode activating unnecessarily

1. Review threat assessment thresholds
2. Check safe mode manager conditions
3. Verify danger level calculation
4. Consider adjusting critical structure health thresholds

### Retreats happening too early

1. Review retreat thresholds in `retreatProtocol.ts`
2. Check threat assessment accuracy
3. Verify friendly defender counts
4. Consider adjusting ratios (currently 3:1 for outnumbered)
