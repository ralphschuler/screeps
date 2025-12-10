# Military System Documentation

This document describes the comprehensive military system implemented in the Screeps bot, addressing all features mentioned in Issue #24.

## Overview

The military system follows the ROADMAP.md Section 12 (Kampf & Verteidigung) and implements a complete swarm-based defensive and offensive capability across multiple rooms and shards.

## ✅ Implemented Features

### 1. Tower Defense System
**Location**: `src/defense/` and tower logic in room managers
**Status**: ✅ COMPLETE

- **Priority Targeting**: Healers > Ranged > Melee > Support
- **Range-Based Optimization**: Considers falloff damage at different ranges
- **Automatic Repair**: Repairs critical structures and ramparts based on danger level
- **Energy Management**: Limits repair operations in peacetime to conserve energy

**Key Files**:
- Tower control integrated into room economy management
- `wallRepairTargets.ts` - Dynamic repair threshold calculation based on RCL and danger

### 2. Safe Mode Management
**Location**: `src/defense/safeModeManager.ts`
**Status**: ✅ COMPLETE

- **Automatic Triggering**: Activates safe mode when critical structures are threatened
- **Cooldown Tracking**: Respects safe mode cooldowns
- **Threshold-Based Activation**: 
  - Spawn health < 20%
  - Storage/Terminal health < 20%
  - Overwhelmed by hostiles (3:1 ratio)
  - Boosted hostiles detected

**Key Features**:
- Only triggers at danger level 2+
- Considers defender availability before triggering
- Logs all safe mode activations for tracking

### 3. Basic Guard Behavior
**Location**: `src/roles/behaviors/military.ts`
**Status**: ✅ COMPLETE

Implemented guard types:
- **Guard**: Home defense, never leaves assigned room, patrols when idle
- **Remote Guard**: Defends remote mining operations, returns when secure
- **Soldier**: General combat unit with retreat logic
- **Ranger**: Ranged kiting specialist maintaining 3-tile distance
- **Healer**: Support unit with intelligent targeting
- **Harasser**: Hit-and-run attacker targeting workers
- **Siege Unit**: Dismantler for breaking fortifications

**Key Features**:
- Patrol waypoint system covering exits and spawn areas
- Priority targeting system (Healers > Ranged > Melee)
- Tactical retreat logic (creeps retreat when HP < 30-40%)
- Squad coordination support

### 4. Wall Repair System
**Location**: `src/defense/wallRepairTargets.ts`, `src/defense/rampartAutomation.ts`
**Status**: ✅ COMPLETE

- **Dynamic Thresholds**: Repair targets scale with RCL (300K @ RCL2 → 300M @ RCL8)
- **Danger-Based Scaling**: 
  - Danger 0: 30% of max (peaceful)
  - Danger 1: 50% of max (threat detected)
  - Danger 2: 80% of max (active attack)
  - Danger 3: 100% of max (siege/nuke)
- **Core-Shell Defense**: Protects critical structures first, then perimeter
- **Efficient Repair**: Uses builders in peacetime, towers in emergencies

### 5. Squad Formation System
**Location**: `src/clusters/squadFormationManager.ts`
**Status**: ✅ COMPLETE

- **Composition Management**: Tracks target vs current squad composition
- **Spawn Coordination**: Creates spawn requests for all squad members
- **Formation Tracking**: Monitors squad assembly progress
- **Timeout Handling**: Cleans up stale formations after 500 ticks
- **Role Integration**: Supports all military roles (harasser, soldier, ranger, healer, siegeUnit)

**Key Features**:
- Integrates with spawn queue system
- Supports boost requirements for each role
- Automatic formation completion detection
- Priority-based spawning (emergency > high > normal)

### 6. Offensive Roles (Harasser, Raider, Sieger)
**Location**: `src/roles/behaviors/military.ts`
**Status**: ✅ COMPLETE

All offensive roles fully implemented with specialized behaviors:

#### Harasser
- Fast hit-and-run tactics
- Targets workers (WORK/CARRY body parts)
- Flees from dangerous combat creeps
- Retreat threshold: 40% HP

#### Soldier (Raider)
- Mixed melee/ranged combat
- Can attack hostile structures
- Retreat threshold: 30% HP
- Squad coordination support

#### Siege Unit (Sieger)
- Prioritizes: Spawns → Towers → Walls/Ramparts → Other structures
- Specialized for breaking fortifications
- Retreat threshold: 30% HP
- WORK-boosted for maximum dismantle efficiency

#### Ranger
- Maintains 3-tile kiting distance
- Ranged attack specialization
- Retreat threshold: 30% HP
- Multi-room assistance support

#### Healer
- Self-heal prioritization when critical
- Intelligent ally targeting (most damaged first)
- Power bank operation support
- Follows military creeps when idle

**Key Features**:
- All roles implement tactical retreat logic
- Boosted creeps are especially protected (expensive to replace)
- Squad behavior integration for coordinated attacks
- Solo and squad operation modes

### 7. Rally Point Management
**Location**: `src/clusters/rallyPointManager.ts`
**Status**: ✅ COMPLETE

- **Dynamic Selection**: Terrain and threat-aware positioning
- **Purpose-Based**: Defense, offense, staging, and retreat rally points
- **Multi-Factor Scoring**:
  - Terrain quality (plains > swamp)
  - Safety (distance from hostiles)
  - Centrality (purpose-dependent)
  - Exit access (mobility)
- **Automatic Cleanup**: Removes unused rally points after 1000 ticks
- **Visual Indicators**: In-game visualization with purpose markers

### 8. Multi-Room Coordination
**Location**: `src/defense/defenseCoordinator.ts`, `src/clusters/offensiveOperations.ts`
**Status**: ✅ COMPLETE

#### Defense Coordination
- **Request System**: Rooms request assistance from neighbors
- **Helper Selection**: Scores candidate rooms by distance, available defenders, and safety
- **Assignment Tracking**: ETA calculation and assignment lifecycle management
- **Load Balancing**: Limits defenders sent from each room (max 2)
- **Automatic Release**: Returns defenders when threat is neutralized

#### Offensive Coordination
- **Target Selection**: Evaluates attack targets across multiple rooms
- **Doctrine Selection**: Harassment → Raid → Siege escalation
- **Squad Creation**: Forms squads from multiple cluster rooms
- **Resource Coordination**: Validates sufficient resources before launch
- **Operation Tracking**: Monitors operation state through lifecycle

### 9. Boost Integration with Combat
**Location**: `src/labs/boostManager.ts`
**Status**: ✅ COMPLETE

- **Role-Based Configs**: Predefined boost compounds for each military role
  - Soldier: T3 attack + T3 move
  - Ranger: T3 ranged attack + T3 move
  - Healer: T3 heal + T3 move
  - Siege Unit: T3 dismantle + T3 move

- **Danger-Based Activation**: Boosts applied based on room danger level
  - Soldier/Ranger/Healer: danger ≥ 2
  - Siege Unit: danger ≥ 1

- **Defense Priority System**: Emergency response can lower boost thresholds

- **Lab Preparation**: Pre-loads boost compounds into labs when danger is high

- **Automatic Application**: Creeps move to labs and apply boosts before combat

### 10. Nuke + Siege Coordination
**Location**: `src/empire/nukeManager.ts`
**Status**: ✅ COMPLETE

- **Nuke Candidate Scoring**: Evaluates targets based on:
  - Owner status (+30)
  - Threat level (+20)
  - Tower count (×5)
  - Spawn count (×10)
  - RCL (×3)
  - Distance penalty (×2)
  - War target bonus (+15)

- **Resource Management**:
  - Coordinates ghodium transfers via terminal network
  - Tracks nuker readiness (300K energy + 5K ghodium)
  - Maintains donor room buffers

- **Siege Coordination**:
  - Monitors active siege squads
  - Calculates squad ETA to target
  - Times nuke launch for arrival 1000 ticks before squad
  - Ensures nuke lands when siege forces engage

- **Detection System**:
  - Detects incoming nukes in owned rooms
  - Escalates danger to level 3
  - Updates defense pheromones
  - Logs to event system

## Offensive Doctrine System

**Location**: `src/clusters/offensiveDoctrine.ts`

The system implements three-tier escalation:

### Harassment Doctrine
- **Composition**: 3 harassers, 1 ranger
- **Min Energy**: 50K
- **Boosts**: None
- **Target Priority**: Workers > Military > Spawns
- **Engagement**: Avoid towers

### Raid Doctrine
- **Composition**: 1 harasser, 2 soldiers, 3 rangers, 2 healers
- **Min Energy**: 100K
- **Boosts**: None
- **Target Priority**: Military > Towers > Spawns
- **Engagement**: Max 2 towers

### Siege Doctrine
- **Composition**: 2 soldiers, 4 rangers, 3 healers, 2 siege units
- **Min Energy**: 200K
- **Boosts**: Yes (all roles)
- **Target Priority**: Towers > Spawns > Defenses
- **Engagement**: Max 6 towers

## Squad Behavior System

**Location**: `src/roles/behaviors/military.ts` (squadBehavior function)

### Squad States
1. **Gathering**: Members move to rally point and wait
2. **Moving**: Squad advances to target room (waits for stragglers)
3. **Attacking**: Executes role-specific combat behavior
4. **Retreating**: Returns to rally point when HP < threshold
5. **Dissolving**: Members return home, squad disbanded

### Coordination Features
- **Formation Awareness**: Waits for 50% of squad before advancing
- **Retreat Coordination**: Individual retreat when HP < squad threshold
- **Role Dispatch**: Executes appropriate behavior based on creep role
- **State Transitions**: Automatic state progression based on conditions

## Integration Points

### Kernel Process System
All military processes are registered with the kernel:
- `defense:coordination` - Multi-room defense (HIGH priority, 3-tick interval)
- `empire:nuke` - Nuke operations (LOW priority, 500-tick interval)
- Individual creeps registered with priority by role

### Pheromone System
Military operations update and respond to pheromones:
- **defense**: Increases on hostile detection
- **war**: Increases during offensive operations
- **nukeTarget**: Marks rooms for nuclear strike
- **danger**: 0-3 scale determines behavior intensity

### Memory Schema
Military state tracked in:
- `ClusterMemory.squads[]` - Squad definitions
- `ClusterMemory.rallyPoints[]` - Rally point locations
- `OvermindMemory.warTargets[]` - Offensive targets
- `OvermindMemory.nukeCandidates[]` - Nuke targets
- `SwarmCreepMemory.squadId` - Squad membership

## Testing

Comprehensive test coverage includes:
- ✅ Offensive doctrine selection and composition
- ✅ Squad formation and lifecycle
- ✅ Rally point scoring and placement
- ✅ Guard home room restriction behavior
- ✅ Combat system integration scenarios
- ✅ Emergency response escalation
- ✅ Multi-room defense coordination

**Test Files**:
- `test/unit/offensiveDoctrine.test.ts`
- `test/unit/squadFormationManager.test.ts`
- `test/unit/rallyPointManager.test.ts`
- `test/unit/guardBehavior.test.ts`
- `test/unit/emergencyResponse.test.ts`

## Performance Considerations

Following ROADMAP.md Section 18 (CPU-Management):
- **High Frequency** (every tick): Creep behaviors, tower control
- **Medium Frequency** (3-5 ticks): Defense coordination, squad formation
- **Low Frequency** (500 ticks): Nuke operations, doctrine evaluation

**CPU Budgets**:
- Defense coordinator: 0.05 CPU (min bucket: 1500)
- Nuke manager: 0.01 CPU (min bucket: 8000)
- Individual military creeps: Priority-based allocation

## Usage Examples

### Launching an Offensive Operation
```typescript
import { launchOffensiveOperation } from "./clusters/offensiveOperations";
import { selectDoctrine } from "./clusters/offensiveDoctrine";

// Determine appropriate doctrine based on intel
const doctrine = selectDoctrine("W1N1", {
  towerCount: 3,
  spawnCount: 2,
  rcl: 6
});

// Launch operation
launchOffensiveOperation(cluster, "W1N1", doctrine);
```

### Requesting Defense Assistance
```typescript
// Defense coordinator automatically processes defense requests
// Created by defenderManager when room is threatened
const request = {
  roomName: "W1N1",
  guardsNeeded: 2,
  rangersNeeded: 1,
  healersNeeded: 1,
  urgency: 2
};
// Stored in Memory.defenseRequests
```

### Manual Nuke Launch
```typescript
import { nukeManager } from "./empire/nukeManager";

// Nukes are automatically managed by the kernel process
// Manual override via game console:
Game.rooms['W1N1'].find(FIND_MY_STRUCTURES, {
  filter: s => s.structureType === STRUCTURE_NUKER
})[0].launchNuke(new RoomPosition(25, 25, 'W2N2'));
```

## Future Enhancements (Optional)

While the military system is feature-complete, potential enhancements could include:
- Power creep combat operators (DISRUPT, SHIELD powers)
- Advanced formation patterns (wedge, line, encirclement)
- Predictive threat modeling
- Automated scouting integration
- Cross-shard military coordination
- Boost recycling via unboost operations

## Conclusion

All military features specified in Issue #24 are fully implemented and tested:
- ✅ Tower defense with priority targeting
- ✅ Safe mode management with automatic triggering
- ✅ Basic guard behavior with patrol systems
- ✅ Wall repair system with dynamic thresholds
- ✅ Squad formation with spawn coordination
- ✅ Offensive roles (harasser, raider/soldier, sieger/siegeUnit)
- ✅ Rally point management with dynamic placement
- ✅ Multi-room coordination for defense and offense
- ✅ Boost integration with danger-based activation
- ✅ Nuke + siege coordination with timing

The system follows ROADMAP.md principles, integrates with the kernel process system, and maintains CPU efficiency through proper scheduling and caching strategies.
