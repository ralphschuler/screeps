# Spawn System Extraction - Remaining Work

## Overview

The spawn system extraction from `packages/screeps-bot/src/spawning/` to `packages/screeps-spawn` is approximately **75% complete**. All files have been copied and most imports have been updated, but 39 TypeScript compilation errors remain.

## Files Successfully Migrated

✅ All 9 spawning system files copied to `packages/screeps-spawn/src/`:
- bodyOptimizer.ts (487 lines)
- bootstrapManager.ts
- defenderManager.ts  
- roleDefinitions.ts (474 lines, replaced existing version)
- spawnCoordinator.ts (550 lines)
- spawnNeedsAnalyzer.ts (532 lines)
- spawnPriority.ts
- spawnQueue.ts
- spawnQueueManager.ts

## Supporting Files Created

✅ **botTypes.ts** - Bot-specific type definitions:
- CreepRole, RoleFamily, EconomyRole, MilitaryRole, etc.
- SwarmState, SwarmCreepMemory
- Pheromones, ColonyLevel, RoomPosture

✅ **botIntegration.ts** - External dependency stubs:
- IKernel, IMemoryManager, IEnergyFlowPredictor
- IPowerBankHarvestingManager, IResourceTransferCoordinator
- Default stub implementations for all interfaces

## Remaining Compilation Errors (39 total)

### 1. SpawnManager.ts (4 errors)

**Issue**: `getRoleDefinition()` called with 2 arguments but only accepts 1

```typescript
// Lines 111, 332, 385, 421
const def = getRoleDefinition(role, this.roleDefs); // ERROR: too many args
```

**Fix**: Update `getRoleDefinition()` signature in roleDefinitions.ts to accept optional second parameter:
```typescript
export function getRoleDefinition(role: string, defs?: Record<string, RoleSpawnDef>): RoleSpawnDef | undefined {
  const definitions = defs || ROLE_DEFINITIONS;
  return definitions[role];
}
```

### 2. spawnCoordinator.ts (17 errors)

#### 2a. Energy Predictor Type Mismatch (4 errors)

**Issue**: Functions expect `string` but receive `Room`

```typescript
// Lines 114, 517, 537
energyFlowPredictor.getMaxAffordableInTicks(room, ticksToSpawn); // ERROR: Room vs string
```

**Fix**: Update IEnergyFlowPredictor interface in botIntegration.ts:
```typescript
export interface IEnergyFlowPredictor {
  predictConsumption(roomName: string | Room): number;
  getEnergyAvailableForSpawning(roomName: string | Room): number;
  predictEnergyInTicks(roomName: string | Room, ticks: number): number;
  getMaxAffordableInTicks(roomName: string | Room, ticks: number): number;
}
```

And update stub implementations to handle both types:
```typescript
getMaxAffordableInTicks: (roomName: string | Room, ticks: number) => {
  const name = typeof roomName === 'string' ? roomName : roomName.name;
  const room = Game.rooms[name];
  return room ? room.energyCapacityAvailable : 0;
}
```

#### 2b. Power Bank Request Structure (13 errors)

**Issue**: `powerBankHarvestingManager.requestSpawns()` returns array, but code expects object with numeric properties

```typescript
// Lines 349, 357, 383, 409, 434, 436 (multiple occurrences)
if (requests.powerHarvesters === 0 && ...) // ERROR: property doesn't exist
for (let i = 0; i < requests.powerHarvesters; i++) // ERROR
```

**Fix**: Update IPowerBankHarvestingManager interface in botIntegration.ts:
```typescript
export interface PowerBankSpawnRequests {
  powerHarvesters: number;
  healers: number;
  powerCarriers: number;
}

export interface IPowerBankHarvestingManager {
  getActivePowerBanks(): Array<{ roomName: string; id: Id<StructurePowerBank> }>;
  needsHarvesters(powerBankId: Id<StructurePowerBank>): boolean;
  needsCarriers(powerBankId: Id<StructurePowerBank>): boolean;
  requestSpawns(roomName: string): PowerBankSpawnRequests; // Changed from array
}
```

Update stub implementation:
```typescript
export const powerBankHarvestingManager: IPowerBankHarvestingManager = {
  getActivePowerBanks: () => [],
  needsHarvesters: () => false,
  needsCarriers: () => false,
  requestSpawns: () => ({ powerHarvesters: 0, healers: 0, powerCarriers: 0 })
};
```

### 3. spawnNeedsAnalyzer.ts (13 errors)

#### 3a. Remote Assignments Type (8 errors)

**Issue**: `remoteAssignments` is typed as `Record<string, {...}>` but used as array

```typescript
// Lines 141, 202, 208, 244, 347
for (const remoteRoom of remoteAssignments) // ERROR: not iterable
if (remoteAssignments.length > 0) // ERROR: no length property
```

**Fix**: Update SwarmState in botTypes.ts to make remoteAssignments consistently an object:
```typescript
export interface SwarmState {
  // ... other properties
  remoteAssignments?: Record<string, { harvesters: number; haulers: number; guards: number }>;
}
```

Then update code to iterate over entries:
```typescript
// Instead of: for (const remoteRoom of remoteAssignments)
const remoteAssignments = swarm.remoteAssignments || {};
for (const [remoteName, assignment] of Object.entries(remoteAssignments)) {
  // Use remoteName and assignment
}

// Instead of: if (remoteAssignments.length > 0)
if (Object.keys(remoteAssignments).length > 0) {
  // ...
}
```

#### 3b. Missing Interface Methods (3 errors)

**Issue**: IResourceTransferCoordinator missing methods

```typescript
// Line 500
resourceTransferCoordinator.getActiveRequests() // ERROR: doesn't exist
```

**Fix**: Update IResourceTransferCoordinator in botIntegration.ts:
```typescript
export interface CrossShardTransferRequest {
  fromRoom: string;
  toRoom: string;
  resourceType: ResourceConstant;
  amount: number;
  sourceRoom: string; // Added
  transferred: number; // Added
  assignedCreeps: string[]; // Added
}

export interface IResourceTransferCoordinator {
  getPendingTransfers(roomName: string): CrossShardTransferRequest[];
  needsCarrier(roomName: string): boolean;
  getActiveRequests(): CrossShardTransferRequest[]; // Added
}
```

Update stub:
```typescript
export const resourceTransferCoordinator: IResourceTransferCoordinator = {
  getPendingTransfers: () => [],
  needsCarrier: () => false,
  getActiveRequests: () => []
};
```

#### 3c. Remote Hauler Requirement Type (1 error)

**Issue**: `calculateRemoteHaulerRequirement()` returns number but code expects object

```typescript
// Line 161
maxPerRemote = requirement.recommendedHaulers; // ERROR: number has no properties
```

**Fix**: Update return type in botIntegration.ts:
```typescript
export interface RemoteHaulerRequirement {
  recommendedHaulers: number;
  carryCapacity: number;
}

export function calculateRemoteHaulerRequirement(
  homeRoom: string,
  targetRoom: string,
  energyPerTick: number,
  distance: number
): RemoteHaulerRequirement {
  const carryNeeded = energyPerTick * distance * 2;
  const haulerCapacity = 50 * CARRY_CAPACITY;
  const recommendedHaulers = Math.ceil(carryNeeded / haulerCapacity);
  
  return {
    recommendedHaulers,
    carryCapacity: haulerCapacity
  };
}
```

#### 3d. Type Annotations (1 error)

**Issue**: Implicit `any` type

```typescript
// Line 427
const hasExpansionTarget = empire.claimQueue.some(c => !c.claimed); // ERROR: 'c' has any type
```

**Fix**: Add type annotation or update IMemoryManager interface to properly type getEmpire():
```typescript
export interface ClaimTarget {
  roomName: string;
  claimed: boolean;
}

export interface Empire {
  claimQueue: ClaimTarget[];
}

export interface IMemoryManager {
  // ... existing methods
  getEmpire(): Empire | null;
}
```

### 4. spawnQueue.ts (1 error)

**Issue**: Type incompatibility with home property

```typescript
// Line 274
const memory: SwarmCreepMemory = {
  home: request.homeRoom, // ERROR: homeRoom is string|undefined, home requires string
  // ...
};
```

**Fix**: Ensure homeRoom is defined or provide fallback:
```typescript
const memory: SwarmCreepMemory = {
  role: request.role,
  family: request.family,
  home: request.homeRoom || request.roomName,
  homeRoom: request.homeRoom || request.roomName,
  version: Game.time,
  ...request.additionalMemory
};
```

### 5. spawnQueueManager.ts (4 errors)

**Issue**: Missing 'home' property in memory objects

```typescript
// Lines 216, 319
const memory: SwarmCreepMemory = {
  role,
  family: def.family,
  homeRoom: room.name,
  version: Game.time
  // Missing: home property
};
```

**Fix**: Add home property:
```typescript
const memory: SwarmCreepMemory = {
  role,
  family: def.family,
  home: room.name,
  homeRoom: room.name,
  version: Game.time
};
```

## Implementation Checklist

- [ ] Fix getRoleDefinition signature (SpawnManager.ts)
- [ ] Update IEnergyFlowPredictor to accept Room | string
- [ ] Fix PowerBankSpawnRequests interface and return type
- [ ] Fix remoteAssignments iteration and type usage
- [ ] Add getActiveRequests to IResourceTransferCoordinator
- [ ] Update CrossShardTransferRequest with missing properties
- [ ] Fix calculateRemoteHaulerRequirement return type
- [ ] Add type annotations for empire/cluster operations
- [ ] Fix home/homeRoom property assignments
- [ ] Test build after each major fix
- [ ] Once all errors fixed, update screeps-bot imports
- [ ] Delete old spawning/ directory
- [ ] Run full test suite
- [ ] Validate spawn functionality in game

## After Compilation Fixes

Once the package builds successfully, complete Phase 5 and 6:

### Phase 5: Update screeps-bot Imports

Files that need import updates:
- `packages/screeps-bot/src/logic/spawn.ts` (main export point)
- `packages/screeps-bot/src/clusters/clusterManager.ts`
- `packages/screeps-bot/src/clusters/squadFormationManager.ts`
- `packages/screeps-bot/src/intershard/resourceTransferCoordinator.ts`
- Test files in `packages/screeps-bot/test/`

Change from:
```typescript
import { ... } from "../spawning/...";
```

To:
```typescript
import { ... } from "@ralphschuler/screeps-spawn";
```

### Phase 6: Final Cleanup

1. Delete `packages/screeps-bot/src/spawning/` directory
2. Run lint: `npm run lint -w @ralphschuler/screeps-spawn`
3. Build spawn package: `npm run build:spawn`
4. Build bot package: `npm run build -w screeps-typescript-starter`
5. Run tests: `npm test`
6. Deploy and verify in-game functionality

## Estimated Effort

- Fixing compilation errors: **2-3 hours** (methodical interface updates and type fixes)
- Updating bot imports: **30 minutes** (straightforward find-replace)
- Testing and validation: **1-2 hours** (build verification, in-game testing)

**Total**: ~4-6 hours for complete extraction

## Benefits After Completion

- ✅ **Code Reduction**: ~3,555 lines moved from main bot
- ✅ **Modularity**: Spawn logic centralized in dedicated package
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Reusability**: Spawn package can be used by other bot implementations
- ✅ **Build Performance**: Parallel package building
- ✅ **Testing**: Spawn system can be tested independently
