# Screeps Framework Examples

This directory contains complete bot implementations using the Screeps Framework.

## Available Examples

### 1. Minimal Bot

**Location**: [minimal-bot/](minimal-bot/)

A minimal working bot demonstrating basic framework usage:

- Process-based architecture with Kernel
- Spawn management
- Simple harvester logic
- Link automation (RCL 5+)

**Best for**: Learning the basics, starting a new bot

**Usage**:
```bash
cd examples/minimal-bot
npm install
npm run build
```

### 2. Advanced Bot (Coming Soon)

A full-featured bot using all major framework packages:

- Complete economy management
- Lab automation and boost production
- Defense coordination
- Remote mining
- Market trading
- Multi-shard coordination

**Best for**: Understanding advanced patterns, reference implementation

## Running Examples

### Prerequisites

- Node.js 16+
- TypeScript 4.0+
- Screeps account

### Quick Start

1. **Choose an example**:
   ```bash
   cd examples/minimal-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure deployment** (create `.screeps.json`):
   ```json
   {
     "email": "your-email@example.com",
     "password": "your-password",
     "branch": "default",
     "ptr": false
   }
   ```

4. **Build and deploy**:
   ```bash
   npm run build
   npm run deploy
   ```

## Example Breakdown

### Minimal Bot Features

**Included**:
- ✅ Kernel process management
- ✅ Spawn queue with priorities
- ✅ Link network automation
- ✅ Basic harvester role
- ✅ CPU budget management

**Not Included** (add as needed):
- ❌ Defense systems
- ❌ Lab automation
- ❌ Remote mining
- ❌ Market trading
- ❌ Advanced roles

### Customizing Examples

Each example is designed to be customized:

1. **Add packages**:
   ```bash
   npm install @ralphschuler/screeps-defense
   npm install @ralphschuler/screeps-chemistry
   ```

2. **Register processes**:
   ```typescript
   kernel.registerProcess({
     id: 'defense',
     priority: 85,
     execute: () => defenseManager.run(),
     cpuBudget: 0.4
   });
   ```

3. **Extend roles**:
   ```typescript
   function getSpawnRequests(room: Room) {
     // Add your custom role logic
     if (needsDefender(room)) {
       requests.push({
         role: 'defender',
         priority: 95,
         memory: { role: 'defender' }
       });
     }
   }
   ```

## Development Workflow

### 1. Local Development

```bash
# Watch mode for rapid iteration
npm run watch
```

### 2. Testing

```bash
# Run tests (if available)
npm test

# Lint code
npm run lint
```

### 3. Deployment

```bash
# Deploy to main branch
npm run deploy

# Deploy to specific branch
npm run deploy -- --branch experimental
```

## Common Patterns

### Pattern 1: Add Economy Management

```typescript
import { linkManager } from '@ralphschuler/screeps-economy';

kernel.registerProcess({
  id: 'links',
  priority: 80,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (room.controller?.my && room.controller.level >= 5) {
        linkManager.run(room);
      }
    }
  }
});
```

### Pattern 2: Add Lab Automation

```typescript
import { ChemistryManager } from '@ralphschuler/screeps-chemistry';

const chemistry = new ChemistryManager();

kernel.registerProcess({
  id: 'labs',
  priority: 70,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (room.controller?.my) {
        const reaction = chemistry.planReactions(room, gameState);
        if (reaction) {
          chemistry.executeReaction(room, reaction);
        }
      }
    }
  }
});
```

### Pattern 3: Add Defense

```typescript
import { TowerManager } from '@ralphschuler/screeps-defense';

const towerManager = new TowerManager();

kernel.registerProcess({
  id: 'defense',
  priority: 95,
  execute: () => {
    for (const room of Object.values(Game.rooms)) {
      if (room.controller?.my) {
        towerManager.run(room);
      }
    }
  }
});
```

## Troubleshooting

### Issue: High CPU Usage

**Solution**: Reduce process budgets or increase intervals:

```typescript
kernel.registerProcess({
  id: 'expensive-task',
  priority: 50,
  execute: () => { /* ... */ },
  cpuBudget: 0.2,  // Reduce budget
  interval: 10      // Run every 10 ticks
});
```

### Issue: Spawns Not Working

**Solution**: Enable debug mode:

```typescript
const spawnManager = new SpawnManager({ debug: true });
```

Check console output for spawn decisions.

### Issue: Build Errors

**Solution**: Ensure all dependencies are installed:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- **[Framework Documentation](../docs/framework/)** - Learn more about the framework
- **[Developer Guides](../docs/guides/)** - Deep dives into systems
- **[Migration Guide](../docs/framework/migration.md)** - Migrate from other frameworks
- **[API Reference](../docs/api/)** - Complete API documentation

## Support

- **Issues**: [GitHub Issues](https://github.com/ralphschuler/screeps/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ralphschuler/screeps/discussions)
- **Documentation**: [Framework Guide](../docs/framework/)

## License

All examples are released under the [Unlicense](https://unlicense.org/) - public domain.
