# Lab System Architecture

## Overview

The lab system has been refactored to use the `@ralphschuler/screeps-chemistry` package for core chemistry functionality. The files in this directory are **adapters** that bridge bot-specific dependencies with the chemistry package.

## Architecture

```
@ralphschuler/screeps-chemistry (Core Logic)
    ↑
    │ (uses)
    │
Bot Labs Adapters (This Directory)
    ↑
    │ (uses)
    │
Bot Systems (roomNode, coreProcessManager, etc.)
```

## Files

### Core Adapters

#### `labConfig.ts` (219 lines)
**Purpose:** Adapter for LabConfigManager with Memory/heapCache integration

**What it does:**
- Wraps `@ralphschuler/screeps-chemistry/LabConfigManager`
- Adds Memory persistence using heapCache
- Maintains backward-compatible API
- Integrates with bot's logger system

**Key Methods:**
- `initialize()` - Delegates to chemistry package
- `saveToMemory()` / `loadFromMemory()` - Bot-specific Memory integration
- All other methods delegate to chemistry manager

#### `chemistryPlanner.ts` (127 lines)
**Purpose:** Adapter for ChemistryManager with SwarmState integration

**What it does:**
- Wraps `@ralphschuler/screeps-chemistry/ChemistryManager`
- Converts bot's `SwarmState` to chemistry package's `ChemistryState`
- Adapts logger interface
- Provides bot-friendly API

#### `boostManager.ts` (321 lines)
**Purpose:** Creep boosting system with SwarmState integration

**What it does:**
- Uses boost configuration from chemistry package
- Integrates with bot's danger levels and posture
- Manages boost lab preparation
- Handles boost ROI calculations
- Bot-specific logic for when to boost creeps

### Bot-Specific Orchestration

#### `labManager.ts` (380 lines)
**Purpose:** High-level lab operations coordinator

**What it does:**
- Coordinates lab resource loading/unloading
- Manages boost lab preparation
- Handles unboosting of dying creeps
- Integrates with bot's carrier and terminal systems
- Re-exports types from chemistry package

#### `index.ts` (32 lines)
**Purpose:** Central export point

**What it exports:**
- All adapter instances
- Types from chemistry package (re-exported for convenience)

## Adapter Pattern Benefits

### 1. **Separation of Concerns**
- Core chemistry logic in reusable package
- Bot-specific integrations in adapters
- Clear boundaries between systems

### 2. **Maintainability**
- Chemistry logic can be updated independently
- Bot-specific code stays in bot package
- Easier to test chemistry logic in isolation

### 3. **Reusability**
- Chemistry package can be used by other bots
- Published to npm for community use
- Follows standard package conventions

### 4. **Type Safety**
- All types exported from chemistry package
- Bot re-exports for convenience
- No type duplication

## Usage Example

```typescript
import { labConfigManager, chemistryPlanner, boostManager } from "./labs";

// Initialize labs (uses chemistry package internally)
labConfigManager.initialize("W1N1");

// Plan reactions (adapter converts SwarmState to ChemistryState)
const reaction = chemistryPlanner.planReactions(room, swarm);

// Check if should boost (bot-specific logic)
if (boostManager.shouldBoost(creep, swarm)) {
  boostManager.boostCreep(creep, room);
}
```

## Migration Notes

### Before Refactoring
- All lab code in `packages/screeps-bot/src/labs/`
- ~1,345 lines of code
- Duplicated chemistry logic
- Mixed bot-specific and general-purpose code

### After Refactoring
- Core chemistry in `@ralphschuler/screeps-chemistry` (1,381 lines)
- Bot adapters in `packages/screeps-bot/src/labs/` (1,079 lines)
- Clean separation of concerns
- Reusable chemistry package

### Backward Compatibility
All existing imports continue to work:
- `import { labConfigManager } from "./labs/labConfig"` ✅
- `import { chemistryPlanner } from "./labs/chemistryPlanner"` ✅
- `import { boostManager } from "./labs/boostManager"` ✅
- `import { labManager } from "./labs/labManager"` ✅

Types are re-exported:
- `import type { LabRole, LabConfigEntry } from "./labs"` ✅
- `import type { Reaction, BoostConfig } from "./labs"` ✅

## Development Guidelines

### When to Modify Chemistry Package
- Adding new reaction chains
- Changing boost configurations
- Updating compound stockpile targets
- Core lab coordination logic

### When to Modify Bot Adapters
- Integrating with new bot systems
- Adding bot-specific heuristics
- Changing Memory persistence strategy
- Modifying danger level thresholds

### Adding New Features
1. Determine if feature is bot-specific or general-purpose
2. If general-purpose: Add to chemistry package
3. If bot-specific: Add to appropriate adapter
4. Update types and exports as needed

## Related Documentation

- [`@ralphschuler/screeps-chemistry` README](../../../screeps-chemistry/README.md)
- [ROADMAP.md Section 16 - Labs](../../../../ROADMAP.md) (Labs design)
- [Chemistry Package API Docs](../../../screeps-chemistry/docs/API.md) (if exists)
