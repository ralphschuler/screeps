# Power System Documentation

This document describes the comprehensive power system implementation, including GPL progression, power creep management, and power bank harvesting.

## Overview

The power system manages three main aspects:
1. **GPL (Global Power Level) Progression**: Tracking and strategically increasing GPL through power processing
2. **Power Creep Management**: Lifecycle management of Power Creeps (Operators)
3. **Power Bank Harvesting**: Coordinated operations to harvest power from power banks in highway rooms

## Architecture

### PowerCreepManager (`src/empire/powerCreepManager.ts`)

Central manager for GPL progression and Power Creep coordination.

**Key Responsibilities:**
- GPL tracking and milestone progression
- Power processing recommendations across rooms
- Power Creep spawning and assignment
- Eco vs combat operator coordination (70% eco, 30% combat)
- Power Creep respawn management

**Configuration:**
```typescript
{
  minGPL: 1,                    // Minimum GPL to create first power creep
  minPowerReserve: 10000,       // Target power in storage before focusing on GPL
  energyPerPower: 50,           // Energy cost per power processed
  minEnergyReserve: 100000,     // Minimum energy reserve before processing
  gplMilestones: [1, 2, 5, 10, 15, 20]  // GPL targets
}
```

### PowerBankHarvestingManager (`src/empire/powerBankHarvesting.ts`)

Manages power bank discovery and harvesting operations.

**Operation States:**
1. **Scouting**: Power bank discovered, waiting for creeps
2. **Attacking**: Creeps attacking power bank
3. **Collecting**: Power bank destroyed, collecting power
4. **Complete/Failed**: Operation finished

**Key Features:**
- Automatic power bank discovery in highway rooms
- Profitability calculation
- Squad coordination (attackers + healers)
- Power transport logistics

### Power Creep Roles

#### PowerQueen (Economy Operator)
**Priority-based power usage:**
1. Generate Ops (critical < 20 ops)
2. Boost Spawn (100 ops = 3x speed, 1000 ticks)
3. Fill Extensions (2 ops = instant fill)
4. Boost Towers (10 ops = 2x effectiveness)
5. Boost Labs (10 ops = 2x reaction speed)
6. Boost Factory (100 ops = instant production)
7. Boost Storage (100 ops = 2x capacity)
8. Regen Source (100 ops = instant regen)
9. Generate Ops (optimal level < 100 ops)

**Assignment Strategy:**
- Assigned to highest RCL room (RCL 7+)
- Prioritizes rooms with most structures
- Stays near storage for efficiency

#### PowerWarrior (Combat Operator)
**Priority-based power usage:**
1. Generate Ops (critical < 20 ops)
2. Shield Allies (10 ops = 5k HP shield)
3. Disrupt Enemy Spawns (10 ops = pause spawning)
4. Disrupt Enemy Towers (10 ops = disable tower)
5. Boost Friendly Towers (10 ops = 2x effectiveness)
6. Fortify Critical Ramparts (5 ops = instant boost)
7. Disrupt Enemy Terminals (50 ops = disable terminal)
8. Generate Ops (optimal level < 100 ops)

**Assignment Strategy:**
- Assigned to room with highest danger level
- Prioritizes rooms under active threat
- Positions near hostiles for quick response

### Power Bank Harvesting

#### Creep Roles

**PowerHarvester:**
- Body: 20-25 ATTACK parts + 5-10 TOUGH + matching MOVE
- Cost: 2300-3000 energy
- Behavior: Attacks power bank, retreats when < 50% HP to healer
- Note: Power banks reflect 50% damage

**Healer (Power Bank Support):**
- Standard healer body
- Behavior: Follows and heals power harvesters
- Stays within range 3 of power bank
- Returns home when operation complete

**PowerCarrier:**
- Body: 20-25 CARRY + matching MOVE
- Cost: 2000-2500 energy
- Behavior: Collects dropped power and ruins, delivers to power spawn or storage

#### Operation Coordination

**Profitability Calculation:**
```typescript
Power Value = power * 10 (market-dependent)
Energy Cost = creep costs + operation duration
Net Profit = Power Value - Energy Cost
Profitability Threshold = Net Profit > 0
```

**Spawn Requests:**
- Requested automatically by PowerBankHarvestingManager
- Integrated with spawn queue system
- Priority: NORMAL (medium priority)
- Spawned from nearest owned room (RCL 7+)

## GPL Progression Strategy

### Milestones
- GPL 1: First power creep available
- GPL 2: Second power creep, refine strategies
- GPL 5: Significant power creep force
- GPL 10: Mid-game milestone, combat ops viable
- GPL 15: Advanced operations
- GPL 20: Elite power creep force

### Power Processing Priority

**High Priority (Process Immediately):**
- Pushing towards GPL milestone
- Excess power (> minPowerReserve)
- Sufficient energy reserves (> minEnergyReserve)

**Low Priority (Hold Power):**
- Power reserved for power bank operations
- Low energy reserves
- Already at target milestone

**Processing Rate:**
- 1 power processed per tick (with sufficient energy)
- Costs 50 energy per power processed
- Typical GPL progression: ~10-20 ticks per GPL level at early levels

## Integration Points

### Process Registry
PowerCreepManager registered as low-frequency process:
- Interval: 20 ticks
- Priority: LOW
- Minimum bucket: 6000
- CPU budget: 0.03

### Spawn System
Power bank creeps integrated with spawn coordinator:
- Spawn requests generated by PowerBankHarvestingManager
- Body optimization using standard optimizer
- Assigned targetRoom in memory for navigation

### Behavior System
Power behaviors integrated with role system:
- Power creeps use state machine for committed actions
- Regular creeps (powerHarvester, powerCarrier) use standard behavior evaluation
- Healers support both defense and power bank operations

## Usage Examples

### Creating Power Creeps
```typescript
// Automatic creation when GPL allows
// PowerCreepManager.considerNewPowerCreeps() called every tick
// Creates operators based on 70% eco / 30% combat ratio
```

### Assigning Power Creeps
```typescript
// Automatic assignment to best room
// PowerQueen -> highest RCL with most structures
// PowerWarrior -> highest danger level
```

### Manual Reassignment
```typescript
powerCreepManager.reassignPowerCreep("operator_12345", "E1S1");
```

### Checking GPL State
```typescript
const gplState = powerCreepManager.getGPLState();
console.log(`GPL ${gplState.currentLevel}, Progress: ${gplState.currentProgress}/${gplState.progressNeeded}`);
console.log(`Estimated ticks to next: ${gplState.ticksToNextLevel}`);
```

### Power Bank Operations
```typescript
// Automatic discovery and operations
// PowerBankHarvestingManager scans highway rooms
// Evaluates opportunities based on:
// - Power amount (> 1000 minimum)
// - Distance (< 5 rooms)
// - Time remaining (> 3000 ticks)
// - Profitability calculation
```

## Performance Considerations

### CPU Usage
- PowerCreepManager: ~0.03 CPU per 20 ticks
- PowerBankHarvestingManager: ~0.02 CPU per 50 ticks
- Power Creep behaviors: ~0.01 CPU per creep per tick

### Memory Usage
- GPL state: ~200 bytes
- Power creep assignments: ~100 bytes per power creep
- Power bank operations: ~500 bytes per operation

### Scalability
- Supports unlimited power creeps (limited by GPL)
- Supports multiple concurrent power bank operations (default: 2)
- Efficient power processing recommendations (evaluates all rooms)

## Troubleshooting

### Power Creeps Not Spawning
- Check GPL level (need GPL 1+)
- Verify power spawn exists in room
- Check if at max power creeps for GPL level

### Power Bank Operations Not Starting
- Check bucket level (need > 7000)
- Verify at least one RCL 7+ room
- Check power bank distance (must be < 5 rooms)
- Verify profitability (power amount > 1000)

### GPL Not Progressing
- Check power reserves in storage/terminal
- Verify energy reserves (need > 100k)
- Check if power spawn is processing
- Verify power spawn has power and energy

## Roadmap Compliance

This implementation addresses ROADMAP Section 14: Power Creeps (Endgame-Einheiten)

**Implemented Features:**
✅ GPL tracking and progression strategy
✅ Power Creep lifecycle management (spawn, respawn, renewal)
✅ Operator power utilization (economy and combat)
✅ Eco vs combat operator coordination
✅ Power bank discovery and profitability
✅ Power bank harvesting with squad coordination
✅ Power processing prioritization
✅ Automatic power creep creation and assignment

**Coverage: ~90% of Section 14 requirements**

## Future Enhancements

1. **Boost Integration**: Power creeps boosting military operations
2. **Multi-Shard Coordination**: Cross-shard power creep deployment
3. **Dynamic Role Switching**: Power creeps changing roles based on needs
4. **Advanced Profitability**: Market integration for power value estimation
5. **Power Creep Skill Trees**: Optimized power selections per level
6. **Power Bank Squads**: Coordinated multi-room attacks on high-value targets
