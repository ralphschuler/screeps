# @ralphschuler/screeps-empire

Empire-layer management for multi-room coordination in Screeps.

This package provides standalone, reusable implementations of empire-level managers that can be integrated into any Screeps bot architecture.

## Features

- **Pixel Management**: Automated pixel acquisition through market purchases and CPU bucket generation
- **Threat Prediction**: Hostile pattern analysis and attack prediction
- **Decoupled Architecture**: No dependencies on specific bot architectures (works with any memory/process system)

## Installation

```bash
npm install @ralphschuler/screeps-empire
```

## Usage

### Pixel Buying Manager

Automatically purchases pixels from the market when the empire has surplus resources.

```typescript
import { 
  PixelBuyingManager,
  PixelBuyingMemoryAccessor 
} from '@ralphschuler/screeps-empire';

// Implement memory accessor for your bot
class MyMemoryAccessor implements PixelBuyingMemoryAccessor {
  getPixelBuyingMemory() {
    return Memory.empire?.pixelBuying;
  }
  
  ensurePixelBuyingMemory() {
    if (!Memory.empire) Memory.empire = {};
    if (!Memory.empire.pixelBuying) {
      Memory.empire.pixelBuying = {
        lastPurchaseTick: 0,
        totalPixelsPurchased: 0,
        totalCreditsSpent: 0,
        purchaseHistory: [],
        lastScan: 0
      };
    }
  }
}

// Create and use the manager
const pixelManager = new PixelBuyingManager(
  { 
    enabled: true,
    maxPixelPrice: 5000,
    targetPixelPrice: 2000
  },
  new MyMemoryAccessor()
);

// Run each tick (or at your desired interval)
pixelManager.run();

// Check stats
const stats = pixelManager.getStats();
console.log(`Total pixels purchased: ${stats.totalPurchased}`);
```

### Pixel Generation Manager

Automatically generates pixels from CPU bucket when it's been full for 25+ ticks.

```typescript
import { 
  PixelGenerationManager,
  PixelGenerationMemoryAccessor 
} from '@ralphschuler/screeps-empire';

// Implement memory accessor
class MyMemoryAccessor implements PixelGenerationMemoryAccessor {
  getPixelGenerationMemory() {
    return global._pixelGeneration;
  }
  
  ensurePixelGenerationMemory() {
    if (!global._pixelGeneration) {
      global._pixelGeneration = {
        bucketFullSince: 0,
        consecutiveFullTicks: 0,
        totalPixelsGenerated: 0,
        lastGenerationTick: 0
      };
    }
  }
}

const pixelGen = new PixelGenerationManager(
  { enabled: true },
  new MyMemoryAccessor()
);

// Run every tick to track consecutive bucket fullness
pixelGen.run();
```

### Threat Predictor

Analyzes hostile creep patterns and predicts potential threats to owned rooms.

```typescript
import { 
  ThreatPredictor,
  RoomIntelAccessor 
} from '@ralphschuler/screeps-empire';

// Implement room intel accessor
class MyRoomIntelAccessor implements RoomIntelAccessor {
  updateThreatLevel(roomName: string, threatLevel: 0 | 1 | 2 | 3) {
    // Update your room intelligence system
    Memory.rooms[roomName].threatLevel = threatLevel;
  }
}

const threatPredictor = new ThreatPredictor(
  {
    minThreatStrength: 5,
    confidenceThreshold: 0.6
  },
  new MyRoomIntelAccessor()
);

// Run periodically (e.g., every 20 ticks)
if (Game.time % 20 === 0) {
  threatPredictor.run();
}

// Get predictions for a room
const predictions = threatPredictor.getPredictionsForRoom('W1N1');
for (const pred of predictions) {
  console.log(`Threat from ${pred.enemyPlayer}: level ${pred.threatLevel}`);
}
```

## Architecture

This package follows the **dependency inversion principle**: 
- Core logic has no dependencies on specific memory or process systems
- Interfaces define contracts for memory access and room intelligence
- Your bot implements these interfaces to integrate with your systems

This allows:
- ✅ Use in any Screeps bot architecture
- ✅ Easy testing with mocked dependencies
- ✅ No coupling to specific framework implementations
- ✅ Reusability across different bot projects

## API Reference

### Pixel Management

#### `PixelBuyingManager`
- `run()`: Execute pixel buying logic
- `getStats()`: Get purchase statistics
- `canBuyPixels()`: Check if buying is currently possible
- `enable()` / `disable()`: Control buying behavior
- `updateConfig(config)`: Update configuration

#### `PixelGenerationManager`
- `run()`: Execute pixel generation logic
- `getStats()`: Get generation statistics
- `enable()` / `disable()`: Control generation behavior
- `updateConfig(config)`: Update configuration

### Threat Prediction

#### `ThreatPredictor`
- `run()`: Execute threat analysis
- `getPredictionsForRoom(roomName)`: Get predictions for a specific room
- `getAllPredictions()`: Get all active predictions
- `getHostileTracksForPlayer(username)`: Get tracked hostiles for a player

## Testing

```bash
npm test
```

## Contributing

This package is part of the [ralphschuler/screeps](https://github.com/ralphschuler/screeps) monorepo.

## License

Unlicense
