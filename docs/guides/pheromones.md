# Pheromone System Developer Guide

## Overview

The Pheromone System is the core coordination mechanism for the SwarmBot. It enables emergent behavior through stigmergic communication - rooms and creeps coordinate by reading and updating simple numerical "pheromone" signals rather than through complex centralized planning.

**Key Principles (ROADMAP.md Section 5):**
- **Stigmergic Communication**: Indirect coordination through environmental signals
- **Emergent Behavior**: Global strategy emerges from local rules
- **Decentralized**: No central coordinator needed
- **Lightweight**: Simple numbers (0-100), not complex objects

## Table of Contents

1. [What Are Pheromones?](#what-are-pheromones)
2. [Pheromone Types](#pheromone-types)
3. [Pheromone Updates](#pheromone-updates)
4. [Diffusion System](#diffusion-system)
5. [Danger Levels](#danger-levels)
6. [Using Pheromones](#using-pheromones)
7. [Integration Examples](#integration-examples)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## What Are Pheromones?

Pheromones are simple numerical values (0-100) stored per room that represent the "scent" or "desire" for different activities.

### Core Concept

```
Traditional AI:                   Pheromone-Based AI:
┌─────────────┐                  ┌─────────────┐
│   Central   │                  │   Room A    │
│ Coordinator │◄──────┐          │ Pheromones: │
│             │       │          │  defense=80 │
└──────┬──────┘       │          └──────┬──────┘
       │              │                 │
   ┌───▼───┐      ┌───┴───┐           │ reads
   │ Unit1 │      │ Unit2 │            │
   └───────┘      └───────┘       ┌────▼────┐
                                   │ Creep A │
  Complex commands                 │ Decides:│
  Requires synchronization         │ "defend"│
                                   └─────────┘
                                   
                                   Simple, local decisions
                                   No synchronization needed
```

### Memory Structure

```typescript
interface RoomPheromones {
  expand: number;      // Expansion desire (0-100)
  harvest: number;     // Harvesting priority (0-100)
  build: number;       // Construction priority (0-100)
  upgrade: number;     // Controller upgrade priority (0-100)
  defense: number;     // Defense need (0-100)
  war: number;         // Offensive operations (0-100)
  siege: number;       // Maximum escalation (0-100)
  logistics: number;   // Resource distribution (0-100)
  nukeTarget: number;  // Nuke targeting (0-100)
}

// Stored in Memory
Memory.rooms['W1N1'].pheromones = {
  expand: 35,
  harvest: 60,
  build: 20,
  upgrade: 40,
  defense: 0,
  war: 0,
  siege: 0,
  logistics: 45,
  nukeTarget: 0
};
```

---

## Pheromone Types

### 1. Expand (Expansion)

**Purpose**: Desire to expand into new territories

**Increases When**:
- Economy is stable (storage > 50k energy)
- Danger level is 0 (peaceful)
- Energy balance is positive
- Few construction sites

**Decreases When**:
- Under attack (danger > 0)
- Insufficient resources
- Many construction sites

**Diffusion**: 30% rate (moderate spread)
**Decay**: 95% per update (slow decay)

```typescript
// Example update
if (room.storage && room.storage.store.energy > 50000) {
  pheromones.expand += 10;
}
if (dangerLevel > 0) {
  pheromones.expand = Math.max(0, pheromones.expand - 20);
}
pheromones.expand *= 0.95; // Decay
pheromones.expand = Math.min(100, pheromones.expand); // Cap
```

### 2. Harvest (Harvesting)

**Purpose**: Priority for energy harvesting

**Increases When**:
- Sources have available energy
- Energy storage is low
- More haulers than miners

**Decreases When**:
- Sources are depleted
- Storage is full
- Insufficient haulers

**Diffusion**: 10% rate (mostly local)
**Decay**: 90% per update (fast decay)

```typescript
// Example: Respond to low energy
const energyRatio = room.energyAvailable / room.energyCapacityAvailable;
if (energyRatio < 0.3) {
  pheromones.harvest += 15;
}
```

### 3. Build (Construction)

**Purpose**: Priority for construction activities

**Increases When**:
- Construction sites exist
- Structures are destroyed (damage response)
- Room is expanding

**Decreases When**:
- No construction needed
- Economy is weak

**Diffusion**: 15% rate (low spread)
**Decay**: 92% per update (moderate decay)

```typescript
// Example: Construction need
const sites = room.find(FIND_CONSTRUCTION_SITES);
pheromones.build += sites.length * 2;

// Destroyed structure response
onStructureDestroyed(structureType) {
  pheromones.build += 10;
  if (structureType === STRUCTURE_SPAWN) {
    pheromones.build += 20; // Critical!
  }
}
```

### 4. Upgrade (Controller Upgrading)

**Purpose**: Priority for controller upgrading

**Increases When**:
- Controller progress < 50% of needed
- Energy surplus available
- GCL progress is slow

**Decreases When**:
- Controller close to leveling up
- Energy is scarce

**Diffusion**: 10% rate (low spread)
**Decay**: 93% per update (moderate decay)

```typescript
// Example: GCL focus
const controller = room.controller;
if (controller) {
  const progress = controller.progress / controller.progressTotal;
  if (progress < 0.5) {
    pheromones.upgrade += 20;
  }
}
```

### 5. Defense (Defensive Operations)

**Purpose**: Need for defensive response

**Increases When**:
- Hostiles detected (immediate spike)
- Structures destroyed
- Ramparts damaged
- Nukes detected

**Decreases When**:
- Threats eliminated
- Room is secure

**Diffusion**: 40% rate (high spread - warns neighbors)
**Decay**: 97% per update (very slow - maintains alert)

```typescript
// Example: Hostile detection
const hostiles = room.find(FIND_HOSTILE_CREEPS);
if (hostiles.length > 0) {
  pheromones.defense += hostiles.length * 5;
  
  // Assess threat
  const totalDPS = hostiles.reduce((sum, h) => 
    sum + assessCreepDPS(h), 0
  );
  pheromones.defense += totalDPS / 10;
}
```

### 6. War (Offensive Operations)

**Purpose**: Escalation to offensive warfare

**Increases When**:
- Danger level >= 2 (sustained threat)
- Repeated attacks
- Strategic targets identified

**Decreases When**:
- Threat eliminated
- Resources exhausted

**Diffusion**: 50% rate (high spread - coordinates cluster)
**Decay**: 98% per update (very slow)

```typescript
// Example: Escalation
if (dangerLevel >= 2 && pheromones.defense > 60) {
  pheromones.war += 15;
}

// Sustained threat
if (Memory.rooms[room.name].consecutiveAttacks > 3) {
  pheromones.war += 25;
}
```

### 7. Siege (Critical Defense/Siege Operations)

**Purpose**: Maximum defensive/offensive escalation

**Increases When**:
- Danger level = 3 (critical)
- Nukes detected
- Critical structures destroyed
- Spawn at risk

**Decreases When**:
- Siege broken
- Room lost

**Diffusion**: 60% rate (very high - cluster-wide mobilization)
**Decay**: 99% per update (extremely slow)

```typescript
// Example: Nuke detected
onNukeDetected(nuke) {
  pheromones.siege += 50;
  pheromones.defense += 30;
  dangerLevel = 3;
  
  // Trigger Safe Mode consideration
  considerSafeMode(room);
}
```

### 8. Logistics (Resource Distribution)

**Purpose**: Need for energy distribution/logistics

**Increases When**:
- Spawns have < 50% energy
- Storage exists but spawns empty
- Towers need refilling

**Decreases When**:
- Energy well-distributed
- All structures full

**Diffusion**: 20% rate (low-moderate)
**Decay**: 91% per update (fast decay)

```typescript
// Example: Logistics need
const spawns = room.find(FIND_MY_SPAWNS);
const emptySpawns = spawns.filter(s => 
  s.store.getFreeCapacity(RESOURCE_ENERGY) > 200
);

if (emptySpawns.length > 0 && room.storage) {
  pheromones.logistics += emptySpawns.length * 10;
}
```

### 9. NukeTarget (Nuke Targeting)

**Purpose**: Marks rooms as nuke targets

**Increases When**:
- Room identified as strategic nuke target
- Enemy room with valuable structures
- Retaliation needed

**Decreases When**:
- Target no longer relevant
- Nuke launched

**Diffusion**: 10% rate (very low - mostly intel)
**Decay**: 99% per update (slow decay)

```typescript
// Example: Mark nuke target
function markNukeTarget(roomName: string, priority: number) {
  if (!Memory.rooms[roomName].pheromones) {
    Memory.rooms[roomName].pheromones = createDefaultPheromones();
  }
  Memory.rooms[roomName].pheromones.nukeTarget = priority;
}
```

---

## Pheromone Updates

### Update Cycle

```
Every 5 Ticks (Configurable):
┌─────────────────┐
│  1. Decay       │ ← Multiply all by decay factor
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. Calculate   │ ← Add new values based on state
│     Contributions│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. Diffusion   │ ← Spread to neighbors
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. Cap Values  │ ← Ensure 0-100 range
└─────────────────┘
```

### Periodic Update Example

```typescript
import { Process, ProcessPriority } from "../core/processDecorators";

@ProcessClass()
export class PheromoneManager {
  
  @Process({
    id: "cluster:pheromoneDiffusion",
    priority: ProcessPriority.MEDIUM,
    frequency: "medium", // Every 5-20 ticks
    cpuBudget: 0.05
  })
  public updatePheromones(): void {
    for (const roomName in Memory.rooms) {
      const room = Game.rooms[roomName];
      if (!room) continue;
      
      this.updateRoomPheromones(room);
    }
    
    this.diffusePheromones();
  }
  
  private updateRoomPheromones(room: Room): void {
    const pheromones = this.getPheromones(room);
    
    // 1. Decay
    this.applyDecay(pheromones);
    
    // 2. Calculate contributions
    this.updateExpand(room, pheromones);
    this.updateHarvest(room, pheromones);
    this.updateBuild(room, pheromones);
    this.updateUpgrade(room, pheromones);
    this.updateDefense(room, pheromones);
    this.updateLogistics(room, pheromones);
    
    // 3. Cap values
    this.capPheromones(pheromones);
    
    // 4. Store
    this.setPheromones(room, pheromones);
  }
  
  private applyDecay(pheromones: RoomPheromones): void {
    pheromones.expand *= 0.95;
    pheromones.harvest *= 0.90;
    pheromones.build *= 0.92;
    pheromones.upgrade *= 0.93;
    pheromones.defense *= 0.97;
    pheromones.war *= 0.98;
    pheromones.siege *= 0.99;
    pheromones.logistics *= 0.91;
    pheromones.nukeTarget *= 0.99;
  }
  
  private updateExpand(room: Room, pheromones: RoomPheromones): void {
    // Energy surplus
    if (room.storage && room.storage.store.energy > 50000) {
      pheromones.expand += 10;
    }
    
    // Peaceful
    const dangerLevel = this.getDangerLevel(room);
    if (dangerLevel === 0) {
      pheromones.expand += 5;
    } else {
      pheromones.expand = Math.max(0, pheromones.expand - dangerLevel * 10);
    }
  }
  
  private updateHarvest(room: Room, pheromones: RoomPheromones): void {
    const sources = room.find(FIND_SOURCES);
    const energyRatio = room.energyAvailable / room.energyCapacityAvailable;
    
    // Low energy
    if (energyRatio < 0.3) {
      pheromones.harvest += 15;
    }
    
    // Active sources
    const activeSources = sources.filter(s => s.energy > 0);
    pheromones.harvest += activeSources.length * 5;
  }
  
  // ... other update methods
}
```

### Event-Driven Updates

Critical events trigger immediate updates:

```typescript
export class PheromoneEventHandlers {
  
  // Hostile detected
  public static onHostileDetected(
    room: Room,
    hostileCount: number,
    dangerLevel: number
  ): void {
    const pheromones = getPheromones(room);
    
    // Immediate defense response
    pheromones.defense += hostileCount * 5;
    
    // Escalate if severe
    if (dangerLevel >= 2) {
      pheromones.war += dangerLevel * 10;
    }
    if (dangerLevel >= 3) {
      pheromones.siege += 20;
    }
    
    setPheromones(room, pheromones);
  }
  
  // Structure destroyed
  public static onStructureDestroyed(
    room: Room,
    structureType: StructureConstant
  ): void {
    const pheromones = getPheromones(room);
    
    pheromones.defense += 5;
    pheromones.build += 10;
    
    // Critical structures
    if ([STRUCTURE_SPAWN, STRUCTURE_STORAGE, STRUCTURE_TOWER].includes(structureType)) {
      pheromones.siege += 15;
      increaseDangerLevel(room);
    }
    
    setPheromones(room, pheromones);
  }
  
  // Nuke detected
  public static onNukeDetected(room: Room): void {
    const pheromones = getPheromones(room);
    
    pheromones.siege += 50;
    pheromones.defense += 30;
    setDangerLevel(room, 3); // Maximum
    
    setPheromones(room, pheromones);
  }
  
  // Remote source lost
  public static onRemoteSourceLost(room: Room): void {
    const pheromones = getPheromones(room);
    
    pheromones.expand -= 10;
    pheromones.defense += 5;
    
    setPheromones(room, pheromones);
  }
}
```

---

## Diffusion System

### How Diffusion Works

Pheromones spread to neighboring rooms to coordinate cluster responses:

```
Room A (W1N1):              Room B (W2N1):
defense = 80                defense = 20
     │                           ▲
     │  Diffusion (40% rate)     │
     └───────────────────────────┘
              16 units
     
After diffusion:
Room A: defense = 80 (source)
Room B: defense = 36 (20 + 16)
```

### Diffusion Calculation

```typescript
private diffusePheromones(): void {
  const rooms = Object.values(Game.rooms);
  
  for (const room of rooms) {
    const pheromones = this.getPheromones(room);
    
    // Only diffuse if intensity > 1
    if (pheromones.defense > 1) {
      this.diffusePheromone(room, 'defense', 0.40);
    }
    if (pheromones.war > 1) {
      this.diffusePheromone(room, 'war', 0.50);
    }
    if (pheromones.expand > 1) {
      this.diffusePheromone(room, 'expand', 0.30);
    }
    if (pheromones.siege > 1) {
      this.diffusePheromone(room, 'siege', 0.60);
    }
  }
}

private diffusePheromone(
  room: Room,
  type: keyof RoomPheromones,
  rate: number
): void {
  const pheromones = this.getPheromones(room);
  const intensity = pheromones[type];
  
  // Get neighbors
  const neighbors = this.getNeighboringRooms(room.name);
  
  for (const neighborName of neighbors) {
    const neighborPheromones = this.getPheromones(neighborName);
    
    // Calculate diffusion amount
    const amount = intensity * rate * 0.5;
    
    // Add to neighbor (capped at source intensity)
    neighborPheromones[type] = Math.min(
      intensity,
      neighborPheromones[type] + amount
    );
    
    this.setPheromones(neighborName, neighborPheromones);
  }
}

private getNeighboringRooms(roomName: string): string[] {
  const parsed = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(roomName);
  if (!parsed) return [];
  
  const [, we, x, ns, y] = parsed;
  const xNum = parseInt(x);
  const yNum = parseInt(y);
  
  return [
    `${we}${xNum+1}${ns}${y}`, // East
    `${we}${xNum-1}${ns}${y}`, // West
    `${we}${x}${ns}${yNum+1}`, // North
    `${we}${x}${ns}${yNum-1}`  // South
  ];
}
```

### Diffusion Rates

| Pheromone | Rate | Purpose |
|-----------|------|---------|
| defense   | 40%  | Warn neighbors of threats |
| war       | 50%  | Coordinate offensive response |
| siege     | 60%  | Cluster-wide mobilization |
| expand    | 30%  | Share expansion opportunities |
| harvest   | 10%  | Mostly local |
| build     | 15%  | Low spread |
| upgrade   | 10%  | Local priority |
| logistics | 20%  | Moderate coordination |
| nukeTarget| 10%  | Intel sharing |

---

## Danger Levels

Danger levels (0-3) represent threat intensity and influence pheromones:

### Danger 0: Peaceful

```typescript
// Normal operations
pheromones.expand += 5;  // Can expand
pheromones.defense *= 0.97;  // Decays naturally
```

### Danger 1: Threat Detected

```typescript
// Hostiles spotted but manageable
pheromones.defense += hostileCount * 5;
adjustSpawnPriority('defender', PRIORITY_MEDIUM);
```

### Danger 2: Active Attack

```typescript
// Sustained hostile presence
pheromones.defense += 30;
pheromones.war += 20;
setRoomPosture(room, 'defensive');
requestClusterAssistance(room);
```

### Danger 3: Critical Threat

```typescript
// Major attack or nuke
pheromones.siege += 50;
pheromones.defense += 30;
setRoomPosture(room, 'siege');
considerSafeMode(room);
mobilizeCluster(room);
```

---

## Using Pheromones

### In Spawn Logic

Spawns prioritize creep types based on pheromones:

```typescript
export class SpawnManager {
  
  private getSpawnPriority(room: Room): string {
    const pheromones = getPheromones(room);
    
    // Find dominant pheromone
    const dominant = Object.entries(pheromones)
      .reduce((max, [key, value]) => 
        value > max.value ? { key, value } : max,
        { key: '', value: 0 }
      );
    
    // Threshold-based decisions
    if (pheromones.defense > 50) {
      return "defender";
    }
    if (pheromones.siege > 30) {
      return "soldier";
    }
    if (pheromones.harvest > 40) {
      return "harvester";
    }
    if (pheromones.build > 30) {
      return "builder";
    }
    if (pheromones.upgrade > 20) {
      return "upgrader";
    }
    
    // Default to economy
    return "harvester";
  }
}
```

### In Creep Behavior

Creeps read local pheromones to make decisions:

```typescript
export function flexibleWorkerBehavior(ctx: BehaviorContext): BehaviorAction {
  const room = ctx.room;
  const pheromones = getPheromones(room);
  
  // Emergency: High defense need
  if (pheromones.defense > 50) {
    // Repair critical structures
    const damaged = room.find(FIND_STRUCTURES, {
      filter: s => s.hits < s.hitsMax * 0.5
    });
    if (damaged.length > 0) {
      return { type: "repair", target: damaged[0] };
    }
  }
  
  // Choose based on dominant pheromone
  if (pheromones.build > pheromones.upgrade) {
    return buildBehavior(ctx);
  } else {
    return upgradeBehavior(ctx);
  }
}
```

### In Strategic Planning

Empire manager makes decisions based on pheromone patterns:

```typescript
export class EmpireManager {
  
  @Process({
    id: "empire:expansion",
    priority: ProcessPriority.LOW,
    frequency: "low",
    cpuBudget: 0.10
  })
  public evaluateExpansion(): void {
    // Find rooms with high expand pheromone
    const candidates = Object.keys(Memory.rooms)
      .map(name => ({
        name,
        pheromones: getPheromones(name)
      }))
      .filter(r => r.pheromones.expand > 40)
      .sort((a, b) => b.pheromones.expand - a.pheromones.expand);
    
    if (candidates.length > 0) {
      const target = candidates[0];
      console.log(`Expansion candidate: ${target.name} (expand=${target.pheromones.expand})`);
      this.initiateExpansion(target.name);
    }
  }
  
  @Process({
    id: "empire:military",
    priority: ProcessPriority.MEDIUM,
    frequency: "medium",
    cpuBudget: 0.08
  })
  public coordinateMilitary(): void {
    // Find rooms needing assistance
    const threatened = Object.keys(Memory.rooms)
      .map(name => ({
        name,
        pheromones: getPheromones(name)
      }))
      .filter(r => r.pheromones.defense > 60 || r.pheromones.war > 40);
    
    for (const room of threatened) {
      console.log(`Military alert: ${room.name} (defense=${room.pheromones.defense}, war=${room.pheromones.war})`);
      this.deployMilitary(room.name);
    }
  }
}
```

---

## Integration Examples

### Example 1: Tower Automation

Towers use defense pheromone to adjust behavior:

```typescript
export class TowerManager {
  
  public runTower(tower: StructureTower): void {
    const room = tower.room;
    const pheromones = getPheromones(room);
    
    // High alert: Focus on combat
    if (pheromones.defense > 60) {
      const hostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (hostile) {
        tower.attack(hostile);
        return;
      }
    }
    
    // Moderate alert: Heal and attack
    if (pheromones.defense > 30) {
      const injured = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: c => c.hits < c.hitsMax
      });
      if (injured) {
        tower.heal(injured);
        return;
      }
    }
    
    // Peaceful: Repair structures
    if (pheromones.defense < 10) {
      const damaged = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: s => s.hits < s.hitsMax
      });
      if (damaged) {
        tower.repair(damaged);
      }
    }
  }
}
```

### Example 2: Remote Mining Coordination

Remote mining responds to expand pheromone:

```typescript
export class RemoteMiningManager {
  
  @Process({
    id: "remote:mining",
    priority: ProcessPriority.MEDIUM,
    frequency: "medium",
    cpuBudget: 0.05
  })
  public coordinateRemoteMining(): void {
    for (const roomName in Memory.rooms) {
      const room = Game.rooms[roomName];
      if (!room || !room.controller || !room.controller.my) continue;
      
      const pheromones = getPheromones(room);
      
      // Only expand remote mining if expand pheromone is high
      if (pheromones.expand > 50) {
        this.identifyRemoteSources(room);
        this.spawnRemoteMiners(room);
      }
      
      // Contract remote mining if defense is high
      if (pheromones.defense > 60) {
        this.recallRemoteMiners(room);
      }
    }
  }
}
```

### Example 3: Emergency Response

Emergency manager coordinates based on siege pheromone:

```typescript
export class EmergencyManager {
  
  @Process({
    id: "emergency:coordinator",
    priority: ProcessPriority.CRITICAL,
    frequency: "high",
    cpuBudget: 0.02
  })
  public handleEmergencies(): void {
    for (const roomName in Memory.rooms) {
      const room = Game.rooms[roomName];
      if (!room) continue;
      
      const pheromones = getPheromones(room);
      
      // Critical: Siege mode
      if (pheromones.siege > 40) {
        this.handleSiege(room);
      }
      
      // High: Defense mode
      else if (pheromones.defense > 70) {
        this.handleDefense(room);
      }
    }
  }
  
  private handleSiege(room: Room): void {
    console.log(`🚨 SIEGE MODE: ${room.name}`);
    
    // Consider safe mode
    if (room.controller && room.controller.my && room.controller.safeModeAvailable > 0) {
      const spawn = room.find(FIND_MY_SPAWNS)[0];
      if (spawn && spawn.hits < spawn.hitsMax * 0.3) {
        room.controller.activateSafeMode();
        console.log(`Safe Mode activated in ${room.name}`);
      }
    }
    
    // Request cluster assistance
    this.requestEmergencyAssistance(room);
  }
}
```

---

## Best Practices

### 1. Don't Micromanage

Let pheromones guide behavior, don't override with complex logic:

```typescript
// ❌ Bad: Complex centralized logic
if (room.energyAvailable < 300 && 
    room.find(FIND_CONSTRUCTION_SITES).length > 5 &&
    Game.time % 10 === 0) {
  spawnBuilder();
}

// ✅ Good: Pheromone-based decision
const pheromones = getPheromones(room);
if (pheromones.build > 30) {
  spawnBuilder();
}
```

### 2. Use Thresholds

Define clear thresholds for decision points:

```typescript
const PHEROMONE_THRESHOLDS = {
  defense: {
    alert: 30,
    emergency: 60,
    critical: 80
  },
  expand: {
    consider: 40,
    initiate: 60,
    aggressive: 80
  }
};

if (pheromones.defense > PHEROMONE_THRESHOLDS.defense.critical) {
  activateSafeMode();
}
```

### 3. Combine Pheromones

Make decisions based on multiple pheromones:

```typescript
// Spawn priority based on pheromone balance
function getSpawnPriority(pheromones: RoomPheromones): string {
  // Defense always wins
  if (pheromones.defense > 50) return "defender";
  
  // Otherwise, use weighted scoring
  const scores = {
    harvester: pheromones.harvest * 1.2,
    builder: pheromones.build * 1.0,
    upgrader: pheromones.upgrade * 0.8
  };
  
  return Object.entries(scores)
    .reduce((max, [role, score]) => score > max.score ? { role, score } : max)
    .role;
}
```

### 4. Event-Driven Critical Updates

Use events for immediate pheromone updates:

```typescript
// In tower manager
if (hostileDetected) {
  PheromoneEventHandlers.onHostileDetected(room, hostiles.length, dangerLevel);
  
  // Pheromones updated immediately, other systems react next tick
}
```

### 5. Monitor Pheromone Levels

Log pheromone states for debugging:

```typescript
@Process({
  id: "core:pheromoneStats",
  priority: ProcessPriority.LOW,
  frequency: "low",
  cpuBudget: 0.01
})
public logPheromoneStats(): void {
  for (const roomName in Memory.rooms) {
    const pheromones = getPheromones(roomName);
    const dominant = Object.entries(pheromones)
      .reduce((max, [k, v]) => v > max.value ? { key: k, value: v } : max, { key: '', value: 0 });
    
    if (dominant.value > 40) {
      console.log(`${roomName}: ${dominant.key}=${dominant.value}`);
    }
  }
}
```

---

## Troubleshooting

### Issue: Pheromone Stuck at High Value

**Symptoms**: Defense pheromone stays at 100 even after threats cleared

**Cause**: Missing decay or too slow decay rate

**Solution**:
```typescript
// Ensure decay is applied
pheromones.defense *= 0.97; // 97% retention per update

// Or force reset if conditions met
if (hostiles.length === 0 && pheromones.defense > 80) {
  pheromones.defense = Math.max(0, pheromones.defense - 20);
}
```

### Issue: Pheromones Not Affecting Behavior

**Symptoms**: High build pheromone but no builders spawning

**Cause**: Spawn logic not reading pheromones

**Solution**:
```typescript
// Ensure spawn logic checks pheromones
const pheromones = getPheromones(room);
console.log(`Build pheromone: ${pheromones.build}`);

if (pheromones.build > 30) {
  queueCreepSpawn('builder');
}
```

### Issue: Pheromones Too Volatile

**Symptoms**: Pheromones swing wildly every tick

**Cause**: Insufficient decay, over-reactive updates

**Solution**:
```typescript
// Use slower decay rates
pheromones.defense *= 0.97; // Instead of 0.90

// Add damping to updates
const newValue = calculateNewValue();
pheromones.defense += (newValue - pheromones.defense) * 0.3; // 30% adjustment
```

### Issue: Diffusion Not Working

**Symptoms**: Neighboring rooms not receiving pheromones

**Cause**: Diffusion not running or rate too low

**Solution**:
```typescript
// Verify diffusion process is registered and running
const process = kernel.getProcess("cluster:pheromoneDiffusion");
console.log(`Diffusion process: ${process ? 'Registered' : 'Missing'}`);

// Check diffusion rate
if (pheromones.defense > 1) {
  this.diffusePheromone(room, 'defense', 0.40); // 40% rate
}
```

---

## Related Documentation

- [Kernel Guide](./kernel.md) - Process system and scheduling
- [State Machines Guide](./state-machines.md) - Behavior state management
- [Roles Guide](./roles.md) - Role-based pheromone usage
- [Defense Guide](./defense.md) - Defense pheromone integration
- [Economy Guide](./economy.md) - Economy pheromone integration

---

## API Reference

### Pheromone Interface

```typescript
interface RoomPheromones {
  expand: number;
  harvest: number;
  build: number;
  upgrade: number;
  defense: number;
  war: number;
  siege: number;
  logistics: number;
  nukeTarget: number;
}
```

### Helper Functions

```typescript
function getPheromones(room: Room | string): RoomPheromones;
function setPheromones(room: Room | string, pheromones: RoomPheromones): void;
function getDangerLevel(room: Room): 0 | 1 | 2 | 3;
function setDangerLevel(room: Room, level: 0 | 1 | 2 | 3): void;
```

### Event Handlers

```typescript
class PheromoneEventHandlers {
  static onHostileDetected(room: Room, count: number, danger: number): void;
  static onStructureDestroyed(room: Room, type: StructureConstant): void;
  static onNukeDetected(room: Room): void;
  static onRemoteSourceLost(room: Room): void;
}
```

---

**Last Updated**: 2025-01-23  
**Maintainer**: Screeps Bot Team  
**Test Coverage**: pheromone.test.ts, pheromoneIntegration.test.ts  
**Related Issues**: ROADMAP Section 5
