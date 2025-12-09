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
