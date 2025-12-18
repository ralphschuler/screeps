# TooAngel Diplomacy & Quest System

This module implements integration with the [TooAngel Screeps bot](https://github.com/TooAngel/screeps) for automated diplomacy and cooperative quests.

## Overview

The TooAngel bot provides a reputation-based diplomacy system and quest mechanism for player interaction. This module allows our bot to:

- Automatically detect TooAngel NPC rooms
- Track and request reputation status
- Apply for and complete quests
- Earn rewards and build positive relationships

## Features

### 🤝 Reputation System

- **Automatic Tracking**: Monitor reputation with TooAngel NPCs
- **API Integration**: Request current reputation via terminal
- **Reputation Gains**: Earn reputation through:
  - Resource transfers
  - Quest completions
  - Cooperative actions
- **Reputation Losses**: Track losses from:
  - Attacking TooAngel NPCs
  - Failed quests

### 📋 Quest System

**Currently Supported Quests:**
- ✅ `buildcs` - Build all construction sites in a room

**Planned Support:**
- 🔄 `defend` - Defend a room for specified duration
- 🔄 `attack` - Attack a target room
- 🔄 `sign` - Sign a controller with specified message
- 🔄 `dismantle` - Dismantle specific structures
- 🔄 `transport` - Transport resources to a room
- 🔄 `terminal` - Send resources via terminal
- 🔄 `harvest` - Harvest resources from a room

### 🎮 Console Commands

Access the system via the `tooangel` global object:

```javascript
// Check status
tooangel.status()

// Enable/disable integration
tooangel.enable()
tooangel.disable()

// Reputation management
tooangel.reputation()              // View current reputation
tooangel.requestReputation()       // Request update
tooangel.requestReputation('W1N1') // Request from specific room

// Quest management
tooangel.quests()                  // List active quests
tooangel.npcs()                    // List discovered NPCs
tooangel.apply('quest123', 'W1N1') // Apply for a quest

// Help
tooangel.help()                    // Show all commands
```

## How It Works

### 1. NPC Detection

The system scans controller signs in visible rooms to detect TooAngel NPCs:

```json
{
  "type": "quest",
  "id": "quest123",
  "origin": "W1N1",
  "info": "http://tooangel.github.io/screeps"
}
```

### 2. Quest Lifecycle

1. **Discovery**: Automatic scanning detects available quests
2. **Application**: Bot applies via terminal transfer
3. **Reception**: Quest details received via terminal
4. **Execution**: Creeps assigned to complete the quest
5. **Completion**: Automatic detection and notification

### 3. Terminal Communication

All communication happens via terminal transfers with JSON messages:

**Reputation Request:**
```json
{"type": "reputation"}
```

**Reputation Response:**
```json
{"type": "reputation", "reputation": 1500}
```

**Quest Application:**
```json
{
  "type": "quest",
  "id": "quest123",
  "action": "apply"
}
```

**Quest Details:**
```json
{
  "type": "quest",
  "id": "quest123",
  "room": "W2N2",
  "quest": "buildcs",
  "end": 50000
}
```

## Configuration

### Enable/Disable

By default, the system is enabled. Control it via:

```javascript
// In code
tooAngelManager.enable()
tooAngelManager.disable()

// Via console
tooangel.enable()
tooangel.disable()
```

### CPU Budget

The system runs as a low-frequency kernel process:

- **Frequency**: Every 10 ticks
- **Priority**: LOW
- **Min Bucket**: 2000 (configurable)

### Intervals

- **NPC Scanning**: Every 500 ticks
- **Reputation Requests**: Every 2000 ticks
- **Quest Discovery**: Every 1000 ticks
- **Message Processing**: Every tick (for responsiveness)

## Memory Structure

```typescript
Memory.tooangel = {
  enabled: boolean,
  reputation: {
    value: number,
    lastUpdated: number,
    lastRequestedAt?: number
  },
  npcRooms: {
    [roomName: string]: {
      roomName: string,
      lastSeen: number,
      hasTerminal: boolean,
      availableQuests: string[]
    }
  },
  activeQuests: {
    [questId: string]: {
      id: string,
      type: 'buildcs' | 'defend' | ...,
      status: 'available' | 'applied' | 'active' | 'completed' | 'failed',
      targetRoom: string,
      originRoom: string,
      deadline: number,
      assignedCreeps: string[]
    }
  },
  completedQuests: string[],
  lastProcessedTick: number
}
```

## Implementation

### Module Structure

```
src/empire/tooangel/
├── types.ts                 # Type definitions
├── npcDetector.ts          # NPC room detection
├── reputationManager.ts    # Reputation tracking
├── questManager.ts         # Quest lifecycle
├── questExecutor.ts        # Quest execution (buildcs)
├── tooAngelManager.ts      # Main coordinator
├── consoleCommands.ts      # Console interface
├── index.ts                # Module exports
└── README.md               # This file
```

### Tests

Comprehensive test coverage (19 tests, all passing):

```bash
npm test -- test/unit/tooangel.test.ts
```

Test categories:
- NPC detector parsing
- Quest message parsing
- Reputation response parsing
- Quest type validation
- Integration workflow

## Integration with Bot Systems

### Kernel Process

Registered automatically via `processRegistry.ts`:

```typescript
@LowFrequencyProcess({ priority: ProcessPriority.LOW, interval: 10 })
public run(): void {
  // Process messages, execute quests, scan for NPCs
}
```

### Terminal Manager

Uses existing terminal infrastructure for:
- Sending quest applications
- Requesting reputation updates
- Receiving quest details and completions

### Spawn System

For `buildcs` quests, automatically assigns available builders:
- Searches for idle `larvaWorker` or `builder` creeps
- Assigns up to 3 creeps per quest
- Tracks assignments in quest memory

## API Reference

See [TooAngel API Documentation](https://github.com/TooAngel/screeps/blob/master/doc/API.md) for complete protocol specification.

## Benefits

- 🤝 **Automated Friendship**: No manual configuration needed
- 🎁 **Quest Rewards**: Earn resources and reputation
- 💱 **Resource Exchange**: Safe trading with trusted NPCs
- 🏆 **Reputation Building**: Gain standing in the community
- 🌐 **Private Server Ready**: Full support for private servers
- 🔄 **Low CPU Cost**: Efficient low-frequency processing

## Roadmap

- [ ] Support additional quest types
- [ ] Automatic quest prioritization
- [ ] Multi-room coordinated quests
- [ ] Quest creation (send quests to TooAngel)
- [ ] Integration with alliance system
- [ ] Reputation-based decision making

## Contributing

When adding new quest types:

1. Add type definition to `types.ts`
2. Implement executor in `questExecutor.ts`
3. Add tests to `test/unit/tooangel.test.ts`
4. Update this README with quest details

## License

Part of the main bot repository - see top-level LICENSE file.
