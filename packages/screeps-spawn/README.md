# @ralphschuler/screeps-spawn

Modular spawn system for Screeps with clean interfaces and reusable logic.

## Features

- **Clean Interfaces**: Decoupled from bot-specific memory structures and Game object
- **Body Optimization**: Intelligent body part selection based on energy and role requirements
- **Priority System**: Flexible priority-based spawn queue management
- **Role Definitions**: Comprehensive set of role templates for economy, military, utility, and power roles
- **Pheromone Integration**: Support for pheromone-based priority adjustments
- **TypeScript**: Full type safety with TypeScript definitions

## Installation

```bash
npm install @ralphschuler/screeps-spawn
```

## Usage

### Basic Usage

```typescript
import { SpawnManager, SpawnRequest, RoomState } from "@ralphschuler/screeps-spawn";

// Create spawn manager
const spawnManager = new SpawnManager({
  debug: true,
  rolePriorities: {
    harvester: 100,
    hauler: 90
  }
});

// Prepare spawn requests
const requests: SpawnRequest[] = [
  {
    role: "harvester",
    priority: 100,
    memory: { role: "harvester", sourceId: "source1" }
  },
  {
    role: "hauler",
    priority: 90,
    memory: { role: "hauler" }
  }
];

// Process spawn queue
const spawns = room.find(FIND_MY_SPAWNS);
const results = spawnManager.processSpawnQueue(spawns, requests);

// Check results
for (const result of results) {
  if (result.success) {
    console.log(`Spawned ${result.creepName} (${result.role})`);
  } else {
    console.log(`Failed to spawn ${result.role}: ${result.message}`);
  }
}
```

### Custom Role Definitions

```typescript
import { SpawnManager, RoleSpawnDef } from "@ralphschuler/screeps-spawn";

const customRoles: Record<string, RoleSpawnDef> = {
  customHarvester: {
    role: "customHarvester",
    family: "economy",
    bodies: [
      {
        parts: [WORK, WORK, CARRY, MOVE, MOVE],
        cost: 300,
        minCapacity: 300
      }
    ],
    priority: 100,
    maxPerRoom: 2,
    remoteRole: false
  }
};

const spawnManager = new SpawnManager({}, customRoles);
```

### Body Optimization

```typescript
import { createBalancedBody, BODY_PART_COSTS } from "@ralphschuler/screeps-spawn";

// Create balanced body with 1 WORK, 1 CARRY, 2 MOVE ratio
const body = createBalancedBody(1000, {
  [WORK]: 1,
  [CARRY]: 1,
  [MOVE]: 2
});

console.log(body); // [WORK, CARRY, MOVE, MOVE, WORK, CARRY, MOVE, MOVE, ...]
```

## API Reference

### SpawnManager

Main class for managing spawn operations.

#### Constructor

```typescript
new SpawnManager(config?: SpawnConfig, customRoles?: Record<string, RoleSpawnDef>)
```

#### Methods

- `getBestBody(role: string, energyAvailable: number): BodyTemplate | null`
  - Get optimal body template for role and energy budget

- `executeSpawn(spawn: StructureSpawn, request: SpawnRequest): SpawnResult`
  - Execute a single spawn request

- `processSpawnQueue(spawns: StructureSpawn[], requests: SpawnRequest[]): SpawnResult[]`
  - Process multiple spawn requests across multiple spawns

- `shouldSpawnRole(role: string, currentCount: number, roomState: RoomState): boolean`
  - Check if role should be spawned

- `calculatePriority(role: string, currentCount: number, roomState: RoomState): number`
  - Calculate effective priority for a role

### Types

See [types.ts](./src/types.ts) for full type definitions.

## Integration with Screeps Bot

This package is designed to be integrated into your Screeps bot. Create an adapter layer:

```typescript
import { SpawnManager, RoomState, SpawnRequest } from "@ralphschuler/screeps-spawn";
import { SwarmState } from "./memory/schemas";

export function runSpawnSystem(room: Room, swarm: SwarmState): void {
  const spawnManager = new SpawnManager({
    debug: Memory.debugSpawn
  });

  // Convert SwarmState to RoomState
  const roomState: RoomState = {
    name: room.name,
    energyAvailable: room.energyAvailable,
    energyCapacityAvailable: room.energyCapacityAvailable,
    rcl: room.controller?.level ?? 0,
    posture: swarm.posture,
    pheromones: swarm.pheromones,
    danger: swarm.danger,
    bootstrap: isBootstrapMode(room)
  };

  // Build spawn requests from your bot logic
  const requests: SpawnRequest[] = buildSpawnRequests(room, swarm);

  // Process spawns
  const spawns = room.find(FIND_MY_SPAWNS);
  const results = spawnManager.processSpawnQueue(spawns, requests);

  // Handle results
  for (const result of results) {
    if (result.success) {
      // Initialize creep, update metrics, etc.
    }
  }
}
```

## Testing

The package includes comprehensive tests covering:

- **Body Optimization**: Tests for `getBestBody()` with various energy budgets and roles
- **Queue Processing**: Tests for `processSpawnQueue()` with multiple spawns and priority handling
- **Spawn Execution**: Tests for `executeSpawn()` including error cases and validation
- **Priority Calculation**: Tests for `calculatePriority()` with pheromone multipliers
- **Bootstrap Mode**: Tests for larvaWorker spawning with minimal energy
- **Configuration**: Tests for custom role definitions and config options

**Test Coverage**: >80% (target achieved)

Run tests:
```bash
npm test
```

Run tests with watch mode:
```bash
npm run test:watch
```

### Test Structure

```
test/
  ├── setup.ts              # Test environment setup and mocks
  ├── SpawnManager.test.ts  # Main SpawnManager tests
  ├── bodyUtils.test.ts     # Body optimization tests
  └── roleDefinitions.test.ts # Role definition tests
```

### Key Test Cases

- ✅ Body selection within energy budget
- ✅ Priority-based queue processing
- ✅ Multi-spawn concurrent spawning
- ✅ Bootstrap mode with minimal energy
- ✅ Pheromone-based priority adjustments
- ✅ Custom role definitions
- ✅ Error handling and validation

## License

Unlicense - Public Domain

## Credits

Extracted from the [screeps-ant-swarm](https://github.com/ralphschuler/screeps) bot repository.
