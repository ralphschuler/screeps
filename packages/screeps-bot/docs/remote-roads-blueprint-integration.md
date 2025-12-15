# Remote Roads and Blueprint Integration

## Overview

This document explains how roads built for remote mining operations are integrated into the blueprint validation system to ensure they are preserved as part of our infrastructure.

## Problem Statement

When we establish remote mining operations, we build roads:
1. In our **home room** (from spawn/storage toward the remote room)
2. In **remote rooms** (from entrance to sources)

These roads are critical infrastructure, but they exist across room boundaries. We need to ensure they are considered "part of our blueprint" and not accidentally destroyed during blueprint validation.

## Issue: Road Destruction at Exits

### The Bug
Roads near room exits were being destroyed when:
1. A remote room was assigned and roads were built towards it
2. The remote room was later removed from assignments (due to hostiles, claims, or danger)
3. Blueprint validation no longer considered these roads valid
4. Roads were destroyed as "misplaced structures"

### Root Cause
The `validateRemoteAssignments()` function in `expansionManager.ts` removes remote rooms from `swarm.remoteAssignments` when they become hostile, claimed, or too dangerous. When this happened, roads that were built towards those remotes were no longer included in the valid road positions, causing them to be marked as misplaced and destroyed.

### The Fix
Exit roads are now **always** considered valid infrastructure, regardless of current remote assignments:

1. New constant: `EXIT_ROAD_PROTECTION_DISTANCE = 3`
2. New function: `findExistingExitRoads()` identifies roads within 3 tiles of any room edge
3. Updated: `getValidRoadPositions()` now includes exit roads in valid positions

This ensures that:
- Roads near exits (x ≤ 3, x ≥ 46, y ≤ 3, y ≥ 46) are permanent infrastructure
- They survive remote assignment changes
- They facilitate all inter-room movement, not just specific remotes

## Solution Architecture

### 1. Remote Road Calculation

The `calculateRemoteRoads()` function in `roadNetworkPlanner.ts`:
- Calculates multi-room paths from home room to remote rooms
- Groups road positions by room name
- Returns a `Map<string, Set<string>>` where:
  - Key: room name
  - Value: set of road position keys ("x,y") in that room

Example:
```typescript
const remoteRoads = calculateRemoteRoads(homeRoom, ["W1N2", "W1N3"]);
// Returns:
// {
//   "W1N1": Set { "45,25", "46,25", "47,25", "48,25" },
//   "W1N2": Set { "0,25", "1,25", "2,25", ... },
//   "W1N3": Set { ... }
// }
```

### 2. Road Placement

The `remoteInfrastructure.ts` manager:
- Calls `calculateRemoteRoads()` to get all road positions
- Places roads in the **home room**
- Places roads in each **remote room** (if we have vision)

```typescript
private placeRemoteRoads(homeRoom: Room, remoteRooms: string[]): void {
  const remoteRoadsByRoom = calculateRemoteRoads(homeRoom, remoteRooms);
  
  // Place roads in home room
  const homeRoads = remoteRoadsByRoom.get(homeRoom.name);
  if (homeRoads) {
    this.placeRoadsInRoom(homeRoom, homeRoads);
  }
  
  // Place roads in remote rooms (if we have vision)
  for (const remoteName of remoteRooms) {
    const remoteRoom = Game.rooms[remoteName];
    if (!remoteRoom) continue;
    
    const remoteRoads = remoteRoadsByRoom.get(remoteName);
    if (remoteRoads) {
      this.placeRoadsInRoom(remoteRoom, remoteRoads);
    }
  }
}
```

### 3. Blueprint Validation

The `blueprints.ts` system validates structures to ensure they match the blueprint:

```typescript
// In roomNode.ts
const destroyed = destroyMisplacedStructures(
  room, 
  spawn.pos, 
  blueprint, 
  1, 
  swarm.remoteAssignments  // ← Critical: pass remote room list
);
```

The validation flow:
1. `destroyMisplacedStructures()` receives the list of remote rooms
2. Calls `findMisplacedStructures()` with remote rooms
3. `findMisplacedStructures()` calls `getValidRoadPositions()` with remote rooms
4. `getValidRoadPositions()` includes remote mining roads via `calculateRemoteRoads()`
5. Roads that are part of remote mining routes are marked as VALID
6. Only truly misplaced structures are destroyed

### 4. Valid Road Determination

The `getValidRoadPositions()` function combines multiple sources:

```typescript
export function getValidRoadPositions(
  room: Room,
  anchor: RoomPosition,
  blueprintRoads: { x: number; y: number }[],
  remoteRooms: string[] = []
): Set<string> {
  const validPositions = new Set<string>();
  
  // 1. Add blueprint roads (static positions around spawn)
  for (const r of blueprintRoads) {
    // ... add to validPositions
  }
  
  // 2. Add calculated road network (sources, controller, mineral)
  const roadNetwork = calculateRoadNetwork(room, anchor);
  for (const posKey of roadNetwork.positions) {
    validPositions.add(posKey);
  }
  
  // 3. Add remote mining roads (if remoteRooms provided)
  if (remoteRooms.length > 0) {
    const remoteRoads = calculateRemoteRoads(room, remoteRooms);
    const homeRoomRoads = remoteRoads.get(room.name);
    if (homeRoomRoads) {
      for (const posKey of homeRoomRoads) {
        validPositions.add(posKey);
      }
    }
  }
  
  // 4. CRITICAL: Add exit-zone roads (ALWAYS protected)
  const exitProtectionRoads = findExistingExitRoads(room, EXIT_ROAD_PROTECTION_DISTANCE);
  for (const posKey of exitProtectionRoads) {
    validPositions.add(posKey);
  }
  
  return validPositions;
}
```

The fourth step ensures that **all existing roads within 3 tiles of room edges are always valid**, regardless of whether they were built for a remote that's now abandoned.

## Complete Lifecycle

### Phase 1: Remote Assignment
- `expansionManager` identifies profitable remote rooms
- Assigns remote rooms to `swarm.remoteAssignments`

### Phase 2: Road Planning
- `calculateRemoteRoads()` computes multi-room paths
- Paths are grouped by room name
- Each room knows which roads it needs to build

### Phase 3: Road Placement
- `remoteInfrastructure` places construction sites
- Roads built in home room toward remote
- Roads built in remote room from entrance to sources

### Phase 4: Blueprint Validation
- Runs every 10 ticks in owned rooms
- `destroyMisplacedStructures()` called with `swarm.remoteAssignments`
- Remote mining roads are protected from destruction

### Phase 5: Room Transition (Optional)
- If a remote room is claimed and becomes owned
- Existing roads from entrance to sources remain valid
- They match the new room's calculated road network
- No roads are destroyed during transition

## Edge Cases Handled

### No Vision of Remote Room
- `placeRemoteRoads()` checks `Game.rooms[remoteName]`
- If undefined (no vision), skips that room
- Roads will be placed once scouts arrive

### Undefined Remote Assignments
- Code uses `swarm.remoteAssignments ?? []`
- Defaults to empty array if undefined
- Validation still works for local roads

### Remote Room Loses Roads
- If remote room is attacked and roads destroyed
- Home room roads to remote are still protected
- System will rebuild remote roads when possible

### Multiple Remote Rooms
- Each remote room is processed independently
- Roads to each remote are calculated separately
- All paths are protected by blueprint system

## Testing

Comprehensive tests verify:
1. Remote roads are included in valid positions
2. Multi-room paths are grouped correctly
3. Blueprint validation protects remote roads
4. Room transitions preserve roads
5. Edge cases are handled gracefully

See:
- `test/unit/blueprintRemoteRoads.test.ts` - Core functionality tests
- `test/unit/blueprintRemoteRoadsIntegration.test.ts` - Integration scenarios
- `test/unit/remoteInfrastructure.test.ts` - Remote infrastructure tests

## Key Files

- `src/empire/remoteInfrastructure.ts` - Places remote roads
- `src/layouts/roadNetworkPlanner.ts` - Calculates remote roads
- `src/layouts/blueprints.ts` - Validates roads against blueprint
- `src/core/roomNode.ts` - Calls validation with remote assignments

## Summary

**Yes, roads we build into other rooms ARE part of our blueprint.**

The system ensures this through:
1. **Explicit tracking**: Remote rooms stored in `swarm.remoteAssignments`
2. **Integrated calculation**: `calculateRemoteRoads()` computes paths as part of road network
3. **Protected validation**: `getValidRoadPositions()` includes remote mining roads
4. **Persistent infrastructure**: Roads survive room transitions and attacks

This design follows the ROADMAP principle of treating infrastructure as planned, permanent features rather than ad-hoc constructions.
