# Defense Coordination Developer Guide

## Overview

The Defense Coordination System provides comprehensive multi-room defense coordination following the swarm architecture principles outlined in ROADMAP.md Sections 11 (Cluster & Empire Logic) and 12 (Combat & Defense). This guide consolidates information from docs/DEFENSE_COORDINATION.md.

**Key Features:**
- Multi-room threat assessment
- Automated tower control
- Coordinated cluster defense
- Safe mode management
- Assistance request system

## Table of Contents

1. [Architecture](#architecture)
2. [Threat Assessment](#threat-assessment)
3. [Tower Automation](#tower-automation)
4. [Defense Coordinator](#defense-coordinator)
5. [Cluster Defense](#cluster-defense)
6. [Safe Mode Management](#safe-mode-management)
7. [Military Roles](#military-roles)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Diagram

```
┌──────────────────────────────────────────────────────────┐
│                  Defense System                           │
└──────────────────────────────────────────────────────────┘
             │
             ├── Threat Assessment ─► DPS Calculation
             │                        Boost Detection
             │                        Danger Levels (0-3)
             │                        Role Classification
             │
             ├── Tower Automation ──► Target Prioritization
             │                        Healing vs Attack
             │                        Energy Management
             │
             ├── Defense Coordinator ► Assistance Requests
             │                         Defender Assignment
             │                         ETA Calculation
             │
             ├── Cluster Defense ────► Cluster-wide Threat Assessment
             │                         Mutual Aid System
             │                         Priority Allocation
             │
             └── Safe Mode ──────────► Threat Evaluation
                                       Activation Triggers
                                       Cooldown Tracking
```

### Core Components

1. **Threat Assessment** (`threatAssessment.ts`) - Analyze hostile presence
2. **Defense Coordinator** (`defenseCoordinator.ts`) - Coordinate defender deployment
3. **Cluster Defense** (`clusterDefense.ts`) - Cluster-wide coordination
4. **Tower Manager** - Automated tower control
5. **Safe Mode Manager** - Safe mode decisions

---

## Threat Assessment

File: `packages/screeps-defense/src/threatAssessment.ts`

### ThreatAnalysis Interface

```typescript
interface ThreatAnalysis {
  roomName: string;
  dangerLevel: 0 | 1 | 2 | 3;  // Per ROADMAP: 0=peaceful, 1=hostile, 2=attack, 3=siege/nuke
  threatScore: number;          // Composite score (0-1000+)
  hostileCount: number;
  totalHostileHitPoints: number;
  totalHostileDPS: number;
  healerCount: number;
  rangedCount: number;
  meleeCount: number;
  boostedCount: number;
  dismantlerCount: number;
  estimatedDefenderCost: number;
  assistanceRequired: boolean;
  assistancePriority: number;   // 0-100
  recommendedResponse: "monitor" | "defend" | "assist" | "retreat" | "safemode";
}
```

### DPS Calculation

```typescript
export function assessCreepDPS(creep: Creep): number {
  let dps = 0;
  
  // Attack parts
  const attackParts = creep.getActiveBodyparts(ATTACK);
  dps += attackParts * ATTACK_POWER; // 30 per part
  
  // Ranged attack parts  
  const rangedParts = creep.getActiveBodyparts(RANGED_ATTACK);
  dps += rangedParts * RANGED_ATTACK_POWER; // 10 per part
  
  // Boost multiplier (T3 boosts = 4x damage)
  const boostMultiplier = detectBoostLevel(creep);
  dps *= boostMultiplier;
  
  return dps;
}

function detectBoostLevel(creep: Creep): number {
  // Check for T3 boosts (XUH2O, XKHO2)
  const t3Boosts = [RESOURCE_CATALYZED_UTRIUM_ACID, RESOURCE_CATALYZED_KEANIUM_ALKALIDE];
  for (const part of creep.body) {
    if (part.boost && t3Boosts.includes(part.boost)) {
      return 4.0; // T3 = 4x
    }
  }
  
  // Check for T2 boosts
  const t2Boosts = [RESOURCE_UTRIUM_ACID, RESOURCE_KEANIUM_ALKALIDE];
  for (const part of creep.body) {
    if (part.boost && t2Boosts.includes(part.boost)) {
      return 3.0; // T2 = 3x
    }
  }
  
  // Check for T1 boosts
  const t1Boosts = [RESOURCE_UTRIUM_HYDRIDE, RESOURCE_KEANIUM_OXIDE];
  for (const part of creep.body) {
    if (part.boost && t1Boosts.includes(part.boost)) {
      return 2.0; // T1 = 2x
    }
  }
  
  return 1.0; // No boost
}
```

### Threat Score Calculation

```typescript
export function assessThreat(room: Room): ThreatAnalysis {
  const hostiles = room.find(FIND_HOSTILE_CREEPS);
  
  if (hostiles.length === 0) {
    return {
      roomName: room.name,
      dangerLevel: 0,
      threatScore: 0,
      hostileCount: 0,
      // ... all zeros
      recommendedResponse: "monitor"
    };
  }
  
  // Calculate metrics
  let totalDPS = 0;
  let totalHP = 0;
  let healerCount = 0;
  let rangedCount = 0;
  let meleeCount = 0;
  let boostedCount = 0;
  let dismantlerCount = 0;
  
  for (const hostile of hostiles) {
    totalDPS += assessCreepDPS(hostile);
    totalHP += hostile.hits;
    
    if (hostile.getActiveBodyparts(HEAL) > 0) healerCount++;
    if (hostile.getActiveBodyparts(RANGED_ATTACK) > 0) rangedCount++;
    if (hostile.getActiveBodyparts(ATTACK) > 0) meleeCount++;
    if (hostile.getActiveBodyparts(WORK) > 5) dismantlerCount++;
    if (detectBoostLevel(hostile) > 1.0) boostedCount++;
  }
  
  // Calculate threat score
  let threatScore = 0;
  threatScore += hostiles.length * 10;     // 10 points per hostile
  threatScore += totalDPS;                 // DPS contribution
  threatScore += healerCount * 50;         // Healers are dangerous
  threatScore += boostedCount * 100;       // Boosted creeps are very dangerous
  threatScore += dismantlerCount * 75;     // Dismantlers threaten structures
  
  // Determine danger level
  let dangerLevel: 0 | 1 | 2 | 3 = 0;
  if (hostiles.length > 0) dangerLevel = 1;
  if (threatScore > 100 || totalDPS > 150) dangerLevel = 2;
  if (threatScore > 300 || boostedCount > 2) dangerLevel = 3;
  
  // Check for nukes
  const nukes = room.find(FIND_NUKES);
  if (nukes.length > 0) {
    dangerLevel = 3;
    threatScore += 1000;
  }
  
  // Determine recommended response
  let recommendedResponse: ThreatAnalysis["recommendedResponse"] = "monitor";
  if (dangerLevel >= 3) recommendedResponse = "safemode";
  else if (dangerLevel === 2 && threatScore > 200) recommendedResponse = "assist";
  else if (dangerLevel >= 1) recommendedResponse = "defend";
  
  return {
    roomName: room.name,
    dangerLevel,
    threatScore,
    hostileCount: hostiles.length,
    totalHostileHitPoints: totalHP,
    totalHostileDPS: totalDPS,
    healerCount,
    rangedCount,
    meleeCount,
    boostedCount,
    dismantlerCount,
    estimatedDefenderCost: calculateDefenderCost(threatScore),
    assistanceRequired: dangerLevel >= 2,
    assistancePriority: Math.min(100, threatScore / 10),
    recommendedResponse
  };
}
```

---

## Tower Automation

### Tower Priority System

```typescript
export class TowerManager {
  
  public runTower(tower: StructureTower): void {
    const room = tower.room;
    
    // Priority 1: Attack hostiles
    const hostile = this.findBestHostileTarget(tower);
    if (hostile) {
      tower.attack(hostile);
      return;
    }
    
    // Priority 2: Heal damaged creeps (if no threats)
    const injured = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: c => c.hits < c.hitsMax
    });
    if (injured) {
      tower.heal(injured);
      return;
    }
    
    // Priority 3: Repair structures (if energy > 500)
    if (tower.store.getUsedCapacity(RESOURCE_ENERGY) > 500) {
      const damaged = this.findRepairTarget(tower);
      if (damaged) {
        tower.repair(damaged);
        return;
      }
    }
  }
  
  private findBestHostileTarget(tower: StructureTower): Creep | null {
    const hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length === 0) return null;
    
    // Sort by priority:
    // 1. Healers (disrupt healing)
    // 2. Closest (most immediate threat)
    // 3. Lowest HP (finish them off)
    
    const prioritized = hostiles.sort((a, b) => {
      const aHealParts = a.getActiveBodyparts(HEAL);
      const bHealParts = b.getActiveBodyparts(HEAL);
      
      // Healers first
      if (aHealParts > 0 && bHealParts === 0) return -1;
      if (bHealParts > 0 && aHealParts === 0) return 1;
      
      // Then by distance
      const aDist = tower.pos.getRangeTo(a);
      const bDist = tower.pos.getRangeTo(b);
      if (aDist !== bDist) return aDist - bDist;
      
      // Then by HP (lowest first)
      return a.hits - b.hits;
    });
    
    return prioritized[0];
  }
  
  private findRepairTarget(tower: StructureTower): Structure | null {
    const room = tower.room;
    
    // Critical structures first
    const criticalDamaged = room.find(FIND_STRUCTURES, {
      filter: s => 
        (s.structureType === STRUCTURE_SPAWN ||
         s.structureType === STRUCTURE_TOWER ||
         s.structureType === STRUCTURE_STORAGE) &&
        s.hits < s.hitsMax
    });
    
    if (criticalDamaged.length > 0) {
      return tower.pos.findClosestByRange(criticalDamaged);
    }
    
    // Ramparts below threshold
    const weakRamparts = room.find(FIND_STRUCTURES, {
      filter: s => 
        s.structureType === STRUCTURE_RAMPART &&
        s.hits < 10000
    });
    
    if (weakRamparts.length > 0) {
      return tower.pos.findClosestByRange(weakRamparts);
    }
    
    // Other structures
    const damaged = room.find(FIND_STRUCTURES, {
      filter: s => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL
    });
    
    if (damaged.length > 0) {
      return tower.pos.findClosestByRange(damaged);
    }
    
    return null;
  }
}
```

### Energy Management

```typescript
// Towers should maintain minimum energy for defense
const MIN_TOWER_ENERGY = 300;
const OPTIMAL_TOWER_ENERGY = 700;

// In hauler behavior
if (pheromones.defense > 30) {
  // Prioritize filling towers during threats
  const towers = room.find(FIND_MY_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_TOWER &&
                 s.store.getUsedCapacity(RESOURCE_ENERGY) < OPTIMAL_TOWER_ENERGY
  });
  
  if (towers.length > 0) {
    return { type: "transfer", target: towers[0], resourceType: RESOURCE_ENERGY };
  }
}
```

---

## Defense Coordinator

File: `packages/screeps-defense/src/defenseCoordinator.ts`

### Process Details

```typescript
@ProcessClass()
export class DefenseCoordinator {
  
  @Process({
    id: "cluster:defense",
    priority: ProcessPriority.HIGH,
    frequency: "high", // Every 3 ticks
    cpuBudget: 0.05
  })
  public coordinateDefense(): void {
    // 1. Assess all room threats
    const threats = this.assessAllThreats();
    
    // 2. Process assistance requests
    for (const threat of threats) {
      if (threat.assistanceRequired) {
        this.processAssistanceRequest(threat);
      }
    }
    
    // 3. Clean up completed assignments
    this.cleanupAssignments();
  }
  
  private assessAllThreats(): ThreatAnalysis[] {
    const threats: ThreatAnalysis[] = [];
    
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller || !room.controller.my) continue;
      
      const threat = assessThreat(room);
      if (threat.dangerLevel > 0) {
        threats.push(threat);
      }
    }
    
    return threats.sort((a, b) => b.assistancePriority - a.assistancePriority);
  }
  
  private processAssistanceRequest(threat: ThreatAnalysis): void {
    // Find available defenders in nearby rooms
    const helpers = this.findHelperRooms(threat.roomName);
    
    for (const helper of helpers) {
      const availableDefenders = this.getAvailableDefenders(helper.roomName);
      
      if (availableDefenders.length === 0) continue;
      
      // Assign defenders
      const needed = this.calculateDefendersNeeded(threat);
      const assigned = availableDefenders.slice(0, needed);
      
      for (const defender of assigned) {
        this.assignDefender(defender, threat.roomName);
      }
      
      if (assigned.length >= needed) break;
    }
  }
  
  private findHelperRooms(targetRoom: string): Array<{ roomName: string; distance: number }> {
    const helpers: Array<{ roomName: string; distance: number }> = [];
    
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (!room.controller || !room.controller.my) continue;
      if (roomName === targetRoom) continue;
      
      // Calculate distance
      const distance = Game.map.getRoomLinearDistance(roomName, targetRoom);
      
      // Check if room is safe enough to spare defenders
      const roomThreat = assessThreat(room);
      if (roomThreat.dangerLevel >= 2) continue; // Too threatened
      
      helpers.push({ roomName, distance });
    }
    
    return helpers.sort((a, b) => a.distance - b.distance);
  }
  
  private assignDefender(defender: Creep, targetRoom: string): void {
    defender.memory.assistTarget = targetRoom;
    console.log(`Assigned ${defender.name} to defend ${targetRoom}`);
  }
}
```

---

## Cluster Defense

File: `packages/screeps-defense/src/clusterDefense.ts`

### Cluster Coordination

```typescript
@ProcessClass()
export class ClusterDefenseCoordinator {
  
  @Process({
    id: "cluster:defense:coordination",
    priority: ProcessPriority.HIGH,
    frequency: "medium",
    cpuBudget: 0.08
  })
  public coordinateClusterDefense(): void {
    // Get all clusters
    const clusters = this.identifyClusters();
    
    for (const cluster of clusters) {
      this.coordinateCluster(cluster);
    }
  }
  
  private coordinateCluster(cluster: string[]): void {
    // Assess cluster-wide threats
    const threats = cluster.map(roomName => ({
      roomName,
      threat: assessThreat(Game.rooms[roomName])
    }));
    
    // Find most threatened room
    const mostThreatened = threats.reduce((max, t) => 
      t.threat.threatScore > max.threat.threatScore ? t : max
    );
    
    if (mostThreatened.threat.dangerLevel >= 2) {
      // Mobilize cluster defense
      this.mobilizeCluster(cluster, mostThreatened.roomName);
    }
  }
  
  private mobilizeCluster(cluster: string[], targetRoom: string): void {
    console.log(`🚨 Cluster mobilization: ${cluster.join(', ')} → ${targetRoom}`);
    
    // Collect all available military units
    const militaryUnits: Creep[] = [];
    
    for (const roomName of cluster) {
      if (roomName === targetRoom) continue;
      
      const room = Game.rooms[roomName];
      const defenders = room.find(FIND_MY_CREEPS, {
        filter: c => 
          (c.memory.role === 'guard' || c.memory.role === 'soldier') &&
          !c.memory.assistTarget
      });
      
      militaryUnits.push(...defenders);
    }
    
    // Assign units
    for (const unit of militaryUnits) {
      unit.memory.assistTarget = targetRoom;
    }
    
    console.log(`Deployed ${militaryUnits.length} units to ${targetRoom}`);
  }
}
```

---

## Safe Mode Management

### Activation Logic

```typescript
export class SafeModeManager {
  
  public evaluateSafeMode(room: Room): boolean {
    if (!room.controller || !room.controller.my) return false;
    if (!room.controller.safeModeAvailable) return false;
    
    const threat = assessThreat(room);
    
    // Activate if:
    // 1. Critical threat (danger level 3)
    // 2. Spawn at risk
    // 3. No other rooms can help quickly
    
    // Critical threat
    if (threat.dangerLevel >= 3) {
      return this.activateSafeMode(room, "Critical threat detected");
    }
    
    // Spawn endangered
    const spawns = room.find(FIND_MY_SPAWNS);
    const endangeredSpawn = spawns.find(s => s.hits < s.hitsMax * 0.3);
    if (endangeredSpawn && threat.dangerLevel >= 2) {
      return this.activateSafeMode(room, "Spawn endangered");
    }
    
    // Heavy structural damage
    const criticalStructures = room.find(FIND_MY_STRUCTURES, {
      filter: s => 
        (s.structureType === STRUCTURE_STORAGE ||
         s.structureType === STRUCTURE_TERMINAL) &&
        s.hits < s.hitsMax * 0.2
    });
    
    if (criticalStructures.length > 0 && threat.dangerLevel >= 2) {
      return this.activateSafeMode(room, "Critical structures damaged");
    }
    
    return false;
  }
  
  private activateSafeMode(room: Room, reason: string): boolean {
    if (!room.controller || !room.controller.my) return false;
    
    const result = room.controller.activateSafeMode();
    
    if (result === OK) {
      console.log(`🛡️ Safe Mode activated in ${room.name}: ${reason}`);
      
      // Notify via events
      kernel.publishEvent({
        type: "safemode:activated",
        data: {
          roomName: room.name,
          reason: reason,
          endTick: Game.time + SAFE_MODE_DURATION
        }
      });
      
      return true;
    }
    
    return false;
  }
}
```

---

## Military Roles

### Guard

**Purpose**: Defend room from invaders

```typescript
export function guardBehavior(ctx: BehaviorContext): BehaviorAction {
  const creep = ctx.creep;
  
  // Check for hostiles
  if (ctx.hostiles.length > 0) {
    const target = ctx.findClosest(ctx.hostiles);
    if (target) {
      return { type: "attack", target };
    }
  }
  
  // Patrol room
  if (!creep.memory.patrolPoint) {
    creep.memory.patrolPoint = getPatrolPoint(ctx.room);
  }
  
  return { type: "moveTo", target: creep.memory.patrolPoint };
}
```

### Soldier

**Purpose**: Offensive combat operations

```typescript
export function soldierBehavior(ctx: BehaviorContext): BehaviorAction {
  const creep = ctx.creep;
  
  // Tactical retreat if low HP
  const hpPercent = creep.hits / creep.hitsMax;
  if (hpPercent < 0.3) {
    if (ctx.room.name !== creep.memory.homeRoom) {
      return { type: "moveToRoom", roomName: creep.memory.homeRoom };
    }
    
    // Move near spawn for healing
    const spawns = ctx.room.find(FIND_MY_SPAWNS);
    if (spawns.length > 0 && creep.pos.getRangeTo(spawns[0]) > 3) {
      return { type: "moveTo", target: spawns[0] };
    }
  }
  
  // Assist if assigned
  if (creep.memory.assistTarget && ctx.room.name !== creep.memory.assistTarget) {
    return { type: "moveToRoom", roomName: creep.memory.assistTarget };
  }
  
  // Attack hostiles
  if (ctx.hostiles.length > 0) {
    const target = ctx.findClosest(ctx.hostiles);
    return { type: "attack", target };
  }
  
  return { type: "idle" };
}
```

---

## Best Practices

### 1. Layer Defense

```typescript
// Layer 1: Ramparts (passive)
// Layer 2: Towers (automated)
// Layer 3: Defenders (local)
// Layer 4: Cluster assistance
// Layer 5: Safe mode (last resort)
```

### 2. Maintain Tower Energy

```typescript
// Always keep towers ready
const MIN_DEFENSE_ENERGY = 300 * towerCount;

if (room.energyAvailable < MIN_DEFENSE_ENERGY && pheromones.defense > 30) {
  prioritizeTowerFilling();
}
```

### 3. Early Warning System

```typescript
// Use pheromone diffusion for early warning
if (pheromones.defense > 60) {
  // Neighboring rooms alerted
  prepareDefenses();
}
```

### 4. Avoid Overreaction

```typescript
// Don't spawn expensive defenders for minor threats
if (threat.dangerLevel === 1 && threat.threatScore < 50) {
  // Towers can handle it
  return;
}
```

---

## Troubleshooting

### Issue: Towers Not Attacking

**Solution**: Check tower energy and targeting
```typescript
console.log(`Tower energy: ${tower.store.energy}`);
console.log(`Hostiles: ${room.find(FIND_HOSTILE_CREEPS).length}`);
```

### Issue: Defenders Not Responding

**Solution**: Verify assistance request system
```typescript
const threat = assessThreat(room);
console.log(`Assistance required: ${threat.assistanceRequired}`);
console.log(`Priority: ${threat.assistancePriority}`);
```

### Issue: Safe Mode Activating Too Early

**Solution**: Adjust activation thresholds
```typescript
// Increase threshold for spawn endangerment
const SPAWN_HP_THRESHOLD = 0.2; // Was 0.3
```

---

## Related Documentation

- [Pheromones Guide](./pheromones.md) - Defense pheromones
- [Roles Guide](./roles.md) - Military roles
- [Kernel Guide](./kernel.md) - Defense process scheduling
- [State Machines Guide](./state-machines.md) - Combat behaviors

---

**Last Updated**: 2025-01-23  
**Maintainer**: Screeps Bot Team  
**Source**: docs/DEFENSE_COORDINATION.md  
**Packages**: @ralphschuler/screeps-defense  
**Related Issues**: ROADMAP Sections 11-12
