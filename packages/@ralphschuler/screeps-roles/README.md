# @ralphschuler/screeps-roles

Reusable role behaviors and framework for Screeps bots.

## Overview

This package provides a composable behavior system and complete role implementations for Screeps. It allows you to:
- Use pre-built roles out of the box
- Compose custom roles from reusable behaviors
- Build your own behaviors using the framework

## Installation

```bash
npm install @ralphschuler/screeps-roles
```

## Quick Start

### Using Pre-Built Roles

```typescript
import { runEconomyRole, runMilitaryRole } from '@ralphschuler/screeps-roles';

// Run economy roles
for (const creep of Object.values(Game.creeps)) {
  if (creep.memory.family === 'economy') {
    runEconomyRole(creep);
  } else if (creep.memory.family === 'military') {
    runMilitaryRole(creep);
  }
}
```

### Composing Custom Roles

```typescript
import { 
  createContext, 
  executeAction,
  harvestBehavior,
  haulBehavior 
} from '@ralphschuler/screeps-roles';

// Create a custom harvester-hauler role
export function runCustomRole(creep: Creep): void {
  const ctx = createContext(creep);
  
  // Compose behaviors
  let action;
  if (creep.store.getFreeCapacity() > 0) {
    action = harvestBehavior(ctx);
  } else {
    action = haulBehavior(ctx);
  }
  
  executeAction(creep, action, ctx);
}
```

## Architecture

### Framework

The behavior framework consists of three main components:

1. **Context** - Gathers all information needed for decision making
2. **Behaviors** - Evaluate the situation and return actions
3. **Executor** - Executes actions on creeps

### Behaviors

Behaviors are pure functions that take a context and return an action:

```typescript
type BehaviorFunction = (ctx: CreepContext) => CreepAction;
```

### Actions

Actions describe what a creep should do:

```typescript
type CreepAction = 
  | { type: "harvest"; target: Source }
  | { type: "transfer"; target: AnyStoreStructure; resourceType: ResourceConstant }
  | { type: "build"; target: ConstructionSite }
  | { type: "upgrade"; target: StructureController }
  // ... and many more
```

## API Reference

### Framework

- `createContext(creep: Creep): CreepContext` - Creates a context for behavior evaluation
- `executeAction(creep: Creep, action: CreepAction, ctx: CreepContext): void` - Executes an action

### Economy Behaviors

- `harvestBehavior(ctx: CreepContext): CreepAction` - Harvest energy from sources
- `haulBehavior(ctx: CreepContext): CreepAction` - Transport energy
- `buildBehavior(ctx: CreepContext): CreepAction` - Build construction sites
- `upgradeBehavior(ctx: CreepContext): CreepAction` - Upgrade controller
- And more...

### Military Behaviors

- `attackBehavior(ctx: CreepContext): CreepAction` - Attack hostiles
- `defendBehavior(ctx: CreepContext): CreepAction` - Defend room
- `healBehavior(ctx: CreepContext): CreepAction` - Heal allies
- And more...

### Complete Roles

- `runEconomyRole(creep: Creep): void` - Run economy role behavior
- `runMilitaryRole(creep: Creep): void` - Run military role behavior
- `runUtilityRole(creep: Creep): void` - Run utility role behavior
- `runPowerRole(creep: Creep): void` - Run power creep role behavior

## License

Unlicense
