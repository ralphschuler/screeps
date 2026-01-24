# Quick Start Guide

Get your Screeps bot running with the framework in under 10 minutes.

## Prerequisites

- Node.js 16+ installed
- TypeScript knowledge
- Screeps account (official or private server)

## Step 1: Create a New Bot Project

```bash
# Create project directory
mkdir my-screeps-bot
cd my-screeps-bot

# Initialize npm project
npm init -y

# Install TypeScript and Screeps types
npm install --save-dev typescript @types/screeps @types/node

# Create TypeScript config
npx tsc --init
```

## Step 2: Install Framework Packages

Start with the essential packages:

```bash
# Core functionality
npm install @ralphschuler/screeps-kernel
npm install @ralphschuler/screeps-spawn
npm install @ralphschuler/screeps-economy
npm install @ralphschuler/screeps-utils
```

## Step 3: Create Your Bot

Create `src/main.ts`:

```typescript
import { Kernel } from '@ralphschuler/screeps-kernel';
import { SpawnManager } from '@ralphschuler/screeps-spawn';
import { linkManager } from '@ralphschuler/screeps-economy';

// Initialize managers
const kernel = new Kernel({ cpuBudget: 10 });
const spawnManager = new SpawnManager({ debug: true });

// Helper: Get spawn requests for a room
function getSpawnRequests(room: Room) {
  const requests = [];
  const creeps = room.find(FIND_MY_CREEPS);
  
  // Count harvester creeps
  const harvesters = creeps.filter(c => c.memory.role === 'harvester');
  const sources = room.find(FIND_SOURCES);
  
  // Need 2 harvesters per source
  if (harvesters.length < sources.length * 2) {
    requests.push({
      role: 'harvester',
      priority: 100,
      memory: { role: 'harvester', room: room.name }
    });
  }
  
  // Add more role logic as needed...
  
  return requests;
}

// Register processes with kernel
kernel.registerProcess({
  id: 'spawning',
  priority: 90,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;
      
      const spawns = room.find(FIND_MY_SPAWNS);
      const requests = getSpawnRequests(room);
      spawnManager.processSpawnQueue(spawns, requests);
    }
  },
  cpuBudget: 0.5
});

kernel.registerProcess({
  id: 'links',
  priority: 80,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (!room.controller?.my) continue;
      if (room.controller.level >= 5) {
        linkManager.run(room);
      }
    }
  },
  cpuBudget: 0.3
});

// Main game loop
export const loop = () => {
  kernel.run();
  
  // Add your creep logic here
  for (const creep of Object.values(Game.creeps)) {
    if (creep.memory.role === 'harvester') {
      runHarvester(creep);
    }
  }
};

// Simple harvester logic
function runHarvester(creep: Creep) {
  if (creep.store.getFreeCapacity() > 0) {
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source) {
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
  } else {
    const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
    if (spawn) {
      if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn);
      }
    }
  }
}
```

## Step 4: Build and Deploy

### Option A: Using Grunt (Screeps-TypeScript-Starter)

```bash
npm install --save-dev grunt
# Copy your screeps credentials to screeps.json
npm run deploy
```

### Option B: Using Rollup

Create `rollup.config.js`:

```javascript
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
};
```

Then build and deploy:

```bash
npm install --save-dev rollup @rollup/plugin-typescript @rollup/plugin-node-resolve @rollup/plugin-commonjs
npm run build
# Copy dist/main.js to Screeps
```

## Step 5: Verify It Works

In the Screeps console:

```javascript
// Check kernel is running
console.log('Kernel processes:', Object.keys(Memory.kernel?.processes || {}));

// Check spawning
console.log('Spawn queue:', Game.spawns['Spawn1'].memory.queue);

// Check links (if RCL >= 5)
console.log('Links:', Game.rooms['W1N1'].find(FIND_MY_STRUCTURES, {
  filter: s => s.structureType === STRUCTURE_LINK
}));
```

You should see:
- Harvesters spawning automatically
- Links transferring energy (if RCL >= 5)
- CPU usage managed by kernel

## Next Steps

### Add More Features

```bash
# Defense systems
npm install @ralphschuler/screeps-defense

# Lab automation
npm install @ralphschuler/screeps-chemistry

# Advanced pathfinding
npm install @ralphschuler/screeps-pathfinding

# Remote mining
npm install @ralphschuler/screeps-remote-mining
```

### Customize Roles

The spawn manager provides templates for all standard roles:

```typescript
const spawnManager = new SpawnManager({
  rolePriorities: {
    harvester: 100,
    hauler: 90,
    upgrader: 80,
    builder: 70,
    defender: 60
  }
});
```

### Add Custom Processes

Register your own processes with the kernel:

```typescript
kernel.registerProcess({
  id: 'my-custom-logic',
  priority: 50,
  execute: () => {
    // Your logic here
  },
  cpuBudget: 1.0,
  interval: 10  // Run every 10 ticks
});
```

## Troubleshooting

### Spawns Not Working

**Issue**: No creeps spawning

**Solutions**:
1. Enable debug mode: `new SpawnManager({ debug: true })`
2. Check energy: `console.log(room.energyAvailable)`
3. Check spawn queue: `console.log(spawn.memory.queue)`

### High CPU Usage

**Issue**: CPU > 80%

**Solutions**:
1. Reduce kernel CPU budget: `new Kernel({ cpuBudget: 5 })`
2. Increase process intervals
3. Enable adaptive budgets: `updateConfig({ enableAdaptiveBudgets: true })`

### Links Not Working

**Issue**: Links not transferring energy

**Solutions**:
1. Verify RCL >= 5
2. Check link placement (range 2)
3. Ensure linkManager is called each tick

## Learn More

- **[Framework Overview](overview.md)** - Architecture and design
- **[Developer Guides](../guides/)** - Deep dives into systems
- **[Migration Guide](migration.md)** - Move from other frameworks
- **[Examples](../../examples/)** - Complete bot examples
- **[API Reference](../../api/)** - Complete API docs

## Get Help

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions and share bots
- **Package READMEs**: Detailed documentation for each package
