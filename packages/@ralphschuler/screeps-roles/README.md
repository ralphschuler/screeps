# @ralphschuler/screeps-roles

Reusable role behaviors and framework for Screeps bots.

## 🎯 Canonical Source of Truth

**This package is the authoritative source** for all role behavior implementations, creep actions, and the behavior framework.

### For Developers

- ✅ **All behavior changes must be made here** - not in consuming projects
- ✅ **This package is independently maintained and tested**
- ✅ **Breaking changes follow semantic versioning**

### For Consumers

If you're using this package in your bot:
- Import from `@ralphschuler/screeps-roles` - never copy code locally
- Report bugs and request features via GitHub issues
- Contribute improvements via pull requests to this package

### Related Documentation

See the main repository's [CONTRIBUTING.md](../../CONTRIBUTING.md) for the framework-first development policy.

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

### Phase 1: Currently Available

```typescript
import { createContext, clearRoomCaches } from '@ralphschuler/screeps-roles';

// Create context for behavior evaluation
const ctx = createContext(creep);

// Access cached room data (lazy-evaluated)
console.log(ctx.droppedResources.length);
console.log(ctx.containers.length);

// Clear caches at start of tick
clearRoomCaches();
```

### Pre-Built Roles (Phase 9 - Basic Implementation)

```typescript
// NOW AVAILABLE - Basic role implementations exported
// Note: These are minimal implementations that will be expanded as behaviors are extracted (Phases 2-8)
import { runEconomyRole, runMilitaryRole, runUtilityRole } from '@ralphschuler/screeps-roles';

for (const creep of Object.values(Game.creeps)) {
  if (creep.memory.family === 'economy') {
    runEconomyRole(creep);
  } else if (creep.memory.family === 'military') {
    runMilitaryRole(creep);
  } else if (creep.memory.family === 'utility') {
    runUtilityRole(creep);
  }
}
```

**Important Note**: The current implementations are placeholders that create context but do not execute behaviors. Full functionality requires:
- Phase 2: Behavior Executor
- Phase 3: State Machine
- Phases 4-6: Behavior Implementations

These will be added in future updates. For now, the roles establish the API structure and can be used as a foundation.

### Coming Soon: Composing Custom Roles (Phases 2-8)

```typescript
// NOT YET AVAILABLE - Planned for Phases 2-8
import { 
  createContext, 
  executeAction,        // Phase 2
  harvestBehavior,      // Phase 4
  haulBehavior          // Phase 4
} from '@ralphschuler/screeps-roles';

export function runCustomRole(creep: Creep): void {
  const ctx = createContext(creep);
  
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

### Framework (Phase 1 - Available Now)

- `createContext(creep: Creep): CreepContext` - Creates a context for behavior evaluation
- `clearRoomCaches(): void` - Clears per-tick room caches (call at tick start)

### Planned API

#### Phase 2: Executor
- `executeAction(creep: Creep, action: CreepAction, ctx: CreepContext): void` - Executes an action

#### Phase 4: Economy Behaviors
- `harvestBehavior(ctx: CreepContext): CreepAction` - Harvest energy from sources
- `haulBehavior(ctx: CreepContext): CreepAction` - Transport energy
- `buildBehavior(ctx: CreepContext): CreepAction` - Build construction sites
- `upgradeBehavior(ctx: CreepContext): CreepAction` - Upgrade controller
- And more...

#### Phase 5: Military Behaviors
- `attackBehavior(ctx: CreepContext): CreepAction` - Attack hostiles
- `defendBehavior(ctx: CreepContext): CreepAction` - Defend room
- `healBehavior(ctx: CreepContext): CreepAction` - Heal allies
- And more...

#### Phase 9: Complete Roles
- `runEconomyRole(creep: Creep): void` - Run economy role behavior
- `runMilitaryRole(creep: Creep): void` - Run military role behavior
- `runUtilityRole(creep: Creep): void` - Run utility role behavior
- `runPowerRole(creep: Creep): void` - Run power creep role behavior

See `docs/IMPLEMENTATION_STATUS.md` for the complete roadmap.

## License

Unlicense
