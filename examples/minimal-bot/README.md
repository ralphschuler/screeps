# Minimal Screeps Bot Example

This is a minimal example of a Screeps bot built using the `@ralphschuler/screeps` framework packages.

## Features

This example bot demonstrates:

- **Automated Spawning**: Uses `@ralphschuler/screeps-spawn` for intelligent creep spawning
- **Link Network**: Uses `@ralphschuler/screeps-economy` for automated link management (RCL 5+)
- **Basic Economy**: Implements harvesters, haulers, upgraders, and builders
- **Clean Code**: Simple, readable code structure perfect for learning

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Screeps Credentials

Create a `.screeps.json` file in this directory:

```json
{
  "main": {
    "email": "your-email@example.com",
    "password": "your-password",
    "branch": "default",
    "ptr": false
  }
}
```

Or use environment variables:
```bash
export SCREEPS_EMAIL="your-email@example.com"
export SCREEPS_PASSWORD="your-password"
```

### 3. Build and Deploy

```bash
# Build only
npm run build

# Build and watch for changes
npm run watch

# Build and deploy to Screeps
npm run push
```

## Code Structure

```
minimal-bot/
├── main.ts           # Main game loop and bot logic
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── rollup.config.js  # Build configuration
└── README.md         # This file
```

## How It Works

### Main Loop

The bot's main loop (`loop()` function) runs every game tick and:

1. Cleans up memory for dead creeps
2. Processes each owned room
3. Runs behavior logic for each creep

### Room Management

For each room, the bot:

- Builds spawn requests based on current needs
- Processes spawn queue using `SpawnManager`
- Manages link network (if RCL 5+)
- Displays room statistics

### Creep Roles

The bot implements four basic roles:

**Harvester** (Priority: 100)
- Harvests energy from sources
- 2 harvesters per source

**Hauler** (Priority: 90)
- Transfers energy from dropped resources to spawns/extensions
- 2-3 haulers depending on room size

**Upgrader** (Priority: 80)
- Upgrades room controller
- 3 upgraders per room

**Builder** (Priority: 70)
- Constructs buildings
- Repairs damaged structures
- 2 builders per room

## Framework Usage

### SpawnManager

The bot uses `SpawnManager` from `@ralphschuler/screeps-spawn`:

```typescript
import { SpawnManager, SpawnRequest } from '@ralphschuler/screeps-spawn';

const spawnManager = new SpawnManager({
  debug: false,
  rolePriorities: {
    harvester: 100,
    hauler: 90,
    upgrader: 80,
    builder: 70
  }
});

// Build spawn requests
const requests: SpawnRequest[] = buildSpawnRequests(room);

// Process queue
spawnManager.processSpawnQueue(spawns, requests);
```

### LinkManager

The bot uses `linkManager` from `@ralphschuler/screeps-economy`:

```typescript
import { linkManager } from '@ralphschuler/screeps-economy';

// Automatically manages link energy transfers
if (room.controller.level >= 5) {
  linkManager.run(room);
}
```

## Extending the Bot

This minimal bot is designed to be extended. Here are some ideas:

### Add Defense

```typescript
import { defenseManager } from '@ralphschuler/screeps-defense';

// In runRoom()
if (room.find(FIND_HOSTILE_CREEPS).length > 0) {
  defenseManager.run(room);
}
```

### Add Chemistry

```typescript
import { ChemistryManager } from '@ralphschuler/screeps-chemistry';

const chemistry = new ChemistryManager();

// In runRoom() for rooms with labs
if (room.controller.level >= 6) {
  chemistry.planReactions(room, gameState);
}
```

### Add Process Management

```typescript
import { Kernel } from '@ralphschuler/screeps-kernel';

const kernel = new Kernel({ cpuBudget: 10 });
kernel.registerProcess(linkManager);
kernel.run(); // In main loop
```

## Performance

This minimal bot is designed for efficiency:

- **CPU Usage**: ~0.5-1.0 CPU per room
- **Memory**: Minimal memory footprint
- **Scalability**: Can handle 5-10 rooms easily

For larger empires, consider:
- Adding the kernel for CPU budget management
- Implementing more sophisticated role logic
- Using task-based creep management

## Troubleshooting

### Creeps not spawning

- Check that spawn queue is being built correctly
- Verify room has enough energy
- Enable debug mode: `debug: true` in SpawnManager config

### Links not working

- Ensure room is RCL 5+
- Verify links are placed correctly
- Check that linkManager is being called

### Build errors

- Ensure all dependencies are installed: `npm install`
- Check TypeScript version compatibility
- Verify rollup configuration

## Next Steps

1. **Learn the framework**: Read [FRAMEWORK.md](../../FRAMEWORK.md)
2. **Explore packages**: Check individual package READMEs
3. **Add features**: Extend the bot with additional framework packages
4. **Optimize**: Profile CPU usage and optimize hot paths

## Resources

- [Framework Documentation](../../FRAMEWORK.md)
- [Screeps Documentation](https://docs.screeps.com/)
- [Screeps API Reference](https://docs.screeps.com/api/)
- [Community Wiki](https://wiki.screepspl.us/)

## License

Unlicense - Public Domain
