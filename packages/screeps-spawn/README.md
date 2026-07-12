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

### Role Definition Layout

The public API remains `ROLE_DEFINITIONS` from [`roleDefinitions.ts`](./src/roleDefinitions.ts). Internally, role templates are grouped by swarm responsibility under `src/role-definitions/`:

- `economy.ts` - room economy, remotes, and logistics creeps
- `military.ts` - combat body templates only; targeting logic stays elsewhere
- `utility.ts` - scouts, claimers, engineers, and remote workers
- `power.ts` - power-bank operation creeps
- `template.ts` - shared body-template helpers and spawn definition types

This keeps the spawn facade stable while making each role family easier to read and audit.

### Spawn Demand Layout

[`spawnNeedsAnalyzer.ts`](./src/spawnNeedsAnalyzer.ts) is the public demand facade used by the bot and intent compiler. Deeper modules hide target-selection details while preserving the same exports:

- `spawn-demand/claimerDemand.ts` - recovery reclaim, expansion claim, and remote reservation assignment order
- `spawn-demand/pioneerDemand.ts` - spawnless owned-room bootstrap assignment, closest-parent ownership, and escort-gated recovery under hostile pressure
- `spawn-demand/defenseAssistDemand.ts` - helper-room reinforcement demand, squad metadata, assigned-power accounting, and stale request pruning; defender need sizing and combat math/body sizing are consumed from `@ralphschuler/screeps-defense`
- `defenseAssistTelemetry.ts` - compact helper-room telemetry for defense-assist queue, staging, affordability, assigned power, and release diagnostics
- `spawn-demand/shared.ts` - map-distance fallback, remote safety gates, owned-spawn checks, and global utility queue enumeration

Keep new demand policies behind the facade unless callers need a stable public contract. This protects spawn priority/order behavior while making individual demand rules easier to test.

Defender requirement APIs are re-exported only for compatibility. New code should import `analyzeDefenderNeeds`, `getCurrentDefenders`, and defense-assistance helpers from `@ralphschuler/screeps-defense` directly.

### Types

See [types.ts](./src/types.ts) for spawn-operation types and [roleDefinitions.ts](./src/roleDefinitions.ts) for the re-exported `BodyTemplate` and `RoleSpawnDef` role-template types.

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
