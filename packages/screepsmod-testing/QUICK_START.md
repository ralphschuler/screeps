# Quick Start Guide

Get started with screepsmod-testing in 5 minutes!

## Prerequisites

- Working Screeps performance server setup
- Node.js 16+ installed
- Basic understanding of Screeps API

## Step 1: Build the Mod

```bash
cd packages/screepsmod-testing
npm install
npm run build
```

## Step 2: Add to Server Configuration

Add the mod to your `config.yml` (either in `packages/screeps-bot/config.yml` for performance testing or `packages/screeps-server/config.yml` for your private server):

```yaml
mods:
  - screepsmod-auth
  - screepsmod-admin-utils
  # ... other mods ...
  - ../screepsmod-testing  # Add this line

# Configure the mod (optional)
screepsmod:
  testing:
    autoRun: true      # Run tests automatically
    testInterval: 0    # Run once (0) or every N ticks
```

## Step 3: Write Your First Test

Create a test file in your bot code (e.g., `tests/first-test.ts`):

```typescript
import { describe, it, expect } from 'screepsmod-testing';

describe('My First Test Suite', () => {
  it('should access game state', () => {
    expect(Game.time).toBeGreaterThan(0);
    console.log(`Test running at tick ${Game.time}`);
  });

  it('should count my rooms', () => {
    let count = 0;
    for (const roomName in Game.rooms) {
      if (Game.rooms[roomName].controller?.my) {
        count++;
      }
    }
    console.log(`I control ${count} rooms`);
    expect(count).toBeGreaterThan(0);
  });
});
```

## Step 4: Import Tests in Your Bot

In your bot's main entry point (e.g., `main.ts` or during initialization):

```typescript
// Import your test files so they register with the framework
// This can be conditional to only load in test environments
if (process.env.NODE_ENV === 'test' || Game.shard.name === 'shard0') {
  require('./tests/first-test');
}

// Your normal bot code continues...
export function loop() {
  // Bot logic
}
```

Or create a separate test registration file:

```typescript
// tests/register.ts
import './first-test';
import './spawn-tests';
import './defense-tests';
// Import all your test files here
```

Then import it in your main file:

```typescript
// main.ts
import './tests/register';

export function loop() {
  // Bot logic
}
```

## Step 5: Run the Server

Start your Screeps performance server:

```bash
cd packages/screeps-bot
npm run test:performance
```

Or start your private server:

```bash
cd packages/screeps-server
docker-compose up
```

## Step 6: View Test Results

Watch the server console output. You should see:

```
[screepsmod-testing] Mod loaded
[screepsmod-testing] Tests will run once on first tick
[screepsmod-testing] Loading tests...
[screepsmod-testing] Loaded 1 test suites
[screepsmod-testing]   - My First Test Suite (2 tests)
[screepsmod-testing] Running tests at tick 1
[screepsmod-testing] Running suite: My First Test Suite
[screepsmod-testing] ✓ My First Test Suite > should access game state (5ms)
[screepsmod-testing] ✓ My First Test Suite > should count my rooms (3ms)

[screepsmod-testing] ========================================
[screepsmod-testing] Test Summary
[screepsmod-testing] ========================================
[screepsmod-testing] Total:   2
[screepsmod-testing] Passed:  2
[screepsmod-testing] Failed:  0
[screepsmod-testing] Skipped: 0
[screepsmod-testing] Duration: 8ms (0 ticks)
[screepsmod-testing] ========================================
```

## Example: Testing Spawn Logic

```typescript
import { describe, it, expect, Assert } from 'screepsmod-testing';

describe('Spawn System', () => {
  it('should have spawns in controlled rooms', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.controller.level >= 1) {
        const spawns = room.find(FIND_MY_SPAWNS);
        Assert.greaterThan(spawns.length, 0, 
          `Room ${roomName} should have at least one spawn`);
      }
    }
  });

  it('should not over-spawn creeps', () => {
    for (const name in Game.spawns) {
      const spawn = Game.spawns[name];
      const room = spawn.room;
      const creeps = room.find(FIND_MY_CREEPS);
      
      // Assuming max 50 creeps per room
      Assert.lessThan(creeps.length, 55, 
        `Room ${room.name} should not exceed creep limit`);
    }
  });
});
```

## Example: Testing Creep Roles

```typescript
describe('Creep Management', () => {
  it('should assign roles to all creeps', () => {
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      Assert.isNotNullish(creep.memory.role,
        `Creep ${name} should have a role assigned`);
    }
  });

  it('should have balanced role distribution', () => {
    const roles: Record<string, number> = {};
    
    for (const name in Game.creeps) {
      const role = Game.creeps[name].memory.role;
      roles[role] = (roles[role] || 0) + 1;
    }
    
    console.log('Role distribution:', JSON.stringify(roles));
    
    // Should have at least harvesters
    expect(roles.harvester || 0).toBeGreaterThan(0);
  });
});
```

## Example: Testing Defense

```typescript
describe('Defense System', () => {
  it('should have towers at RCL 3+', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my && room.controller.level >= 3) {
        const towers = room.find(FIND_MY_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_TOWER
        });
        Assert.greaterThan(towers.length, 0,
          `Room ${roomName} RCL ${room.controller.level} should have towers`);
      }
    }
  });

  it('should respond to hostiles', () => {
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      if (room.controller?.my) {
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
          const towers = room.find(FIND_MY_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_TOWER
          });
          const hasSafeMode = (room.controller.safeMode || 0) > 0;
          Assert.isTrue(towers.length > 0 || hasSafeMode,
            `Room ${roomName} should defend against ${hostiles.length} hostiles`);
        }
      }
    }
  });
});
```

## Console Commands

You can manually control tests from the game console:

```javascript
// List all registered tests
listTests()

// Run all tests manually
runTests()

// Get test summary
getTestSummary()

// Clear test results
clearTests()
```

## Tips

1. **Start Simple**: Begin with basic assertions that validate game state
2. **Test Real Behavior**: Don't test implementation details, test outcomes
3. **Use Conditions**: Check for room levels, game time, etc. before asserting
4. **Be Flexible**: Don't use exact values, use ranges and comparisons
5. **Log Output**: Use console.log to debug and understand test behavior

## Next Steps

- Read the full [README](./README.md) for complete API documentation
- Check out the [examples](./examples/) directory for more test patterns
- Read the [Migration Guide](./MIGRATION_GUIDE.md) if converting unit tests
- Write tests for your bot's specific logic and systems

## Troubleshooting

**Tests don't run:**
- Check that the mod is listed in `config.yml`
- Verify `npm run build` completed successfully
- Check server logs for mod loading messages
- Ensure your test files are imported in your bot code

**Tests fail:**
- Game state may not be fully initialized (check `Game.time`)
- Room may not be at expected RCL level
- Add conditional checks before assertions
- Review test output for specific error messages

**Mod not loading:**
- Check mod path in config.yml (should be relative like `../screepsmod-testing`)
- Ensure `dist/backend.js` exists (run `npm run build`)
- Check for TypeScript errors in build output
- Verify Node.js version compatibility

## Support

For issues or questions:
- Check the [README](./README.md) documentation
- Review the [examples](./examples/) directory
- Look at the [Migration Guide](./MIGRATION_GUIDE.md) for patterns
- Open an issue in the repository
