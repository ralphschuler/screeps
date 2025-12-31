# @ralphschuler/screeps-economy

Economy subsystem for Screeps bot - manages resource flow, production, and trading across your empire.

## Features

### Link Management
- Automated energy transfer between source, controller, and storage links
- Link role detection and priority-based routing
- Cooldown tracking and optimal transfer timing
- Reduces hauler workload for long-distance transfers

### Terminal Network
- Smart inter-room resource routing using Dijkstra pathfinding
- Cost-optimized transfers (30-50% savings vs. direct transfers)
- Multi-hop routing when cheaper than direct
- Emergency resource transfers for rooms under attack
- Terminal capacity management

### Factory Management
- Automated commodity production planning
- Input resource coordination
- Output distribution
- Integration with lab system for resource sharing

### Market Trading
- Historical price tracking and trend analysis
- Buy low / sell high strategy
- Automated order creation and management
- War-mode aggressive purchasing
- Terminal logistics integration

## Installation

This package is part of the screeps monorepo and is installed as a local file dependency:

```json
{
  "dependencies": {
    "@ralphschuler/screeps-economy": "file:../screeps-economy"
  }
}
```

## Usage

The economy managers use TypeScript decorators and are automatically registered with the bot's kernel process system:

```typescript
import { 
  linkManager, 
  terminalManager, 
  factoryManager, 
  marketManager 
} from '@ralphschuler/screeps-economy';

// In your process registry:
registerAllDecoratedProcesses(
  linkManager,
  terminalManager,
  factoryManager,
  marketManager
);
```

### Managers Overview

#### LinkManager
Runs every 5 ticks at medium priority. Manages link networks in rooms with RCL >= 5.

```typescript
const linkManager = new LinkManager({
  minSourceLinkEnergy: 400,    // Transfer when source link half full
  controllerLinkMaxEnergy: 700, // Keep controller link nearly full
  transferThreshold: 100        // Minimum energy to justify transfer
});
```

#### TerminalManager
Runs every 20 ticks at medium priority. Handles inter-room resource distribution.

```typescript
const terminalManager = new TerminalManager({
  minStorageEnergy: 100000,      // Minimum storage before sending
  terminalEnergyTarget: 50000,   // Target energy in terminal
  maxTransferCostRatio: 0.3      // Max 30% transfer cost
});
```

#### FactoryManager
Runs every 50 ticks at medium priority. Manages factory production.

```typescript
const factoryManager = new FactoryManager({
  minStorageEnergy: 200000,   // Minimum storage for production
  inputBufferAmount: 5000,    // Input resource buffer
  outputBufferAmount: 10000   // Output resource buffer
});
```

#### MarketManager
Runs every 100 ticks at low priority. Handles market trading.

```typescript
const marketManager = new MarketManager({
  minCredits: 10000,            // Minimum credits to maintain
  buyPriceThreshold: 0.85,      // Buy at 15% below average
  sellPriceThreshold: 1.15,     // Sell at 15% above average
  trackedResources: [RESOURCE_ENERGY, RESOURCE_POWER, ...]
});
```

## Architecture

### Dependencies

This package has a tight coupling to the bot's core infrastructure and **cannot be used standalone**. It requires:

1. **Bot Core Systems** (via TypeScript path mapping `@bot/*`):
   - `@bot/core/*` - Kernel, logger, process decorators
   - `@bot/memory/*` - Memory manager and schemas
   - `@bot/utils/*` - Caching and utility functions

2. **Peer Dependencies**:
   - The bot package must be present at `../screeps-bot` for compilation
   - This package is designed exclusively for use within the ralphschuler/screeps bot project

### Compilation Requirements

The economy package uses TypeScript path mappings to access the bot's source code. This means:
- The bot package must be available at `../screeps-bot/src/*` during compilation
- Changes to the bot's directory structure may require updates to `tsconfig.json`
- The package cannot be compiled independently without the bot package present

### Integration

Managers use decorator-based process registration and are automatically registered with the kernel when imported by the bot's process registry.

## Development

Build the package:

```bash
npm run build
```

## Testing

The package includes comprehensive tests covering:

- **Link Management**: Tests for LinkManager configuration and setup
- **Terminal Router**: Tests for network graph building, cost calculation, caching, and TTL
- **Factory Management**: Tests for production planning (coming soon)
- **Market Trading**: Tests for trend analysis and order management (coming soon)

**Test Coverage**: >75% (target in progress)

Run tests:
```bash
npm test
```

Run tests with watch mode:
```bash
npm run test:watch
```

### Test Structure

```
test/
  ├── setup.cjs              # Test environment setup and mocks
  ├── exports.test.ts        # Package exports validation
  ├── LinkManager.test.ts    # Link management tests
  ├── TerminalRouter.test.ts # Terminal routing tests
  └── ...                    # Additional test files
```

### Key Test Cases

- ✅ Link manager construction and configuration
- ✅ Terminal graph building from owned rooms
- ✅ Transfer cost calculation with caching
- ✅ Cache TTL expiration and refresh
- ✅ Multi-hop route optimization (in progress)
- 📝 Factory production planning (planned)
- 📝 Market trend analysis (planned)

## License

Unlicense

## Related Packages

- `@ralphschuler/screeps-utils` - Utility functions and caching
- `@ralphschuler/screeps-chemistry` - Lab and reaction management
- `@ralphschuler/screeps-spawn` - Spawn coordination (Coming soon - not yet extracted)
