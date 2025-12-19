# @ralphschuler/screeps-chemistry

Chemistry and lab management system for Screeps - reaction chains, boost production, and lab coordination.

## Features

- **Reaction Chain Planning**: Automatically calculate multi-step reaction chains for any compound
- **Lab Coordination**: Auto-assign lab roles (input/output/boost) based on spatial layout
- **Boost Management**: Configure and manage creep boosting for different roles
- **Just-in-Time Production**: Adjust stockpile targets based on game state (war/eco mode)
- **Clean API**: Framework-agnostic with minimal dependencies

## Installation

```bash
npm install @ralphschuler/screeps-chemistry
```

## Quick Start

```typescript
import { ChemistryManager, LabConfigManager } from '@ralphschuler/screeps-chemistry';

// Create manager instances
const chemistry = new ChemistryManager({ logger: myLogger });
const labConfig = new LabConfigManager({ logger: myLogger });

// Initialize lab configuration
labConfig.initialize('W1N1');

// Define game state
const gameState = {
  currentTick: Game.time,
  danger: 2,
  posture: 'war',
  pheromones: { war: 80, siege: 0 }
};

// Plan and execute reactions
const reaction = chemistry.planReactions(Game.rooms['W1N1'], gameState);
if (reaction) {
  labConfig.setActiveReaction('W1N1', reaction.input1, reaction.input2, reaction.product);
  labConfig.runReactions('W1N1');
}
```

## Core Concepts

### Reaction Chains

The system automatically calculates multi-step reaction chains:

```typescript
// Get reaction chain for T3 boost
const chain = chemistry.calculateReactionChain(
  RESOURCE_CATALYZED_UTRIUM_ACID,
  availableResources
);

// Returns: [
//   { product: RESOURCE_HYDROXIDE, input1: RESOURCE_HYDROGEN, input2: RESOURCE_OXYGEN },
//   { product: RESOURCE_UTRIUM_HYDRIDE, input1: RESOURCE_UTRIUM, input2: RESOURCE_HYDROGEN },
//   { product: RESOURCE_UTRIUM_ACID, input1: RESOURCE_UTRIUM_HYDRIDE, input2: RESOURCE_HYDROXIDE },
//   { product: RESOURCE_CATALYZED_UTRIUM_ACID, input1: RESOURCE_UTRIUM_ACID, input2: RESOURCE_CATALYST }
// ]
```

### Lab Configuration

Labs are automatically assigned roles based on spatial layout:

- **Input Labs (2)**: Labs with maximum reach to other labs
- **Output Labs (1-8)**: Labs within range 2 of both input labs
- **Boost Labs**: Labs not in range of input labs

```typescript
labConfig.initialize('W1N1');

const { input1, input2 } = labConfig.getInputLabs('W1N1');
const outputLabs = labConfig.getOutputLabs('W1N1');
const boostLabs = labConfig.getBoostLabs('W1N1');
```

### Boost Management

Configure boosts for different roles:

```typescript
import { BOOST_CONFIGS, getBoostConfig, calculateBoostCost } from '@ralphschuler/screeps-chemistry';

// Get boost config for a role
const config = getBoostConfig('soldier');
// => { role: 'soldier', boosts: [RESOURCE_CATALYZED_UTRIUM_ACID, ...], minDanger: 2 }

// Calculate costs
const cost = calculateBoostCost('soldier', 20);
// => { mineral: 1200, energy: 800 }
```

### Just-in-Time Production

Stockpile targets adjust based on game state:

```typescript
import { getStockpileTarget, getTargetCompounds } from '@ralphschuler/screeps-chemistry';

const state = { 
  danger: 3, 
  posture: 'war',
  pheromones: { war: 90 },
  currentTick: Game.time
};

// War mode: increased targets for combat boosts
const target = getStockpileTarget(RESOURCE_CATALYZED_UTRIUM_ACID, state);
// => 5250 (3000 base * 1.75 multiplier)

// Get prioritized compound list
const compounds = getTargetCompounds(state);
// => [RESOURCE_GHODIUM, RESOURCE_HYDROXIDE, RESOURCE_CATALYZED_UTRIUM_ACID, ...]
```

## API Reference

### ChemistryManager

Main coordination class for chemistry operations.

#### Constructor

```typescript
new ChemistryManager(options?: { logger?: ChemistryLogger })
```

#### Methods

- `getReaction(compound: ResourceConstant): Reaction | undefined`
- `calculateReactionChain(target: ResourceConstant, availableResources): Reaction[]`
- `hasResourcesForReaction(terminal: StructureTerminal, reaction: Reaction, minAmount?: number): boolean`
- `planReactions(room: Room, state: ChemistryState): Reaction | null`
- `scheduleCompoundProduction(rooms: Room[], state: ChemistryState): { room, reaction, priority }[]`
- `executeReaction(room: Room, reaction: Reaction): void`

### LabConfigManager

Manages lab role assignments and configuration.

#### Constructor

```typescript
new LabConfigManager(options?: { logger?: ChemistryLogger })
```

#### Methods

- `initialize(roomName: string): void`
- `getConfig(roomName: string): RoomLabConfig | undefined`
- `getLabsByRole(roomName: string, role: LabRole): StructureLab[]`
- `getInputLabs(roomName: string): { input1?, input2? }`
- `getOutputLabs(roomName: string): StructureLab[]`
- `getBoostLabs(roomName: string): StructureLab[]`
- `setActiveReaction(roomName, input1, input2, output): boolean`
- `clearActiveReaction(roomName: string): void`
- `runReactions(roomName: string): number`
- `exportConfig(roomName: string): RoomLabConfig | undefined`
- `importConfig(config: RoomLabConfig): void`

### Types

#### ChemistryState

```typescript
interface ChemistryState {
  currentTick: number;
  danger: number; // 0-3
  posture: "eco" | "expand" | "defense" | "war" | "siege" | "evacuate";
  pheromones: {
    war?: number;
    siege?: number;
  };
}
```

#### ChemistryLogger

```typescript
interface ChemistryLogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}
```

## Integration Example

```typescript
// In your main loop
import { ChemistryManager, LabConfigManager } from '@ralphschuler/screeps-chemistry';

const chemistry = new ChemistryManager({ logger: console });
const labConfig = new LabConfigManager({ logger: console });

for (const roomName in Game.rooms) {
  const room = Game.rooms[roomName];
  
  // Initialize labs
  labConfig.initialize(roomName);
  
  // Load config from memory if persisting
  const memoryConfig = Memory.rooms[roomName]?.labConfig;
  if (memoryConfig) {
    labConfig.importConfig(memoryConfig);
  }
  
  // Plan reactions based on current state
  const state = {
    currentTick: Game.time,
    danger: calculateDanger(room),
    posture: determinePosture(room),
    pheromones: { war: 0, siege: 0 }
  };
  
  const reaction = chemistry.planReactions(room, state);
  if (reaction) {
    labConfig.setActiveReaction(roomName, reaction.input1, reaction.input2, reaction.product);
    chemistry.executeReaction(room, reaction);
  }
  
  // Save config to memory
  const config = labConfig.exportConfig(roomName);
  if (config && Memory.rooms[roomName]) {
    Memory.rooms[roomName].labConfig = config;
  }
}
```

## Architecture

The package is organized into modules:

- **reactions/**: Reaction chain planning and execution
  - `reactionChains.ts`: Complete reaction definitions
  - `chemistryManager.ts`: Main coordination class
- **labs/**: Lab configuration and management
  - `labConfig.ts`: Lab role assignment and coordination
- **boosts/**: Boost configuration
  - `config.ts`: Role-based boost definitions
- **compounds/**: Stockpile management
  - `targets.ts`: Dynamic target calculation
- **types.ts**: Core interfaces and types

## Design Principles

1. **Framework Agnostic**: No hard dependencies on specific bot architectures
2. **Minimal Dependencies**: Only depends on Screeps game API
3. **Clean Separation**: Chemistry logic separate from bot-specific code
4. **Easy Integration**: Simple interfaces for state and logging
5. **Memory Efficient**: Configs can be serialized/deserialized for persistence

## License

Unlicense - Public Domain
