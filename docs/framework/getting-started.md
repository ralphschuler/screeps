# Getting Started Tutorial

A **complete step-by-step tutorial** to build your first Screeps bot using the framework.

---

## What You'll Build

By the end of this tutorial, you'll have a **working Screeps bot** that:
- ✅ Spawns harvesters, haulers, upgraders, and builders automatically
- ✅ Manages economy with link networks (RCL 5+)
- ✅ Builds structures based on room layout
- ✅ Uses CPU-budgeted process management
- ✅ Scales to multiple rooms

**Estimated Time**: 30-45 minutes

---

## Prerequisites

Before starting:
- [x] Node.js 16+ installed
- [x] TypeScript basics
- [x] Screeps account (official or private server)
- [x] Completed [Installation Guide](installation.md)

---

## Tutorial Steps

### Step 1: Project Setup (5 minutes)

Create a new project:

```bash
mkdir my-screeps-bot
cd my-screeps-bot
npm init -y
```

Install framework packages:

```bash
npm install @ralphschuler/screeps-kernel
npm install @ralphschuler/screeps-spawn
npm install screeps-economy
npm install @types/screeps
npm install --save-dev typescript
```

Initialize TypeScript:

```bash
npx tsc --init
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

### Step 2: Create Main Loop (10 minutes)

Create `src/main.ts`:

```typescript
import { Kernel, ProcessPriority } from '@ralphschuler/screeps-kernel';
import { SpawnManager, SpawnRequest } from '@ralphschuler/screeps-spawn';
import { linkManager } from 'screeps-economy';

// Initialize kernel and managers
const kernel = new Kernel({ cpuBudget: 15 });
const spawnManager = new SpawnManager({ debug: true });

// Build spawn requests based on room needs
function getSpawnRequests(room: Room): SpawnRequest[] {
  const requests: SpawnRequest[] = [];
  const creeps = room.find(FIND_MY_CREEPS);
  const sources = room.find(FIND_SOURCES);
  
  // Count creeps by role
  const harvesters = creeps.filter(c => c.memory.role === 'harvester');
  const haulers = creeps.filter(c => c.memory.role === 'hauler');
  const upgraders = creeps.filter(c => c.memory.role === 'upgrader');
  const builders = creeps.filter(c => c.memory.role === 'builder');
  
  // Harvesters: 2 per source
  if (harvesters.length < sources.length * 2) {
    requests.push({
      role: 'harvester',
      priority: 100,
      memory: { role: 'harvester', room: room.name }
    });
  }
  
  // Haulers: 2-3 depending on room size
  if (haulers.length < 3) {
    requests.push({
      role: 'hauler',
      priority: 90,
      memory: { role: 'hauler', room: room.name }
    });
  }
  
  // Upgraders: 3 per room
  if (upgraders.length < 3) {
    requests.push({
      role: 'upgrader',
      priority: 80,
      memory: { role: 'upgrader', room: room.name }
    });
  }
  
  // Builders: 2 per room (if construction sites exist)
  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  if (sites.length > 0 && builders.length < 2) {
    requests.push({
      role: 'builder',
      priority: 70,
      memory: { role: 'builder', room: room.name }
    });
  }
  
  return requests;
}

// Register spawning process
kernel.registerProcess({
  id: 'spawning',
  name: 'Spawn Management',
  priority: ProcessPriority.HIGH,
  cpuBudget: 0.5,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;
      
      const spawns = room.find(FIND_MY_SPAWNS);
      const requests = getSpawnRequests(room);
      spawnManager.processSpawnQueue(spawns, requests);
    }
  }
});

// Register link management process (RCL 5+)
kernel.registerProcess({
  id: 'links',
  name: 'Link Network',
  priority: ProcessPriority.MEDIUM,
  cpuBudget: 0.2,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (room.controller?.my && room.controller.level >= 5) {
        linkManager.run(room);
      }
    }
  }
});

// Clean up dead creep memory
function cleanMemory() {
  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
    }
  }
}

// Main game loop
export function loop() {
  // Clean memory
  cleanMemory();
  
  // Run kernel (executes all registered processes)
  kernel.run();
  
  // Run creep behaviors
  for (const creep of Object.values(Game.creeps)) {
    runCreepBehavior(creep);
  }
}
```

---

### Step 3: Implement Creep Behaviors (10 minutes)

Add creep logic to `src/main.ts`:

```typescript
function runCreepBehavior(creep: Creep) {
  switch (creep.memory.role) {
    case 'harvester':
      runHarvester(creep);
      break;
    case 'hauler':
      runHauler(creep);
      break;
    case 'upgrader':
      runUpgrader(creep);
      break;
    case 'builder':
      runBuilder(creep);
      break;
  }
}

function runHarvester(creep: Creep) {
  // Always harvest
  const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  if (source) {
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
    }
  }
}

function runHauler(creep: Creep) {
  if (creep.store.getFreeCapacity() > 0) {
    // Pick up dropped resources or withdraw from containers
    const droppedResource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: r => r.resourceType === RESOURCE_ENERGY
    });
    
    if (droppedResource) {
      if (creep.pickup(droppedResource) === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedResource, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    } else {
      // Withdraw from containers
      const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER && 
                     s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
      }) as StructureContainer | null;
      
      if (container) {
        if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(container, { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  } else {
    // Deliver to spawns and extensions
    const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: s => (s.structureType === STRUCTURE_SPAWN || 
                    s.structureType === STRUCTURE_EXTENSION) &&
                   s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    }) as StructureSpawn | StructureExtension | null;
    
    if (target) {
      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }
}

function runUpgrader(creep: Creep) {
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    // Get energy from containers or storage
    const storage = creep.room.storage;
    if (storage && storage.store.getUsedCapacity(RESOURCE_ENERGY) > 1000) {
      if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: '#0000ff' } });
      }
    } else {
      // Get from containers
      const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER &&
                     s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
      }) as StructureContainer | null;
      
      if (container) {
        if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(container, { visualizePathStyle: { stroke: '#0000ff' } });
        }
      }
    }
  } else {
    // Upgrade controller
    const controller = creep.room.controller;
    if (controller) {
      if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller, { visualizePathStyle: { stroke: '#0000ff' } });
      }
    }
  }
}

function runBuilder(creep: Creep) {
  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    // Get energy (same as upgrader)
    const storage = creep.room.storage;
    if (storage && storage.store.getUsedCapacity(RESOURCE_ENERGY) > 500) {
      if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: '#00ff00' } });
      }
    } else {
      const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_CONTAINER &&
                     s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
      }) as StructureContainer | null;
      
      if (container) {
        if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(container);
        }
      }
    }
  } else {
    // Build construction sites
    const site = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
    if (site) {
      if (creep.build(site) === ERR_NOT_IN_RANGE) {
        creep.moveTo(site, { visualizePathStyle: { stroke: '#00ff00' } });
      }
    }
  }
}
```

---

### Step 4: Build and Deploy (5 minutes)

Add build script to `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch"
  }
}
```

Build your bot:

```bash
npm run build
```

Deploy to Screeps:
- Copy `dist/main.js` content
- Paste into Screeps console editor
- Or use deployment tools like `screeps-deploy`

---

### Step 5: Verify and Monitor (5 minutes)

In the Screeps console:

```javascript
// Check kernel status
console.log('Kernel processes:', kernel.getStatistics());

// Check spawning
for (const name in Game.spawns) {
  const spawn = Game.spawns[name];
  console.log(`${name}: ${spawn.spawning ? 'Spawning ' + spawn.spawning.name : 'Idle'}`);
}

// Check creeps by role
const roles = {};
for (const name in Game.creeps) {
  const role = Game.creeps[name].memory.role;
  roles[role] = (roles[role] || 0) + 1;
}
console.log('Creeps by role:', roles);

// Check CPU usage
console.log(`CPU: ${Game.cpu.getUsed().toFixed(2)} / ${Game.cpu.limit}`);
console.log(`Bucket: ${Game.cpu.bucket}`);
```

Expected output:
```
Kernel processes: { spawning: {...}, links: {...} }
Spawn1: Spawning Harvester1
Creeps by role: { harvester: 4, hauler: 3, upgrader: 3, builder: 2 }
CPU: 5.23 / 20
Bucket: 9847
```

---

## Next Steps

### Add More Features

1. **Remote Mining** - Use `@ralphschuler/screeps-remote-mining`
2. **Defense** - Use `screeps-defense` for tower automation
3. **Labs** - Use `screeps-chemistry` for reactions
4. **Layouts** - Use `@ralphschuler/screeps-layouts` for room blueprints

### Optimize Performance

1. Add caching: `npm install @ralphschuler/screeps-cache`
2. Profile CPU usage
3. Tune process budgets
4. Monitor bucket level

### Scale to Multiple Rooms

1. Add room claiming logic
2. Implement multi-room logistics
3. Use cluster coordination
4. Enable multi-shard operations

---

## Common Issues

### Issue: Creeps not spawning

**Solution**: Check spawn queue and energy:

```javascript
const spawn = Game.spawns['Spawn1'];
console.log('Energy:', spawn.room.energyAvailable, '/', spawn.room.energyCapacityAvailable);
console.log('Queue:', getSpawnRequests(spawn.room));
```

### Issue: High CPU usage

**Solution**: Check process statistics:

```javascript
const stats = kernel.getStatistics();
for (const [id, stat] of Object.entries(stats)) {
  if (stat.cpu > 1.0) {
    console.log(`High CPU: ${id} - ${stat.cpu.toFixed(3)}`);
  }
}
```

### Issue: Creeps idle

**Solution**: Check role logic and targets:

```javascript
for (const creep of Object.values(Game.creeps)) {
  if (!creep.spawning) {
    console.log(`${creep.name} (${creep.memory.role}): ${creep.pos}`);
  }
}
```

---

## Resources

- **[Architecture Guide](architecture.md)** - Understand swarm architecture
- **[Performance Guide](performance.md)** - Optimize CPU usage
- **[Advanced Topics](advanced/)** - Custom processes, blueprints, multi-shard
- **[Package Documentation](packages.md)** - Individual package guides

---

**Congratulations!** 🎉

You've built a working Screeps bot using the framework. Continue learning with the advanced guides and package documentation.

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
