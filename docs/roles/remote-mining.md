# Remote Mining Roles

Remote mining is a critical strategy in Screeps for expanding energy income without claiming additional rooms. This document describes the remote mining roles and their behavior.

## Overview

Remote mining involves:
1. Identifying remote rooms with energy sources
2. Reserving the controller to increase source capacity (1500 → 3000 energy)
3. Deploying static miners at remote sources
4. Using haulers to transport energy back to home room
5. Building infrastructure (containers and roads) for efficiency

## Roles

### Remote Harvester

**Purpose**: Static miner positioned at a source in a remote room

**Behavior**:
- Travels to assigned remote room
- Assigns itself to a source (load balanced)
- Positions adjacent to the source
- Harvests continuously
- Deposits energy into nearby container or drops it for haulers

**Safety Features** ✅:
- Detects dangerous hostiles (with ATTACK or RANGED_ATTACK parts) within 5 tiles
- Flees from hostiles when threatened
- Returns to home room if hostiles are in the remote room
- Automatically resumes harvesting when threat clears

**Body Configuration**:
- Early game: `[WORK, WORK, WORK, WORK, WORK, CARRY, MOVE]` - 5 WORK parts for optimal harvesting
- Late game: `[WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]` - 7 WORK parts with faster movement

### Remote Hauler

**Purpose**: Transports energy from remote room containers to home room storage

**Behavior**:
- Travels to assigned remote room when empty
- Collects energy from containers or ground
- Returns to home room when full
- Delivers to spawn/extensions first, then storage

**Safety Features** ✅:
- Detects dangerous hostiles within 5 tiles
- Prioritizes returning home with cargo when threatened
- Flees from hostiles when empty

**Energy Efficiency** ✅:
- Only collects from containers when they have ≥30% of hauler capacity
- This ensures travel costs are justified by energy gained
- Still picks up dropped energy to prevent decay
- Waits near containers for them to fill if below threshold

**Body Configuration**:
- Early game: `[CARRY×4, MOVE×4]` - 200 energy per trip
- Mid game: `[CARRY×8, MOVE×8]` - 400 energy per trip
- Late game: `[CARRY×16, MOVE×16]` - 800 energy per trip

## Infrastructure

Container placement and roads are automatically managed by `RemoteInfrastructureManager`.

## Best Practices

### Early Game (RCL 3-4)
- Start with 1-2 remote rooms
- Use smaller body sizes
- Prioritize closest rooms with 2+ sources

### Mid Game (RCL 5-6)
- Expand to 3-4 remote rooms
- Maintain reservation consistently
- Monitor hostile threats

### Late Game (RCL 7-8)
- Support 4-6+ remote rooms per owned room
- Use maximum body sizes
- Implement defense against hostile players

## Remote Defense

### Remote Guard

**Purpose**: Defend remote mining operations from hostile threats

**Behavior**:
- Patrols assigned remote room
- Engages hostile creeps with ATTACK or RANGED_ATTACK parts
- Prioritizes dangerous targets (boosted enemies, dismantlers)
- Returns home when remote is secure
- Works with multiple guards for large threats

**Body Configuration**:
- Early game: `[TOUGH, ATTACK, MOVE, MOVE]` - Basic defense
- Mid game: `[TOUGH×2, ATTACK×3, MOVE×5]` - Balanced combat
- Late game: `[TOUGH×4, ATTACK×4, RANGED_ATTACK, MOVE×8]` - Heavy defense

**Spawning Logic**:
- Spawns automatically when hostiles detected in remote rooms
- Scales based on threat level (1 guard per 2 hostiles)
- Up to 4 guards per room for major threats
- Higher priority than regular guards (85 vs 80)

## Remote Room Management

### Reservation Management ✅

The claimer role now maintains consistent reservation of remote rooms:
- Triggers reservation when ticks remaining < 3000
- One claimer per remote room needing reservation
- Checks both owned and reserved controllers
- Avoids rooms owned by other players

### Remote Room Loss Detection ✅

Automatic detection and handling of lost remote rooms:
- **Enemy Owned**: Room claimed by another player
- **Enemy Reserved**: Room reserved by another player
- **Hostile Threat**: Multiple dangerous hostiles present (2+)
- Lost remotes are automatically removed from assignments
- Stops spawning workers for lost remotes immediately
- Marks room with threat level 3 in intel

### Hauler Dimensioning ✅

Intelligent hauler scaling based on:
- **Distance**: Farther rooms need more haulers
- **Source Count**: More sources need more haulers
- **Round Trip Time**: Calculated from path distance and terrain
- **Energy Generation**: 10 energy/tick per source (with 5 WORK harvester)
- **Hauler Size**: Scales with room energy capacity (4-24 CARRY parts)

Formula: `haulers = (energyPerTick * roundTripTicks / haulerCapacity) * 1.2`

Example:
- 1 room away, 2 sources, 800 energy capacity → 2-3 haulers
- 3 rooms away, 2 sources, 1600 energy capacity → 4-5 haulers

## Infrastructure

Container placement and roads are automatically managed by `RemoteInfrastructureManager`.

### Container Placement ✅
- Automatically places containers adjacent to sources
- Prioritizes positions with most walkable neighbors
- Respects construction site limits
- Only builds in neutral or friendly reserved rooms

### Road Planning ✅
- Multi-room pathfinding from home to remote sources
- Roads placed in both home and remote rooms
- Rate limited to avoid overwhelming builders
- Only places roads in rooms with vision
