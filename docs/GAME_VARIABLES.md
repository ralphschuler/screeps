# Game Variables and Constants Reference

## Overview

This document provides a comprehensive reference to the global game variables, constants, and APIs available in Screeps. Understanding these is essential for developing effective bot strategies.

## Global Game Object

The `Game` object is the main entry point for all game state and is globally available without imports.

### Game Properties

#### `Game.time`
**Type**: `number`
**Description**: Current game tick. Increments by 1 each game loop iteration.
**Usage**:
```javascript
console.log(`Current tick: ${Game.time}`);

// Use for periodic operations
if (Game.time % 100 === 0) {
  runExpensiveOperation();
}
```

#### `Game.cpu`
**Type**: `CPU`
**Description**: CPU usage information for current tick.

**Properties**:
- `limit` (number): Your CPU limit per tick
- `tickLimit` (number): CPU limit for current tick
- `bucket` (number): Current CPU bucket (0-10000)
- `shardLimits` (object): CPU limits per shard (multi-shard only)

**Methods**:
- `getUsed()`: Returns CPU used so far this tick
- `setShardLimits(limits)`: Set CPU limits per shard
- `unlock()`: Unlock full CPU (requires global control level)
- `generatePixel()`: Generate 1 pixel (costs 5000 bucket points)
- `getHeapStatistics()`: Get heap memory stats

**Usage**:
```javascript
const startCpu = Game.cpu.getUsed();
doWork();
const cpuUsed = Game.cpu.getUsed() - startCpu;

console.log(`CPU: ${Game.cpu.getUsed()}/${Game.cpu.limit}`);
console.log(`Bucket: ${Game.cpu.bucket}/10000`);

// Generate pixels when bucket is full
if (Game.cpu.bucket === 10000) {
  Game.cpu.generatePixel();
}
```

#### `Game.gcl`
**Type**: `GlobalControlLevel`
**Description**: Global Control Level information.

**Properties**:
- `level` (number): Current GCL level
- `progress` (number): Progress points toward next level
- `progressTotal` (number): Total points needed for next level

**Usage**:
```javascript
const gclProgress = (Game.gcl.progress / Game.gcl.progressTotal * 100).toFixed(1);
console.log(`GCL ${Game.gcl.level} - ${gclProgress}% to next level`);

// Maximum rooms you can claim = GCL level
const maxRooms = Game.gcl.level;
```

#### `Game.gpl`
**Type**: `GlobalPowerLevel`
**Description**: Global Power Level information (for power creeps).

**Properties**:
- `level` (number): Current GPL level
- `progress` (number): Progress toward next level
- `progressTotal` (number): Total progress needed

**Usage**:
```javascript
if (Game.gpl.level > 0) {
  // Can create power creeps
  console.log(`GPL ${Game.gpl.level}`);
}
```

#### `Game.shard`
**Type**: `Shard`
**Description**: Current shard information.

**Properties**:
- `name` (string): Shard name (e.g., "shard0", "shard1")
- `type` (string): "normal" or "seasonal"
- `ptr` (boolean): Whether this is a PTR shard

**Usage**:
```javascript
console.log(`Running on ${Game.shard.name}`);

if (Game.shard.type === "seasonal") {
  // Seasonal server logic
}
```

#### `Game.resources`
**Type**: `{[resourceType: string]: number}`
**Description**: Account-wide resources (only available with subscription).

**Usage**:
```javascript
console.log(`Total credits: ${Game.resources[RESOURCE_CREDITS] ?? 0}`);
console.log(`Total pixels: ${Game.resources[RESOURCE_PIXEL] ?? 0}`);
console.log(`Total CPU unlocks: ${Game.resources[RESOURCE_CPU_UNLOCK] ?? 0}`);
```

#### `Game.map`
**Type**: `GameMap`
**Description**: World map API.

**Methods**:
- `describeExits(roomName)`: Get exit directions from a room
- `findExit(fromRoom, toRoom)`: Find exit direction between rooms
- `findRoute(fromRoom, toRoom, opts)`: Find route between rooms
- `getRoomLinearDistance(room1, room2, continuous)`: Calculate distance
- `getRoomTerrain(roomName)`: Get room terrain
- `getWorldSize()`: Get world size
- `isRoomAvailable(roomName)`: Check if room exists

**Usage**:
```javascript
const exits = Game.map.describeExits("W1N1");
// Returns: {1: "W1N2", 3: "W2N1", 5: "W1N0", 7: "W0N1"}

const route = Game.map.findRoute("W1N1", "W5N5");
const distance = Game.map.getRoomLinearDistance("W1N1", "W5N5");
```

#### `Game.market`
**Type**: `Market`
**Description**: Inter-player market API.

**Properties**:
- `credits` (number): Your credits balance
- `incomingTransactions` (Transaction[]): Recent incoming
- `outgoingTransactions` (Transaction[]): Recent outgoing
- `orders` (object): Your active orders

**Methods**:
- `calcTransactionCost(amount, room1, room2)`: Calculate energy cost
- `cancelOrder(orderId)`: Cancel an order
- `changeOrderPrice(orderId, newPrice)`: Update order price
- `createOrder(params)`: Create new order
- `deal(orderId, amount, targetRoom)`: Execute deal
- `extendOrder(orderId, addAmount)`: Add to order
- `getAllOrders(filter)`: Get all market orders
- `getOrderById(id)`: Get specific order

**Usage**:
```javascript
console.log(`Credits: ${Game.market.credits}`);

// Get best energy buy orders
const orders = Game.market.getAllOrders({
  type: ORDER_BUY,
  resourceType: RESOURCE_ENERGY
});
```

#### `Game.creeps`
**Type**: `{[creepName: string]: Creep}`
**Description**: All your living creeps, indexed by name.

**Usage**:
```javascript
const creepCount = Object.keys(Game.creeps).length;

for (const creep of Object.values(Game.creeps)) {
  runCreepLogic(creep);
}

// Access specific creep
const harvester = Game.creeps["harvester1"];
```

#### `Game.powerCreeps`
**Type**: `{[powerCreepName: string]: PowerCreep}`
**Description**: All your power creeps, indexed by name.

**Usage**:
```javascript
for (const powerCreep of Object.values(Game.powerCreeps)) {
  if (powerCreep.ticksToLive !== undefined) {
    runPowerCreepLogic(powerCreep);
  }
}
```

#### `Game.rooms`
**Type**: `{[roomName: string]: Room}`
**Description**: All rooms visible to you, indexed by room name.

**Usage**:
```javascript
// Iterate owned rooms
for (const room of Object.values(Game.rooms)) {
  if (room.controller?.my) {
    runRoomLogic(room);
  }
}

// Access specific room
const myRoom = Game.rooms["W1N1"];
```

#### `Game.spawns`
**Type**: `{[spawnName: string]: StructureSpawn}`
**Description**: All your spawns, indexed by name.

**Usage**:
```javascript
for (const spawn of Object.values(Game.spawns)) {
  if (!spawn.spawning) {
    trySpawnCreep(spawn);
  }
}

const spawn1 = Game.spawns["Spawn1"];
```

#### `Game.structures`
**Type**: `{[structureId: string]: Structure}`
**Description**: All your structures, indexed by ID.

**Usage**:
```javascript
const structure = Game.structures[structureId];

// Usually accessed via room.find() instead
const towers = room.find(FIND_MY_STRUCTURES, {
  filter: s => s.structureType === STRUCTURE_TOWER
});
```

#### `Game.constructionSites`
**Type**: `{[siteId: string]: ConstructionSite}`
**Description**: All your construction sites, indexed by ID.

**Usage**:
```javascript
const totalSites = Object.keys(Game.constructionSites).length;
console.log(`${totalSites}/100 construction sites`);

for (const site of Object.values(Game.constructionSites)) {
  if (site.progress < 1000) {
    // Low progress site
  }
}
```

#### `Game.flags`
**Type**: `{[flagName: string]: Flag}`
**Description**: All your flags, indexed by name.

**Usage**:
```javascript
const rallyPoint = Game.flags["RallyPoint"];
if (rallyPoint) {
  moveToFlag(creep, rallyPoint);
}

// Create flag programmatically
room.createFlag(25, 25, "AttackTarget", COLOR_RED);
```

---

## Global Memory Object

The `Memory` object persists between ticks and is your primary storage.

### Memory Structure

```typescript
interface Memory {
  // Your custom data
  creeps: {[name: string]: CreepMemory};
  rooms: {[name: string]: RoomMemory};
  spawns: {[name: string]: SpawnMemory};
  flags: {[name: string]: FlagMemory};
  
  // Bot-specific (example)
  stats: StatsRoot;
  empire: EmpireMemory;
  colonies: {[id: string]: ColonyMemory};
}
```

### Memory Management

**Key Points**:
- Memory is serialized to JSON and stored between ticks
- Maximum size: ~2 MB (compressed)
- Parsing cost: ~0.5-2 CPU per tick depending on size
- Clean up dead creeps to save space

**Usage**:
```javascript
// Clean dead creeps
for (const name in Memory.creeps) {
  if (!Game.creeps[name]) {
    delete Memory.creeps[name];
  }
}

// Access safely
const creepMemory = Memory.creeps[creep.name];
if (!creepMemory.role) {
  creepMemory.role = "harvester";
}
```

---

## Global Constants

Screeps provides hundreds of constants. Here are the most important categories:

### Return Codes

All action methods return these codes:

```javascript
OK                    // 0: Success
ERR_NOT_OWNER        // -1: Not your structure/creep
ERR_NO_PATH          // -2: No path found
ERR_NAME_EXISTS      // -3: Name already used
ERR_BUSY             // -4: Target is busy
ERR_NOT_FOUND        // -5: Object not found
ERR_NOT_ENOUGH_ENERGY // -6: Not enough energy
ERR_INVALID_TARGET   // -7: Invalid target
ERR_FULL             // -8: Target is full
ERR_NOT_IN_RANGE     // -9: Target too far
ERR_INVALID_ARGS     // -10: Invalid arguments
ERR_TIRED            // -11: Creep is fatigued
ERR_NO_BODYPART      // -12: Missing required body part
ERR_NOT_ENOUGH_EXTENSIONS // -13: Not enough extensions
ERR_RCL_NOT_ENOUGH   // -14: RCL too low
ERR_GCL_NOT_ENOUGH   // -15: GCL too low
```

**Usage**:
```javascript
const result = creep.harvest(source);
if (result === OK) {
  // Success
} else if (result === ERR_NOT_IN_RANGE) {
  creep.moveTo(source);
} else {
  console.log(`Harvest failed: ${result}`);
}
```

### Find Constants

Used with `room.find()` and `pos.findClosestByRange()`:

```javascript
FIND_CREEPS                    // All creeps
FIND_MY_CREEPS                 // Your creeps
FIND_HOSTILE_CREEPS            // Enemy creeps
FIND_SOURCES                   // Energy sources
FIND_SOURCES_ACTIVE            // Active sources
FIND_DROPPED_RESOURCES         // Dropped resources
FIND_STRUCTURES                // All structures
FIND_MY_STRUCTURES             // Your structures
FIND_HOSTILE_STRUCTURES        // Enemy structures
FIND_FLAGS                     // Your flags
FIND_CONSTRUCTION_SITES        // Construction sites
FIND_MY_CONSTRUCTION_SITES     // Your construction sites
FIND_EXIT_TOP / BOTTOM / LEFT / RIGHT  // Room exits
FIND_EXITS                     // All exits
FIND_MINERALS                  // Minerals
FIND_NUKES                     // Incoming nukes
FIND_TOMBSTONES               // Tombstones
FIND_POWER_CREEPS             // Power creeps
FIND_MY_POWER_CREEPS          // Your power creeps
FIND_HOSTILE_POWER_CREEPS     // Enemy power creeps
FIND_DEPOSITS                 // Deposits
FIND_RUINS                    // Ruins
```

**Usage**:
```javascript
const sources = room.find(FIND_SOURCES);
const hostiles = room.find(FIND_HOSTILE_CREEPS);
const myStructures = room.find(FIND_MY_STRUCTURES);

const closestSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
```

### Structure Types

```javascript
STRUCTURE_SPAWN             // Spawn
STRUCTURE_EXTENSION         // Extension
STRUCTURE_ROAD              // Road
STRUCTURE_WALL              // Wall
STRUCTURE_RAMPART           // Rampart
STRUCTURE_KEEPER_LAIR       // Source Keeper lair
STRUCTURE_PORTAL            // Portal
STRUCTURE_CONTROLLER        // Controller
STRUCTURE_LINK              // Link
STRUCTURE_STORAGE           // Storage
STRUCTURE_TOWER             // Tower
STRUCTURE_OBSERVER          // Observer
STRUCTURE_POWER_BANK        // Power Bank
STRUCTURE_POWER_SPAWN       // Power Spawn
STRUCTURE_EXTRACTOR         // Extractor
STRUCTURE_LAB               // Lab
STRUCTURE_TERMINAL          // Terminal
STRUCTURE_CONTAINER         // Container
STRUCTURE_NUKER             // Nuker
STRUCTURE_FACTORY           // Factory
STRUCTURE_INVADER_CORE      // Invader core
```

### Body Parts

```javascript
MOVE                        // Movement part
WORK                        // Work part (harvest, build, repair, upgrade)
CARRY                       // Carry part (carry resources)
ATTACK                      // Attack part (melee)
RANGED_ATTACK               // Ranged attack part
TOUGH                       // Tough part (armor)
HEAL                        // Heal part
CLAIM                       // Claim part (claim/reserve controller)
```

**Costs**:
```javascript
BODYPART_COST[MOVE]         // 50
BODYPART_COST[WORK]         // 100
BODYPART_COST[CARRY]        // 50
BODYPART_COST[ATTACK]       // 80
BODYPART_COST[RANGED_ATTACK] // 150
BODYPART_COST[TOUGH]        // 10
BODYPART_COST[HEAL]         // 250
BODYPART_COST[CLAIM]        // 600
```

### Resource Types

```javascript
RESOURCE_ENERGY             // Energy
RESOURCE_POWER              // Power

// Basic minerals
RESOURCE_HYDROGEN           // H
RESOURCE_OXYGEN             // O
RESOURCE_UTRIUM             // U
RESOURCE_LEMERGIUM          // L
RESOURCE_KEANIUM            // K
RESOURCE_ZYNTHIUM           // Z
RESOURCE_CATALYST           // X
RESOURCE_GHODIUM            // G

// Compounds (T1, T2, T3)
RESOURCE_HYDROXIDE          // OH
RESOURCE_ZYNTHIUM_KEANITE   // ZK
RESOURCE_UTRIUM_LEMERGITE   // UL
// ... many more

// Commodities
RESOURCE_UTRIUM_BAR         // Processed mineral
RESOURCE_METAL              // Metal
RESOURCE_BIOMASS            // Biomass
// ... many more
```

### Colors

Used for flags, rooms visual, construction sites:

```javascript
COLOR_RED
COLOR_PURPLE
COLOR_BLUE
COLOR_CYAN
COLOR_GREEN
COLOR_YELLOW
COLOR_ORANGE
COLOR_BROWN
COLOR_GREY
COLOR_WHITE
```

### Directions

```javascript
TOP                         // 1
TOP_RIGHT                   // 2
RIGHT                       // 3
BOTTOM_RIGHT                // 4
BOTTOM                      // 5
BOTTOM_LEFT                 // 6
LEFT                        // 7
TOP_LEFT                    // 8
```

### Look Constants

Used with `room.lookAt()` and `room.lookForAt()`:

```javascript
LOOK_CREEPS
LOOK_ENERGY
LOOK_RESOURCES
LOOK_SOURCES
LOOK_MINERALS
LOOK_DEPOSITS
LOOK_STRUCTURES
LOOK_FLAGS
LOOK_CONSTRUCTION_SITES
LOOK_NUKES
LOOK_TERRAIN
LOOK_TOMBSTONES
LOOK_POWER_CREEPS
LOOK_RUINS
```

### Terrain Types

```javascript
TERRAIN_PLAIN               // "plain"
TERRAIN_SWAMP               // "swamp"
TERRAIN_WALL                // "wall"
```

---

## Global Utility Functions

### `require()`
Load modules (not needed in TypeScript/rollup builds).

### `PathFinder`
Advanced pathfinding API.

**Methods**:
- `search(origin, goal, opts)`: Find path
- `CostMatrix`: Create custom cost matrices

**Usage**:
```javascript
const result = PathFinder.search(startPos, {pos: endPos, range: 1}, {
  plainCost: 2,
  swampCost: 10,
  maxOps: 4000,
  roomCallback: (roomName) => {
    const costs = new PathFinder.CostMatrix();
    // Customize costs
    return costs;
  }
});

if (!result.incomplete) {
  creep.moveByPath(result.path);
}
```

---

## Room Terrain

### Getting Terrain

```javascript
const terrain = Game.map.getRoomTerrain("W1N1");
const tileType = terrain.get(x, y);
// Returns: 0 (plain), TERRAIN_MASK_SWAMP (2), or TERRAIN_MASK_WALL (1)
```

### Terrain Masks

```javascript
TERRAIN_MASK_WALL           // 1
TERRAIN_MASK_SWAMP          // 2
// Plain is 0
```

---

## RawMemory

Access to raw memory string for advanced use cases.

**Properties**:
- `get()`: Get raw memory string
- `set(value)`: Set raw memory (must be string)
- `segments`: Access memory segments (0-99)
- `foreignSegment`: Access another player's public segment
- `interShardSegment`: Inter-shard communication segment

**Usage**:
```javascript
// Manual memory parsing
const memoryString = RawMemory.get();
Memory = JSON.parse(memoryString);

// Save memory manually
RawMemory.set(JSON.stringify(Memory));

// Memory segments
RawMemory.segments[0] = JSON.stringify({data: "segment data"});
const segment = JSON.parse(RawMemory.segments[0] || "{}");
```

---

## InterShardMemory

Communication between shards.

**Methods**:
- `getLocal()`: Get local shard's inter-shard memory
- `setLocal(value)`: Set local shard's inter-shard memory
- `getRemote(shard)`: Get another shard's memory

**Usage**:
```javascript
// Write to local inter-shard memory
InterShardMemory.setLocal(JSON.stringify({
  shard: Game.shard.name,
  tick: Game.time,
  status: "operational"
}));

// Read from another shard
const shard1Data = JSON.parse(InterShardMemory.getRemote("shard1") || "{}");
```

---

## Constants by Category

### Controller

```javascript
CONTROLLER_LEVELS           // RCL progression costs
CONTROLLER_STRUCTURES       // Structure limits per RCL
CONTROLLER_DOWNGRADE        // Downgrade timers
CONTROLLER_DOWNGRADE_RESTORE // Downgrade restore amount
CONTROLLER_DOWNGRADE_SAFEMODE_THRESHOLD // 5000
CONTROLLER_CLAIM_DOWNGRADE  // 300 (ticks per level)
CONTROLLER_RESERVE          // 1 (energy per tick)
CONTROLLER_RESERVE_MAX      // 5000 (max reservation)
CONTROLLER_MAX_UPGRADE_PER_TICK // 15 (max energy/tick)
CONTROLLER_ATTACK_BLOCKED_UPGRADE // 1000 (upgrade block duration)
CONTROLLER_NUKE_BLOCKED_UPGRADE   // 200 (upgrade block duration)
```

### Creep

```javascript
CREEP_LIFE_TIME             // 1500 (ticks)
CREEP_CLAIM_LIFE_TIME       // 600 (ticks for CLAIM creeps)
CREEP_CORPSE_RATE           // 0.2 (decay rate)
CREEP_PART_MAX_ENERGY       // 125 (boost cost per part)

CREEP_SPAWN_TIME            // 3 (ticks per body part)
SPAWN_ENERGY_START          // 300
SPAWN_ENERGY_CAPACITY       // 300
```

### Energy

```javascript
ENERGY_REGEN_TIME           // 300 (source regeneration)
ENERGY_DECAY                // 1000 (dropped energy decay time)
```

### Structures

```javascript
RAMPART_DECAY_AMOUNT        // 300 (hits per tick)
RAMPART_DECAY_TIME          // 100 (ticks between decay)
RAMPART_HITS                // 1 (initial hits)
RAMPART_HITS_MAX[8]         // 300,000,000 (max at RCL 8)

ROAD_HITS                   // 5000
ROAD_WEAROUT                // 1 (damage per use)
ROAD_DECAY_AMOUNT           // 100
ROAD_DECAY_TIME             // 1000

CONTAINER_HITS              // 250,000
CONTAINER_DECAY             // 5000 (hits per 500 ticks)
CONTAINER_DECAY_TIME        // 100
CONTAINER_DECAY_TIME_OWNED  // 500
```

---

## Performance Tips

### 1. Cache Game Objects
```javascript
// Bad: Multiple lookups
if (Game.creeps["harvester1"].energy < 50) {
  Game.creeps["harvester1"].harvest(source);
}

// Good: Cache reference
const harvester = Game.creeps["harvester1"];
if (harvester && harvester.store.getUsedCapacity(RESOURCE_ENERGY) < 50) {
  harvester.harvest(source);
}
```

### 2. Use Constants
```javascript
// Good: Use constants
if (structure.structureType === STRUCTURE_TOWER) {
  // ...
}

// Bad: String comparison (slower)
if (structure.structureType === "tower") {
  // ...
}
```

### 3. Minimize Memory Access
```javascript
// Bad: Multiple Memory accesses
for (const creep of Object.values(Game.creeps)) {
  if (Memory.creeps[creep.name].role === "harvester") {
    // Memory access in loop
  }
}

// Good: Use creep.memory
for (const creep of Object.values(Game.creeps)) {
  if (creep.memory.role === "harvester") {
    // Direct property access
  }
}
```

---

## See Also

- [STATS_AND_METRICS.md](./STATS_AND_METRICS.md) - Statistics system guide
- [PHEROMONES_GUIDE.md](./PHEROMONES_GUIDE.md) - Pheromone system guide
- [Official Screeps API Documentation](https://docs.screeps.com/api/)
- [ROADMAP.md](../ROADMAP.md) - Bot architecture and design principles

---

## Quick Reference Tables

### Structure Limits by RCL

| Structure | RCL1 | RCL2 | RCL3 | RCL4 | RCL5 | RCL6 | RCL7 | RCL8 |
|-----------|------|------|------|------|------|------|------|------|
| Spawn     | 1    | 1    | 1    | 1    | 1    | 1    | 2    | 3    |
| Extension | 0    | 5    | 10   | 20   | 30   | 40   | 50   | 60   |
| Tower     | 0    | 0    | 1    | 1    | 2    | 2    | 3    | 6    |
| Storage   | 0    | 0    | 0    | 1    | 1    | 1    | 1    | 1    |
| Link      | 0    | 0    | 0    | 0    | 2    | 3    | 4    | 6    |
| Terminal  | 0    | 0    | 0    | 0    | 0    | 1    | 1    | 1    |
| Lab       | 0    | 0    | 0    | 0    | 0    | 3    | 6    | 10   |
| Observer  | 0    | 0    | 0    | 0    | 0    | 0    | 0    | 1    |
| Nuker     | 0    | 0    | 0    | 0    | 0    | 0    | 0    | 1    |

### Body Part Costs

| Part          | Cost | Description |
|---------------|------|-------------|
| MOVE          | 50   | Movement    |
| WORK          | 100  | Harvest/Build/Upgrade/Repair |
| CARRY         | 50   | Carry resources |
| ATTACK        | 80   | Melee attack |
| RANGED_ATTACK | 150  | Ranged attack |
| TOUGH         | 10   | Armor |
| HEAL          | 250  | Healing |
| CLAIM         | 600  | Claim/Reserve |

### Common Return Codes

| Code | Value | Description |
|------|-------|-------------|
| OK   | 0     | Success |
| ERR_NOT_IN_RANGE | -9 | Target too far |
| ERR_NOT_ENOUGH_ENERGY | -6 | Insufficient energy |
| ERR_INVALID_TARGET | -7 | Invalid target |
| ERR_BUSY | -4 | Target busy |
| ERR_NO_PATH | -2 | No path found |
