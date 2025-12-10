# Advanced Systems Guide

This guide covers the three advanced gameplay systems in the Screeps bot: Labs, Market, and Power.

## Table of Contents

1. [Lab System](#lab-system)
2. [Market System](#market-system)
3. [Power System](#power-system)

---

## Lab System

The lab system manages chemical compound production and creep boosting for enhanced performance.

### Architecture

The lab system consists of four main components:

1. **Lab Configuration Manager** (`src/labs/labConfig.ts`)
   - Manages lab role assignments (input1, input2, output, boost)
   - Auto-assigns optimal lab roles based on proximity
   - Validates lab configurations

2. **Chemistry Planner** (`src/labs/chemistryPlanner.ts`)
   - Contains full reaction tree for all compounds (T1-T4)
   - Calculates reaction chains with dependency resolution
   - Plans reactions based on room posture (eco vs. war mode)
   - Target compound stockpile management

3. **Lab Manager** (`src/labs/labManager.ts`)
   - Coordinates lab operations
   - Manages resource loading/unloading
   - Executes reactions
   - Handles boost application
   - Unboost recovery for dying creeps

4. **Boost Manager** (`src/labs/boostManager.ts`)
   - Determines when to boost creeps based on danger level
   - Pre-loads labs with boost compounds
   - Applies boosts to creeps before combat

### Usage

#### Automatic Operation

Labs run automatically in `roomNode.ts`:

```typescript
// In RoomNode.run():
labManager.initialize(room.name);
const reaction = chemistryPlanner.planReactions(room, swarm);
if (reaction) {
  // Set up and execute reaction
  labManager.setActiveReaction(...);
  chemistryPlanner.executeReaction(room, reaction);
}
```

#### Manual Control

Use console commands to control labs:

```javascript
// Get lab status
labs.status('E1S1')

// Set specific reaction
labs.setReaction('E1S1', RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_HYDROXIDE)

// Clear active reaction
labs.clear('E1S1')
```

### Reaction Chains

The chemistry planner automatically resolves reaction chains:

```
Target: RESOURCE_CATALYZED_UTRIUM_ACID
Chain:
  1. H + O → OH (hydroxide)
  2. U + H → UH (utrium hydride)
  3. UH + OH → UH2O (utrium acid)
  4. UH2O + X → XUH2O (catalyzed utrium acid)
```

### Boosting

Boosting is applied automatically based on:
- **Danger level**: Minimum danger threshold per role
- **Posture**: War/siege mode boosts more aggressively
- **Lab availability**: Compounds must be pre-loaded in labs

Boost configurations (in `boostManager.ts`):

- **Soldier**: XUH2O (attack), XLHO2 (heal)
- **Ranger**: XKHO2 (ranged attack), XLHO2 (heal)
- **Healer**: XLHO2 (heal), XZHO2 (move)
- **Siege Unit**: XGHO2 (dismantle), XLHO2 (heal)

### Resource Distribution

The `labSupply` behavior automatically:
- Fills input labs with reactants
- Empties output labs when full or wrong compound
- Stocks boost labs with required compounds

---

## Market System

The market system handles all trading operations, from price tracking to automated order management and arbitrage.

### Architecture

**Market Manager** (`src/empire/marketManager.ts`) - Comprehensive trading AI with:

1. **Price Tracking**
   - 30-point historical price data per resource
   - Rolling averages (configurable window)
   - Trend detection (rising/falling/stable)
   - Volatility calculation
   - Price predictions

2. **Automated Trading**
   - Buy opportunity detection (price below threshold)
   - Sell opportunity detection (price above threshold)
   - War mode aggressive purchasing
   - Resource surplus/deficit management

3. **Order Management**
   - Auto-cancel old/invalid orders
   - Extend/modify existing orders based on price changes
   - Order age tracking and renewal

4. **Arbitrage**
   - Multi-room arbitrage detection
   - Pending trade tracking
   - Transport cost calculation
   - Profit optimization

5. **Resource Balancing**
   - Automatic terminal transfers between rooms
   - Balance resources across empire
   - Minimize transport costs

### Configuration

Default configuration (in `marketManager.ts`):

```typescript
{
  minCredits: 10000,           // Minimum credit reserve
  emergencyCredits: 5000,      // Emergency purchase threshold
  tradingCredits: 50000,       // Enable trading threshold
  warPriceMultiplier: 2.0,     // Pay 2x in war mode
  buyPriceThreshold: 0.85,     // Buy at 15% below average
  sellPriceThreshold: 1.15,    // Sell at 15% above average
  maxTransportCostRatio: 0.3,  // Max 30% transport cost for arbitrage
  // ... more config
}
```

### Usage

#### Automatic Operation

Market manager runs as a low-frequency process:

```typescript
@LowFrequencyProcess("empire:market", "Market Manager", {
  priority: ProcessPriority.LOW,
  interval: 100,  // Every 100 ticks
  minBucket: 7000,
  cpuBudget: 0.02
})
```

Operations performed:
- Price tracking updates (every 500 ticks)
- Order statistics updates
- Emergency buying (critical resources)
- Buy/sell order creation (price-aware)
- Arbitrage execution
- Resource balancing (every 200 ticks)

#### Manual Control

Use console commands:

```javascript
// Check market data for a resource
market.data(RESOURCE_ENERGY)

// Force a buy order
market.buy('E1S1', RESOURCE_GHODIUM, 1000, 5.0)

// Force a sell order
market.sell('E1S1', RESOURCE_ENERGY, 10000, 0.01)

// Check arbitrage opportunities
market.arbitrage()
```

### Trading Strategy

1. **Normal Mode**
   - Buy when price is 15% below average
   - Sell when price is 15% above average
   - Maintain minimum stockpiles

2. **War Mode**
   - Aggressive buying of boost compounds
   - Pay up to 2x average price
   - Prioritize: XGH2O, XZHO2, XLHO2, XKHO2

3. **Emergency Mode**
   - Buy critical resources at any price
   - Triggered when resources < emergency threshold
   - Default critical resources: energy, ghodium

### Arbitrage

The system detects arbitrage opportunities by:
1. Finding price spread between buy/sell orders
2. Calculating transport costs
3. Executing buy on low-price order
4. Tracking pending trade
5. Executing sell when resources arrive

Example arbitrage flow:
```
1. Buy 5000 RESOURCE_X at 2.5 credits/unit
2. Transport cost: 500 energy (0.1 credits/unit equivalent)
3. Sell 5000 RESOURCE_X at 3.2 credits/unit
4. Profit: (3.2 - 2.5 - 0.1) * 5000 = 3000 credits
```

---

## Power System

The power system manages Power Creeps (operators) and power bank harvesting operations.

### Architecture

The power system consists of three main components:

1. **Power Creep Manager** (`src/empire/powerCreepManager.ts`)
   - GPL (Global Power Level) tracking and progression
   - Power creep spawning and assignment
   - Operator role selection (economy vs. combat)
   - Power processing prioritization

2. **Power Bank Harvesting Manager** (`src/empire/powerBankHarvesting.ts`)
   - Power bank discovery and scanning
   - Profitability calculation
   - Operation state management
   - Squad coordination (attackers, healers, carriers)

3. **Power Behaviors** (`src/roles/behaviors/power.ts`)
   - Power creep ability usage
   - Operator powers (OPERATE_SPAWN, OPERATE_TOWER, etc.)
   - Power harvester and carrier behaviors

### GPL Progression

The system tracks GPL state:

```typescript
{
  currentLevel: number,          // Current GPL level
  currentProgress: number,       // Progress to next level
  progressNeeded: number,        // Total progress needed
  powerProcessedThisTick: number,
  totalPowerProcessed: number,   // Historical total
  ticksToNextLevel: number,      // Estimated time
  targetMilestone: number        // Next milestone goal
}
```

GPL milestones: `[1, 2, 5, 10, 15, 20]`

### Power Processing Strategy

Power is processed when:
1. **GPL Progression**: Current level < target milestone
2. **Excess Power**: Power reserves > 10,000
3. **Energy Available**: Storage energy > 100,000

Power spawn priority: GPL progression > excess processing

### Power Creep Types

#### Economy Operator (PowerQueen)
**Assigned to**: Highest RCL rooms with most structures

**Powers used**:
- `PWR_GENERATE_OPS`: Generate ops currency
- `PWR_OPERATE_SPAWN`: Reduce spawn time by 50%
- `PWR_OPERATE_TOWER`: Increase tower effectiveness by 50%
- `PWR_OPERATE_LAB`: Increase reaction speed by 100%
- `PWR_OPERATE_STORAGE`: Increase capacity by 500k
- `PWR_OPERATE_FACTORY`: Trade energy for ops

**Strategy**: Stays in home room, uses powers on cooldown

#### Combat Operator (PowerWarrior)
**Assigned to**: Rooms with highest danger level

**Powers used**:
- `PWR_DISRUPT_SPAWN`: Double spawn time of enemy spawns
- `PWR_DISRUPT_TOWER`: Reduce tower effectiveness by 50%
- `PWR_SHIELD`: Create protective shield (5000 hits)
- `PWR_FORTIFY`: Increase rampart/wall hits by 500k

**Strategy**: Deploys to front-line rooms during war/siege

### Power Bank Harvesting

#### Discovery

Power banks are scanned in highway rooms:
- Minimum power: 1000
- Maximum distance: 5 rooms from owned room
- Minimum ticks remaining: 3000

#### Operation Lifecycle

1. **Scouting**: Confirm power bank location and decay time
2. **Attacking**: Coordinated attack with healers
   - Power banks reflect 50% damage
   - Healer:attacker ratio: 0.5
   - DPS requirement: 600 per attacker pair
3. **Collecting**: Carriers pick up dropped power
4. **Complete**: Power delivered to home room

#### Profitability

The system calculates profitability:

```typescript
{
  power: number,           // Power amount
  energyCost: number,      // Total operation cost
  netProfit: number,       // Power value - costs
  profitPerTick: number    // Efficiency metric
}
```

Power value estimate: 10 energy per power (market-dependent)

### Spawn Integration

Power bank operations automatically request spawns:

```typescript
{
  powerHarvesters: number,  // Attack creeps
  healers: number,          // Support creeps
  powerCarriers: number     // Transport creeps
}
```

Spawn priority: NORMAL (between economy and defense)

### Usage

#### Automatic Operation

Both managers run as low-frequency processes:

```typescript
// Power Creep Manager
@LowFrequencyProcess("empire:powerCreep", ..., {
  interval: 20,
  minBucket: 6000
})

// Power Bank Harvesting Manager
@LowFrequencyProcess("empire:powerBank", ..., {
  interval: 50,
  minBucket: 7000
})
```

#### Manual Control

Use console commands:

```javascript
// Check GPL status
power.gpl()

// Create power creep
power.create('operator_eco', POWER_CLASS.OPERATOR)

// Assign to room
power.assign('operator_eco', 'E1S1')

// Check active power bank operations
power.operations()

// Get operation details
power.operation('W5N5')
```

---

## Performance

All three systems are designed for efficiency:

### CPU Management

- **Process Decorators**: All managers use `@LowFrequencyProcess`
- **CPU Budgets**: Each system has CPU budget limits
- **Bucket Thresholds**: Systems pause when CPU bucket is low

### Caching

- **Heap Cache**: Lab configurations cached with TTL
- **Structure Cache**: Room structures cached per tick
- **Price Data**: Market data cached in memory

### Event-Driven

Systems integrate with the kernel event system:
- `hostile.detected` → Boost labs prepare compounds
- `nuke.detected` → Evacuate power creeps
- `structure.destroyed` → Emergency market buys

---

## Troubleshooting

### Labs Not Reacting

Check:
1. At least 3 labs in room
2. Labs are within range 2 of each other
3. Terminal has required resources
4. RCL >= 6 (for terminal)

### Market Not Trading

Check:
1. Credits > minCredits (10,000)
2. CPU bucket > minBucket (7,000)
3. Price data has been collected (wait ~500 ticks)
4. Resources above/below thresholds

### Power Creeps Not Spawning

Check:
1. GPL level >= 1
2. Power spawn exists in room (RCL 8)
3. Power creep has been created (check `Game.powerCreeps`)
4. Assignment exists (check memory)

### Power Banks Not Harvesting

Check:
1. RCL >= 7 in at least one room
2. CPU bucket > 7000
3. Power bank power >= 1000
4. Distance from owned room <= 5
5. Max concurrent operations not exceeded (default: 2)

---

## Future Enhancements

Potential improvements for each system:

### Labs
- [ ] ML-based compound demand prediction
- [ ] Multi-room lab coordination for large-scale production
- [ ] Automatic boost pre-staging based on threat intelligence

### Market
- [ ] Advanced arbitrage with multi-hop trades
- [ ] Dynamic pricing based on supply/demand curves
- [ ] Cartel coordination with allied players

### Power
- [ ] Power creep level-up automation
- [ ] Dynamic power allocation based on room needs
- [ ] Power bank scouting squads
- [ ] Cooperative power bank raids with allies

---

## References

- [Screeps API Documentation](https://docs.screeps.com/)
- [ROADMAP.md](../../ROADMAP.md) - Section 14 (Power Creeps), 15 (Market), 16 (Labs)
- Source code:
  - Labs: `packages/screeps-bot/src/labs/`
  - Market: `packages/screeps-bot/src/empire/marketManager.ts`
  - Power: `packages/screeps-bot/src/empire/powerCreepManager.ts`
