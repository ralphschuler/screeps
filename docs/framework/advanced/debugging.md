# Debugging & Profiling

Learn how to **debug** and **profile** your Screeps bot for performance optimization.

---

## Table of Contents

- [Debugging Tools](#debugging-tools)
- [CPU Profiling](#cpu-profiling)
- [Memory Inspection](#memory-inspection)
- [Visual Debugging](#visual-debugging)
- [Common Issues](#common-issues)
- [Performance Analysis](#performance-analysis)

---

## Debugging Tools

### Console Commands

The framework includes a console command system:

```typescript
import { ConsoleCommands } from '@ralphschuler/screeps-console';

// Register custom commands
ConsoleCommands.register('stats', () => {
  console.log(`CPU: ${Game.cpu.getUsed().toFixed(2)}`);
  console.log(`Bucket: ${Game.cpu.bucket}`);
  console.log(`Rooms: ${Object.keys(Game.rooms).length}`);
});

// Use in console:
// > stats()
```

### Built-in Console Commands

```javascript
// Get process statistics
kernel.getStatistics()

// Profile a function
profile.start('myFunction')
// ... code ...
profile.end('myFunction')

// Memory usage
Memory.stats

// Cache statistics
cache.getStats()
```

---

## CPU Profiling

### Manual Profiling

```typescript
function profiledFunction() {
  const startCPU = Game.cpu.getUsed();
  
  // Your code
  expensiveOperation();
  
  const cpuUsed = Game.cpu.getUsed() - startCPU;
  console.log(`CPU: ${cpuUsed.toFixed(3)}`);
}
```

### Profiling Decorators

```typescript
import { profile } from '@ralphschuler/screeps-core';

class MyManager {
  @profile('MyManager.process')
  process() {
    // Automatically profiled
  }
}
```

### Process-Level Profiling

```typescript
import { kernel } from '@ralphschuler/screeps-kernel';

// Get all process statistics
const stats = kernel.getStatistics();

for (const [processId, stat] of Object.entries(stats)) {
  console.log(`${processId}: ${stat.cpu.toFixed(3)} CPU, ${stat.executions} runs`);
}
```

### Hot Path Identification

```typescript
// Track expensive operations
const hotPaths = new Map<string, number>();

function trackOperation(name: string, cpu: number) {
  const total = hotPaths.get(name) || 0;
  hotPaths.set(name, total + cpu);
}

// Every 100 ticks, log hot paths
if (Game.time % 100 === 0) {
  const sorted = Array.from(hotPaths.entries())
    .sort((a, b) => b[1] - a[1]);
  
  console.log('Top CPU consumers:');
  for (const [name, cpu] of sorted.slice(0, 10)) {
    console.log(`  ${name}: ${cpu.toFixed(2)} total CPU`);
  }
  
  hotPaths.clear();
}
```

---

## Memory Inspection

### Memory Size

```typescript
// Calculate memory size
function getMemorySize(): number {
  return JSON.stringify(Memory).length;
}

console.log(`Memory size: ${(getMemorySize() / 1024).toFixed(2)} KB`);
```

### Memory Breakdown

```typescript
function analyzeMemory() {
  const sizes = {
    rooms: JSON.stringify(Memory.rooms).length,
    creeps: JSON.stringify(Memory.creeps).length,
    empire: JSON.stringify(Memory.empire).length,
    stats: JSON.stringify(Memory.stats).length
  };
  
  console.log('Memory breakdown:');
  for (const [key, size] of Object.entries(sizes)) {
    console.log(`  ${key}: ${(size / 1024).toFixed(2)} KB`);
  }
}
```

### Memory Leaks

```typescript
// Detect memory leaks (growing memory)
let lastMemorySize = 0;

if (Game.time % 100 === 0) {
  const currentSize = getMemorySize();
  const delta = currentSize - lastMemorySize;
  
  if (delta > 10000) {  // >10 KB growth
    console.log(`⚠️ Memory leak detected: +${(delta / 1024).toFixed(2)} KB`);
    analyzeMemory();
  }
  
  lastMemorySize = currentSize;
}
```

---

## Visual Debugging

### Room Visuals

```typescript
import { RoomVisual } from '@ralphschuler/screeps-visuals';

// Visualize pathfinding
function visualizePath(creep: Creep, target: RoomPosition) {
  const path = creep.pos.findPathTo(target);
  
  creep.room.visual.poly(
    path.map(p => [p.x, p.y]),
    { stroke: '#ffffff', lineStyle: 'dashed' }
  );
}

// Visualize CPU usage per room
function visualizeRoomCPU(room: Room, cpu: number) {
  room.visual.text(
    `CPU: ${cpu.toFixed(2)}`,
    25, 1,
    { color: cpu > 0.15 ? '#ff0000' : '#00ff00' }
  );
}
```

### Pheromone Visualization

```typescript
function visualizePheromones(room: Room) {
  const pheromones = room.memory.swarm?.pheromones;
  if (!pheromones) return;
  
  const y = 2;
  const labels = [
    ['expand', pheromones.expand],
    ['harvest', pheromones.harvest],
    ['build', pheromones.build],
    ['defense', pheromones.defense]
  ];
  
  for (let i = 0; i < labels.length; i++) {
    const [label, value] = labels[i];
    const color = value > 0.7 ? '#ff0000' : value > 0.4 ? '#ffaa00' : '#00ff00';
    room.visual.text(
      `${label}: ${value.toFixed(2)}`,
      1, y + i,
      { color, align: 'left' }
    );
  }
}
```

---

## Common Issues

### Issue 1: High CPU Usage

**Symptoms**: CPU consistently &gt; 20, bucket draining

**Diagnosis**:
```typescript
// Profile all major systems
const systems = ['spawning', 'economy', 'defense', 'roles'];
for (const system of systems) {
  const start = Game.cpu.getUsed();
  runSystem(system);
  const cpu = Game.cpu.getUsed() - start;
  console.log(`${system}: ${cpu.toFixed(3)} CPU`);
}
```

**Common Causes**:
- Uncached `room.find()` calls
- Pathfinding every tick
- Too many creeps
- Inefficient role logic

**Solutions**: See [Performance Guide](../performance.md)

### Issue 2: Memory Leaks

**Symptoms**: Memory size growing, parsing time increasing

**Diagnosis**:
```typescript
// Track memory growth
analyzeMemory();  // Run every 100 ticks
```

**Common Causes**:
- Dead creep memory not cleaned
- Event logs growing unbounded
- Cached data not expiring

**Solutions**:
```typescript
// Clean dead creep memory
for (const name in Memory.creeps) {
  if (!Game.creeps[name]) {
    delete Memory.creeps[name];
  }
}

// Limit event logs
if (room.memory.swarm.eventLog.length > 20) {
  room.memory.swarm.eventLog = room.memory.swarm.eventLog.slice(-20);
}
```

### Issue 3: Cache Inefficiency

**Symptoms**: Low cache hit rate, high CPU despite caching

**Diagnosis**:
```typescript
const stats = cache.getStats();
const hitRate = stats.hits / (stats.hits + stats.misses);
console.log(`Cache hit rate: ${(hitRate * 100).toFixed(1)}%`);
```

**Common Causes**:
- TTL too short (cache expires before reuse)
- Cache keys not unique
- LRU eviction too aggressive

**Solutions**:
- Increase TTL for static data
- Use namespaces to avoid key conflicts
- Increase cache size limit

---

## Performance Analysis

### CPU Budget Analysis

```typescript
function analyzeCPUBudgets() {
  const processes = kernel.getStatistics();
  const totalBudget = Object.values(processes)
    .reduce((sum, p) => sum + p.cpuBudget, 0);
  
  console.log(`Total CPU budget: ${totalBudget.toFixed(2)}`);
  console.log(`Actual CPU: ${Game.cpu.getUsed().toFixed(2)}`);
  
  if (Game.cpu.getUsed() > totalBudget * 1.2) {
    console.log('⚠️ Processes exceeding budgets!');
  }
}
```

### Room-Level Profiling

```typescript
function profileRooms() {
  const roomCPU = new Map<string, number>();
  
  for (const room of Object.values(Game.rooms)) {
    if (!room.controller?.my) continue;
    
    const start = Game.cpu.getUsed();
    processRoom(room);
    const cpu = Game.cpu.getUsed() - start;
    
    roomCPU.set(room.name, cpu);
  }
  
  // Find expensive rooms
  const sorted = Array.from(roomCPU.entries())
    .sort((a, b) => b[1] - a[1]);
  
  console.log('Most expensive rooms:');
  for (const [name, cpu] of sorted.slice(0, 5)) {
    console.log(`  ${name}: ${cpu.toFixed(3)} CPU`);
  }
}
```

### Creep Performance

```typescript
function profileCreeps() {
  const roleCP U = new Map<string, { total: number, count: number }>();
  
  for (const creep of Object.values(Game.creeps)) {
    const start = Game.cpu.getUsed();
    runCreepRole(creep);
    const cpu = Game.cpu.getUsed() - start;
    
    const role = creep.memory.role;
    const stats = roleCPU.get(role) || { total: 0, count: 0 };
    stats.total += cpu;
    stats.count += 1;
    roleCPU.set(role, stats);
  }
  
  console.log('Average CPU per role:');
  for (const [role, stats] of roleCPU) {
    const avg = stats.total / stats.count;
    console.log(`  ${role}: ${avg.toFixed(4)} CPU (${stats.count} creeps)`);
  }
}
```

---

## Related Documentation

- **[Performance Guide](../performance.md)** - Optimization techniques
- **[Console Package](../../../packages/@ralphschuler/screeps-console/README.md)** - Console commands
- **[Visuals Package](../../../packages/@ralphschuler/screeps-visuals/README.md)** - Visualization tools

---

**Last Updated**: 2026-01-27  
**Framework Version**: 0.1.0
