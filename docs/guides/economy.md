# Economy Systems Developer Guide

## Overview

The Economy System manages all resource-related operations including harvesting, hauling, storage management, link balancing, terminal transfers, factory production, and mineral mining. This guide consolidates information from docs/ECONOMY_SYSTEM.md.

**Key Principles (ROADMAP.md):**
- **Decentralization**: Each room manages its own economy
- **CPU Efficiency**: Processes run at appropriate frequencies
- **Event-driven**: Critical events trigger immediate updates
- **Pheromone-based**: Economy decisions influenced by pheromone levels

## Table of Contents

1. [Architecture](#architecture)
2. [Static Harvesting & Hauling](#static-harvesting--hauling)
3. [Remote Mining](#remote-mining)
4. [Link Balancing](#link-balancing)
5. [Terminal Routing](#terminal-routing)
6. [Factory Automation](#factory-automation)
7. [Market Trading](#market-trading)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Economy System                        │
└─────────────────────────────────────────────────────────┘
           │
           ├── Harvesting ────► Static Miners at Sources
           │                    Container Mining
           │                    Link Support (RCL 5+)
           │
           ├── Hauling ───────► Carriers Transport Energy
           │                    Priority Delivery System
           │                    Cached Target Finding
           │
           ├── Remote Mining ─► Remote Harvesters
           │                    Remote Haulers
           │                    Safety Features
           │
           ├── Links ─────────► Source Links
           │                    Controller Links
           │                    Storage Links
           │                    Auto-Balancing
           │
           ├── Terminal ──────► Inter-Room Transfer
           │                    Resource Routing
           │                    Automated Balance
           │
           ├── Factory ───────► Automated Production
           │                    Component Management
           │                    Recipe Selection
           │
           └── Market ────────► Buy Orders
                                Sell Orders
                                Price Analysis
```

### Core Components

1. **Harvesters** - Static miners at sources
2. **Haulers** - Energy transport
3. **Remote Miners** - Remote room harvesting
4. **Link Manager** - Automated link balancing
5. **Terminal Manager** - Inter-room transfers
6. **Factory Manager** - Automated production
7. **Market Manager** - Trading operations

---

## Static Harvesting & Hauling

### Harvesters (Static Miners)

**Purpose**: Harvest energy from sources continuously

**Body Composition**:
```typescript
// Early game (RCL 1-2)
[WORK, WORK, MOVE, CARRY]

// Mid game (RCL 3-4)  
[WORK, WORK, WORK, WORK, MOVE, CARRY]

// Late game (RCL 5-8)
[WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, CARRY]
```

**Key Features**:
- Stay at source permanently
- Transfer to nearby container or link
- Fall back to dropping energy
- Automatic source assignment

**Behavior**:
```typescript
export function harvesterBehavior(ctx: BehaviorContext): BehaviorAction {
  const creep = ctx.creep;
  
  // Find assigned source
  if (!creep.memory.sourceId) {
    creep.memory.sourceId = assignSource(ctx.room, creep);
  }
  
  const source = Game.getObjectById(creep.memory.sourceId);
  if (!source) {
    delete creep.memory.sourceId;
    return { type: "idle" };
  }
  
  // Move to source if not there
  if (!creep.pos.isNearTo(source)) {
    return { type: "moveTo", target: source };
  }
  
  // Harvest
  if (creep.store.getFreeCapacity() > 0) {
    return { type: "harvest", target: source };
  }
  
  // Transfer to container
  const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: s => s.structureType === STRUCTURE_CONTAINER
  })[0];
  
  if (container) {
    return { type: "transfer", target: container, resourceType: RESOURCE_ENERGY };
  }
  
  // Transfer to link
  const link = source.pos.findInRange(FIND_MY_STRUCTURES, 2, {
    filter: s => s.structureType === STRUCTURE_LINK
  })[0];
  
  if (link) {
    return { type: "transfer", target: link, resourceType: RESOURCE_ENERGY };
  }
  
  // Fall back to dropping
  return { type: "drop", resourceType: RESOURCE_ENERGY };
}
```

### Haulers (Carriers)

**Purpose**: Transport energy from sources to consumers

**Body Composition**:
```typescript
// Early game
[CARRY, CARRY, MOVE]

// Mid game
[CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]

// Late game (with roads)
[CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
```

**Priority Delivery**:
1. Spawns & Extensions
2. Towers (< 500 energy)
3. Storage
4. Containers

**Behavior**:
```typescript
export function haulerBehavior(ctx: BehaviorContext): BehaviorAction {
  const creep = ctx.creep;
  const memory = creep.memory as HaulerMemory;
  
  // State management
  if (!memory.working && ctx.isFull) {
    memory.working = true;
  }
  if (memory.working && ctx.isEmpty) {
    memory.working = false;
  }
  
  // Delivering
  if (memory.working) {
    // Priority 1: Spawns/Extensions
    const spawnTargets = ctx.spawnStructures.filter(s =>
      s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
    if (spawnTargets.length > 0) {
      const closest = ctx.findClosest(spawnTargets);
      return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }
    
    // Priority 2: Towers
    const towers = ctx.defenseStructures
      .filter(s => s.structureType === STRUCTURE_TOWER)
      .filter(s => s.store.getUsedCapacity(RESOURCE_ENERGY) < 500);
    if (towers.length > 0) {
      const closest = ctx.findClosest(towers);
      return { type: "transfer", target: closest, resourceType: RESOURCE_ENERGY };
    }
    
    // Priority 3: Storage
    if (ctx.room.storage) {
      return { type: "transfer", target: ctx.room.storage, resourceType: RESOURCE_ENERGY };
    }
    
    return { type: "idle" };
  }
  
  // Collecting
  else {
    // Priority 1: Dropped resources (> 50)
    const largeDropped = ctx.droppedResources.filter(r =>
      r.resourceType === RESOURCE_ENERGY && r.amount > 50
    );
    if (largeDropped.length > 0) {
      const closest = ctx.findClosest(largeDropped);
      return { type: "pickup", target: closest };
    }
    
    // Priority 2: Containers
    const containers = ctx.storageStructures
      .filter(s => s.structureType === STRUCTURE_CONTAINER)
      .filter(s => s.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
    if (containers.length > 0) {
      const closest = ctx.findClosest(containers);
      return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
    }
    
    // Priority 3: Storage (if surplus)
    if (ctx.room.storage && ctx.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 10000) {
      return { type: "withdraw", target: ctx.room.storage, resourceType: RESOURCE_ENERGY };
    }
    
    return { type: "idle" };
  }
}
```

**Optimizations**:
- Cached target finding (5-15 tick cache)
- Energy threshold checks (justify travel costs)
- Priority-based delivery system

---

## Remote Mining

### Remote Harvesters

**Purpose**: Harvest sources in remote rooms

**Safety Features**:
- Hostile detection within 5 tiles
- Automatic flee behavior
- Return home when threatened

**Configuration**:
```typescript
interface RemoteHarvesterMemory extends CreepMemory {
  targetRoom: string;
  homeRoom: string;
  sourceId?: Id<Source>;
}
```

**Behavior**:
```typescript
export function remoteHarvesterBehavior(ctx: BehaviorContext): BehaviorAction {
  const creep = ctx.creep;
  const memory = creep.memory as RemoteHarvesterMemory;
  
  // Safety: Check for hostiles
  if (ctx.nearbyEnemies) {
    const dangerousHostiles = ctx.hostiles.filter(h =>
      creep.pos.getRangeTo(h) <= 5 &&
      (h.getActiveBodyparts(ATTACK) > 0 || h.getActiveBodyparts(RANGED_ATTACK) > 0)
    );
    
    if (dangerousHostiles.length > 0) {
      // Flee to home room
      if (creep.room.name !== memory.homeRoom) {
        return { type: "moveToRoom", roomName: memory.homeRoom };
      }
      return { type: "flee", from: dangerousHostiles.map(h => h.pos) };
    }
  }
  
  // Move to target room
  if (creep.room.name !== memory.targetRoom) {
    return { type: "moveToRoom", roomName: memory.targetRoom };
  }
  
  // Find source
  if (!memory.sourceId) {
    const sources = creep.room.find(FIND_SOURCES);
    if (sources.length > 0) {
      memory.sourceId = sources[0].id;
    }
  }
  
  const source = Game.getObjectById(memory.sourceId);
  if (!source) {
    delete memory.sourceId;
    return { type: "idle" };
  }
  
  // Harvest
  if (creep.store.getFreeCapacity() > 0) {
    return { type: "harvest", target: source };
  }
  
  // Transfer to container
  const container = source.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: s => s.structureType === STRUCTURE_CONTAINER
  })[0];
  
  if (container) {
    return { type: "transfer", target: container, resourceType: RESOURCE_ENERGY };
  }
  
  // Drop energy
  return { type: "drop", resourceType: RESOURCE_ENERGY };
}
```

### Remote Haulers

**Purpose**: Transport energy from remote rooms to home

**Energy Collection Threshold**: 30% of capacity

**Behavior**:
```typescript
export function remoteHaulerBehavior(ctx: BehaviorContext): BehaviorAction {
  const creep = ctx.creep;
  const memory = creep.memory as RemoteHaulerMemory;
  
  const REMOTE_HAULER_ENERGY_THRESHOLD = 0.3;
  
  // Safety: Flee if threatened
  if (ctx.nearbyEnemies) {
    const dangerousHostiles = ctx.hostiles.filter(h =>
      creep.pos.getRangeTo(h) <= 5
    );
    
    if (dangerousHostiles.length > 0) {
      // If carrying cargo, prioritize returning home
      if (creep.store.getUsedCapacity() > 0 && creep.room.name !== memory.homeRoom) {
        return { type: "moveToRoom", roomName: memory.homeRoom };
      }
      return { type: "flee", from: dangerousHostiles.map(h => h.pos) };
    }
  }
  
  // State management
  if (!memory.working && ctx.isFull) {
    memory.working = true;
  }
  if (memory.working && ctx.isEmpty) {
    memory.working = false;
  }
  
  // Delivering to home room
  if (memory.working) {
    // Move to home room
    if (creep.room.name !== memory.homeRoom) {
      return { type: "moveToRoom", roomName: memory.homeRoom };
    }
    
    // Deliver to storage
    if (ctx.room.storage) {
      return { type: "transfer", target: ctx.room.storage, resourceType: RESOURCE_ENERGY };
    }
    
    return { type: "idle" };
  }
  
  // Collecting from target room
  else {
    // Move to target room
    if (creep.room.name !== memory.targetRoom) {
      return { type: "moveToRoom", roomName: memory.targetRoom };
    }
    
    // Collect from containers (only if sufficient energy)
    const minEnergyThreshold = creep.store.getCapacity(RESOURCE_ENERGY) * REMOTE_HAULER_ENERGY_THRESHOLD;
    
    const containers = creep.room.find(FIND_STRUCTURES, {
      filter: s => 
        s.structureType === STRUCTURE_CONTAINER &&
        s.store.getUsedCapacity(RESOURCE_ENERGY) >= minEnergyThreshold
    });
    
    if (containers.length > 0) {
      const closest = ctx.findClosest(containers);
      return { type: "withdraw", target: closest, resourceType: RESOURCE_ENERGY };
    }
    
    // Collect dropped energy
    const dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > minEnergyThreshold
    });
    
    if (dropped.length > 0) {
      return { type: "pickup", target: dropped[0] };
    }
    
    // Wait for more energy
    return { type: "idle" };
  }
}
```

---

## Link Balancing

### LinkManager

File: `packages/screeps-economy/src/linkManager.ts`

**Features**:
- Automatic link classification
- Priority-based transfers
- Cooldown management

**Link Types**:
1. **Source Links**: Near sources (within 2 tiles)
2. **Controller Links**: Near controller (within 2 tiles)
3. **Storage Links**: Near storage (within 2 tiles)

**Transfer Logic**:
```typescript
@ProcessClass()
export class LinkManager {
  
  @Process({
    id: "link:manager",
    priority: ProcessPriority.MEDIUM,
    frequency: "medium", // Every 5 ticks
    cpuBudget: 0.03
  })
  public manageLinks(): void {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller || !room.controller.my) continue;
      
      this.balanceRoomLinks(room);
    }
  }
  
  private balanceRoomLinks(room: Room): void {
    const links = room.find(FIND_MY_STRUCTURES, {
      filter: s => s.structureType === STRUCTURE_LINK
    }) as StructureLink[];
    
    if (links.length === 0) return;
    
    // Classify links
    const sourceLinks: StructureLink[] = [];
    const controllerLinks: StructureLink[] = [];
    const storageLinks: StructureLink[] = [];
    
    for (const link of links) {
      // Source link?
      const nearbySource = link.pos.findInRange(FIND_SOURCES, 2)[0];
      if (nearbySource) {
        sourceLinks.push(link);
        continue;
      }
      
      // Controller link?
      if (room.controller && link.pos.getRangeTo(room.controller) <= 2) {
        controllerLinks.push(link);
        continue;
      }
      
      // Storage link?
      if (room.storage && link.pos.getRangeTo(room.storage) <= 2) {
        storageLinks.push(link);
      }
    }
    
    // Transfer from source links
    for (const sourceLink of sourceLinks) {
      if (sourceLink.store.getUsedCapacity(RESOURCE_ENERGY) < 400) continue;
      if (sourceLink.cooldown > 0) continue;
      
      // Priority 1: Controller link (if < 700 energy)
      const targetController = controllerLinks.find(l => 
        l.store.getUsedCapacity(RESOURCE_ENERGY) < 700
      );
      if (targetController) {
        sourceLink.transferEnergy(targetController);
        continue;
      }
      
      // Priority 2: Storage link (if < 100 energy)
      const targetStorage = storageLinks.find(l =>
        l.store.getUsedCapacity(RESOURCE_ENERGY) < 100
      );
      if (targetStorage) {
        sourceLink.transferEnergy(targetStorage);
      }
    }
  }
}
```

**Configuration**:
```typescript
const LINK_CONFIG = {
  minBucket: 2000,
  minSourceLinkEnergy: 400,
  controllerLinkMaxEnergy: 700,
  transferThreshold: 100,
  storageLinkReserve: 100
};
```

---

## Terminal Routing

### TerminalManager

File: `packages/screeps-economy/src/terminalManager.ts`

**Features**:
- Automated resource balancing
- Inter-room transfers
- Market integration

**Usage**:
```typescript
@ProcessClass()
export class TerminalManager {
  
  @Process({
    id: "terminal:manager",
    priority: ProcessPriority.MEDIUM,
    frequency: "medium",
    cpuBudget: 0.08
  })
  public manageTerminals(): void {
    const rooms = Object.values(Game.rooms).filter(r => r.terminal && r.controller?.my);
    
    for (const room of rooms) {
      this.balanceTerminal(room);
    }
  }
  
  private balanceTerminal(room: Room): void {
    const terminal = room.terminal;
    if (!terminal) return;
    
    // Check for excess resources
    for (const resourceType in terminal.store) {
      const amount = terminal.store[resourceType as ResourceConstant];
      const target = this.getTargetAmount(resourceType as ResourceConstant);
      
      if (amount > target * 1.5) {
        // Find room needing this resource
        const recipient = this.findRecipientRoom(resourceType as ResourceConstant);
        if (recipient) {
          const sendAmount = Math.min(amount - target, 1000);
          terminal.send(resourceType as ResourceConstant, sendAmount, recipient);
        }
      }
    }
  }
  
  private getTargetAmount(resourceType: ResourceConstant): number {
    switch (resourceType) {
      case RESOURCE_ENERGY: return 50000;
      case RESOURCE_HYDROGEN:
      case RESOURCE_OXYGEN:
      case RESOURCE_UTRIUM:
      case RESOURCE_LEMERGIUM:
      case RESOURCE_KEANIUM:
      case RESOURCE_ZYNTHIUM:
      case RESOURCE_CATALYST:
        return 3000;
      default:
        return 1000;
    }
  }
}
```

---

## Factory Automation

### FactoryManager

File: `packages/screeps-economy/src/factoryManager.ts`

**Features**:
- Automated component production
- Recipe selection
- Resource management

**Production Logic**:
```typescript
@ProcessClass()
export class FactoryManager {
  
  @Process({
    id: "factory:manager",
    priority: ProcessPriority.LOW,
    frequency: "low",
    cpuBudget: 0.05
  })
  public manageFactories(): void {
    const rooms = Object.values(Game.rooms).filter(r => r.factory && r.controller?.my);
    
    for (const room of rooms) {
      this.runFactory(room);
    }
  }
  
  private runFactory(room: Room): void {
    const factory = room.factory;
    if (!factory || factory.cooldown > 0) return;
    
    // Decide what to produce
    const recipe = this.selectRecipe(factory);
    if (!recipe) return;
    
    // Check if we have components
    if (!this.hasComponents(factory, recipe)) {
      this.requestComponents(factory, recipe);
      return;
    }
    
    // Produce
    factory.produce(recipe.product);
  }
  
  private selectRecipe(factory: StructureFactory): FactoryRecipe | null {
    // Priority: What's most valuable or needed
    const recipes = [
      RESOURCE_BATTERY,
      RESOURCE_UTRIUM_BAR,
      RESOURCE_OXIDANT,
      // ... more recipes
    ];
    
    for (const product of recipes) {
      const recipe = this.getRecipe(product);
      if (this.hasComponents(factory, recipe)) {
        return recipe;
      }
    }
    
    return null;
  }
}
```

---

## Market Trading

### MarketManager

File: `packages/screeps-economy/src/marketManager.ts`

**Features**:
- Automated buy/sell orders
- Price analysis
- Resource balancing

**Trading Logic**:
```typescript
@ProcessClass()
export class MarketManager {
  
  @Process({
    id: "empire:market",
    priority: ProcessPriority.LOW,
    frequency: "low",
    cpuBudget: 0.10
  })
  public tradeOnMarket(): void {
    // Only trade if we have credits
    if (Game.market.credits < 10000) return;
    
    // Analyze market
    this.updatePrices();
    
    // Execute trades
    this.executeBuyOrders();
    this.executeSellOrders();
  }
  
  private executeSellOrders(): void {
    const rooms = Object.values(Game.rooms).filter(r => r.terminal && r.controller?.my);
    
    for (const room of rooms) {
      const terminal = room.terminal;
      if (!terminal) continue;
      
      // Sell excess resources
      for (const resourceType in terminal.store) {
        const amount = terminal.store[resourceType as ResourceConstant];
        const threshold = this.getSellThreshold(resourceType as ResourceConstant);
        
        if (amount > threshold) {
          this.sellResource(terminal, resourceType as ResourceConstant, amount - threshold);
        }
      }
    }
  }
  
  private sellResource(terminal: StructureTerminal, resourceType: ResourceConstant, amount: number): void {
    // Find best buy order
    const orders = Game.market.getAllOrders({
      type: ORDER_BUY,
      resourceType: resourceType
    }).sort((a, b) => b.price - a.price);
    
    if (orders.length === 0) return;
    
    const bestOrder = orders[0];
    const sellAmount = Math.min(amount, bestOrder.remainingAmount);
    
    // Calculate profit after energy cost
    const energyCost = Game.market.calcTransactionCost(sellAmount, terminal.room.name, bestOrder.roomName);
    const profit = bestOrder.price * sellAmount - energyCost * this.getEnergyPrice();
    
    if (profit > 0) {
      Game.market.deal(bestOrder.id, sellAmount, terminal.room.name);
      console.log(`Sold ${sellAmount} ${resourceType} for ${profit} credits`);
    }
  }
}
```

---

## Best Practices

### 1. Balance Hauler Count

```typescript
function calculateHaulerNeeds(room: Room): number {
  const sources = room.find(FIND_SOURCES);
  const sourceEnergy = sources.reduce((sum, s) => sum + s.energyCapacity, 0);
  
  // 1 hauler per 3000 energy/tick capacity
  return Math.ceil(sourceEnergy / 3000);
}
```

### 2. Optimize Link Networks

```typescript
// Place links strategically:
// - Source links: Within 2 tiles of source
// - Controller link: Within 2 tiles of controller
// - Storage link: Within 2 tiles of storage

// Avoid unnecessary transfers
if (sourceLink.store.energy < 400) {
  return; // Don't transfer small amounts
}
```

### 3. Cache Expensive Finds

```typescript
// Bad: Find every tick
const targets = room.find(FIND_MY_STRUCTURES, {
  filter: s => s.structureType === STRUCTURE_SPAWN
});

// Good: Cache for 10 ticks
const cached = ctx.getCached("spawnTargets", 10);
if (!cached) {
  const targets = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_SPAWN
  });
  ctx.setCache("spawnTargets", targets, 10);
}
```

### 4. Monitor Terminal Energy

```typescript
// Keep terminal energy reserve for emergency transfers
const MIN_TERMINAL_ENERGY = 10000;

if (terminal.store.energy < MIN_TERMINAL_ENERGY) {
  // Pause non-critical transfers
  return;
}
```

---

## Troubleshooting

### Issue: Harvesters Not Spawning

**Solution**: Check pheromone levels
```typescript
const pheromones = getPheromones(room);
console.log(`Harvest pheromone: ${pheromones.harvest}`);
```

### Issue: Haulers Idle

**Solution**: Verify energy sources exist
```typescript
const containers = room.find(FIND_STRUCTURES, {
  filter: s => s.structureType === STRUCTURE_CONTAINER && s.store.energy > 0
});
console.log(`Containers with energy: ${containers.length}`);
```

### Issue: Links Not Transferring

**Solution**: Check cooldown and classification
```typescript
const links = room.find(FIND_MY_STRUCTURES, {
  filter: s => s.structureType === STRUCTURE_LINK
});

for (const link of links) {
  console.log(`Link ${link.id}: energy=${link.store.energy}, cooldown=${link.cooldown}`);
}
```

---

## Related Documentation

- [Roles Guide](./roles.md) - Harvester and hauler roles
- [Kernel Guide](./kernel.md) - Process scheduling
- [Pheromones Guide](./pheromones.md) - Economy pheromones
- [Memory Guide](./memory.md) - Memory management

---

**Last Updated**: 2025-01-23  
**Maintainer**: Screeps Bot Team  
**Source**: docs/ECONOMY_SYSTEM.md  
**Packages**: @ralphschuler/screeps-economy
