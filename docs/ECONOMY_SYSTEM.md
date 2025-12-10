# Economy System Documentation

## Overview

The economy system in this Screeps bot manages all resource-related operations including harvesting, hauling, storage management, link balancing, terminal transfers, factory production, and mineral mining. All economy managers are integrated with the kernel process system for efficient CPU management.

## Architecture

The economy system follows the ROADMAP.md principles:
- **Decentralization**: Each room manages its own economy
- **CPU Efficiency**: Processes run at appropriate frequencies with CPU budgets
- **Event-driven**: Critical events trigger immediate updates
- **Pheromone-based**: Economy decisions influenced by pheromone levels

## Core Components

### 1. Static Harvesting & Hauling

**Implementation**: `src/roles/behaviors/economy.ts`

#### Harvesters (Static Miners)
- Stay at source position permanently
- Harvest energy continuously
- Transfer to nearby container or link
- Fall back to dropping energy for haulers

**Body Composition**: 5-7 WORK, 1 MOVE, minimal CARRY

**Key Features**:
- Automatic source assignment with load balancing
- Container mining for efficient energy collection
- Link support for high-RCL rooms
- Hostile detection and flee behavior for remote harvesters

#### Haulers (Carriers)
- Transport energy from sources to spawn structures
- Priority delivery: Spawn > Extensions > Towers > Storage > Containers
- Support for mineral transport to terminal/storage

**Body Composition**: Heavy CARRY/MOVE ratio

**Optimizations**:
- Cached target finding (5-15 tick cache times)
- Priority-based delivery system
- Energy threshold checks to justify travel costs

### 2. Remote Mining

**Implementation**: `src/roles/behaviors/economy.ts` (remoteHarvester, remoteHauler)

#### Remote Harvesters
- Travel to remote rooms to harvest sources
- Container mining in remote locations
- Safety features:
  - Hostile detection within 5 tile range
  - Automatic flee behavior
  - Return home when threatened

#### Remote Haulers
- Transport energy from remote rooms to home storage
- Energy collection threshold: 30% of capacity
- Prioritize returning home with cargo when threatened

**Configuration**:
- Target room stored in `memory.targetRoom`
- Home room stored in `memory.homeRoom`
- Automatic source assignment in target room

### 3. Link Balancing Automation

**Implementation**: `src/economy/linkManager.ts`

#### LinkManager
Automated energy transfer system for link networks (RCL 5+).

**Features**:
- Automatic link classification by role:
  - **Source Links**: Near energy sources (within range 2)
  - **Controller Links**: Near controller (within range 2)
  - **Storage Links**: Near storage (within range 2)
- Priority-based transfer system:
  1. Controller links (priority 100) - for upgraders
  2. Storage links (priority 50) - for general distribution
  3. Unknown links (priority 25)
- Transfer logic:
  - Source links send when >= 400 energy
  - Controller links kept at ~700 energy
  - Storage links kept at ~100 energy minimum
- Respects link cooldowns and capacities
- Runs every 5 ticks as medium frequency process

**Configuration**:
```typescript
{
  minBucket: 2000,           // CPU bucket threshold
  minSourceLinkEnergy: 400,  // Transfer threshold
  controllerLinkMaxEnergy: 700, // Controller target
  transferThreshold: 100,    // Min transfer amount
  storageLinkReserve: 100    // Storage minimum
}
```

**Integration**:
- Registered with kernel process system
- Upgraders prioritize controller links for energy collection
- Harvesters automatically deposit to source links

### 4. Terminal Automation

**Implementation**: `src/economy/terminalManager.ts`

#### TerminalManager
Automated inter-room resource balancing via terminals (RCL 6+).

**Features**:
- **Energy Balancing**:
  - Send threshold: 100,000 energy
  - Request threshold: 30,000 energy
  - Minimum transfer: 5,000 energy
  - Maximum cost ratio: 10%
- **Mineral Balancing**:
  - Distributes minerals between rooms
  - Minimum imbalance: 5,000 units
  - Transfer half the imbalance
- **Transfer Queue**:
  - Priority-based execution
  - One transfer per terminal per tick
  - Automatic cost calculation
  - Queue validation and cleanup

**Configuration**:
```typescript
{
  minBucket: 2000,
  minStorageEnergy: 50000,    // Min before sending
  terminalEnergyTarget: 20000,
  terminalEnergyMax: 50000,
  energySendThreshold: 100000,
  energyRequestThreshold: 30000,
  minTransferAmount: 5000,
  maxTransferCostRatio: 0.1
}
```

**Public API**:
- `requestTransfer(from, to, resource, amount, priority)`: Queue manual transfer
- `queueTransfer(...)`: Direct queue access

**Process Info**:
- Process ID: `terminal:manager`
- Priority: MEDIUM
- Interval: 20 ticks
- CPU Budget: 0.1

### 5. Factory Automation

**Implementation**: `src/economy/factoryManager.ts`

#### FactoryManager
Automated commodity production for factories (RCL 7+).

**Supported Commodities** (Level 0):
- `battery`: Pure energy compression (600 energy → battery)
- `utrium_bar`, `lemergium_bar`, `zynthium_bar`, `keanium_bar`: 500 mineral + 200 energy
- `ghodium_melt`: 500 ghodium + 200 energy
- `oxidant`: 500 oxygen + 200 energy
- `reductant`: 500 hydrogen + 200 energy
- `purifier`: 500 catalyst + 200 energy

**Production Logic**:
- Priority scoring based on:
  - Commodity priority (battery = 10, bars = 5, etc.)
  - Input availability in storage
  - Output saturation (stop at 5000 units)
- Automatic input buffer management (2000 units)
- Checks storage energy threshold (80,000 minimum)

**Configuration**:
```typescript
{
  minBucket: 2500,
  minStorageEnergy: 80000,
  inputBufferAmount: 2000,
  outputBufferAmount: 5000
}
```

**Integration**:
- Factory workers supply inputs
- Factory workers remove outputs to storage
- Uses `factoryManager.getRequiredInputs()` for worker logic

**Process Info**:
- Process ID: `factory:manager`
- Priority: LOW
- Interval: 30 ticks
- CPU Budget: 0.05

### 6. Mineral Mining Coordination

**Implementation**: `src/roles/behaviors/economy.ts` (mineralHarvester)

#### Mineral Harvesters
- Harvest from extractors (RCL 6+)
- Container mining support (like energy harvesters)
- Automatic idle near storage when mineral depleted
- Transfer to terminal or storage

**Body Composition**: Multiple WORK parts + CARRY + MOVE

**Features**:
- Supports all mineral types (U, L, K, Z, O, H, X, G)
- Checks mineral availability before harvesting
- Coordinates with haulers via containers
- Waits near storage during regeneration

### 7. Upgraders & Builders

**Implementation**: `src/roles/behaviors/economy.ts`

#### Upgraders
Energy collection priority:
1. **Links near controller** (within range 2) - Most efficient
2. **Containers near upgrader** (within range 3)
3. **Storage** (if > 1000 energy)
4. **Any container**
5. **Direct harvest** (last resort)

**Optimizations**:
- 30-tick cache for energy sources
- Stationary positioning for idle detection
- Synergy with LinkManager

#### Builders
- Build construction sites
- Repair ramparts and walls
- Dynamic repair targets based on danger level
- Cache-optimized target finding

### 8. QueenCarrier

**Implementation**: `src/roles/behaviors/economy.ts`

Specialized distributor for spawn structures:
- High-priority energy delivery to spawns and extensions
- Waits near storage when idle
- Quick response to spawn needs

## Integration with Kernel

All economy managers use the kernel process system:

```typescript
// Process registration in src/core/processRegistry.ts
registerAllDecoratedProcesses(
  terminalManager,
  factoryManager,
  linkManager,
  // ... other managers
);
```

Each manager uses `@ProcessClass()` and `@MediumFrequencyProcess()` decorators for automatic registration.

## CPU Budget Management

Economy processes respect CPU budgets:
- **LinkManager**: 0.05 CPU budget, 5 tick interval
- **TerminalManager**: 0.1 CPU budget, 20 tick interval
- **FactoryManager**: 0.05 CPU budget, 30 tick interval

All check `Game.cpu.bucket` before running to prevent bucket depletion.

## Memory Usage

Economy system uses minimal memory:
- Source assignments cached in creep memory
- Link roles calculated on-demand
- Transfer queues in manager instances (not persisted)
- Container/link IDs cached with TTL

## Performance Characteristics

### CPU Usage (per room per tick average)
- Link management: ~0.02 CPU
- Terminal operations: ~0.05 CPU (only every 20 ticks)
- Factory operations: ~0.02 CPU (only every 30 ticks)
- Harvester roles: ~0.1 CPU per creep
- Hauler roles: ~0.15 CPU per creep

### Energy Efficiency
- Static mining: 100% source utilization (10 energy/tick)
- Link transfers: 3% energy loss
- Terminal transfers: Variable cost based on distance
- Factory production: Net positive with commodities

## Future Enhancements

Potential improvements aligned with ROADMAP.md:
1. **Advanced Factory**: Higher-level commodities (L1, L2, L3)
2. **Market Integration**: Automated trading for economy optimization
3. **Power Processing**: Power Spawn automation
4. **Deposit Harvesting**: Highway deposit automation
5. **Lab-Factory Integration**: Compound production for factories

## Troubleshooting

### Links not transferring
- Check RCL >= 5
- Verify links within 2 tiles of sources/controller/storage
- Ensure CPU bucket > 2000
- Check link cooldowns

### Terminal not balancing
- Verify RCL >= 6
- Check storage energy > 50,000
- Ensure transfer cost ratio < 10%
- Verify CPU bucket > 2000

### Factory not producing
- Check RCL >= 7
- Verify storage energy > 80,000
- Ensure sufficient input minerals
- Check factory cooldown
- Verify CPU bucket > 2500

### Remote mining issues
- Check for hostiles in remote rooms
- Verify reservation on remote rooms
- Ensure haulers have sufficient capacity
- Check path distance and safety

## Summary

The economy system provides a complete, automated resource management solution for Screeps:
- ✅ Static harvesting with container mining
- ✅ Basic and remote hauling
- ✅ Storage management
- ✅ Builder/upgrader roles
- ✅ Link balancing automation
- ✅ Terminal automation
- ✅ Factory automation
- ✅ Mineral mining coordination

All systems are CPU-efficient, follow the swarm architecture principles, and integrate seamlessly with the kernel process management system.
