# Screeps Ant Swarm Bot

An advanced Screeps AI implementation using swarm intelligence, pheromone-based coordination, and distributed colony management. Built with TypeScript for type safety and maintainability.

## Features

- **Swarm-Based Architecture**: Decentralized decision-making with emergent behavior
- **Pheromone System**: Stigmergic communication for efficient coordination
- **Multi-Shard Support**: Cross-shard empire management
- **CPU Efficient**: Optimized for managing 100+ rooms and 5000+ creeps
- **Full Automation**: Complete lifecycle from RCL1 to RCL8
- **Advanced Combat**: Defensive and offensive capabilities with boost system
- **Market Integration**: Automated trading and resource management

## Prerequisites

- [Node.js](https://nodejs.org/en/download) (v16.x or v18.x recommended)
- Package Manager: [npm](https://docs.npmjs.com/getting-started/installing-node) or [Yarn](https://yarnpkg.com/en/docs/getting-started)
- A Screeps account (official server or private server)

## Quick Start

### Installation

```bash
# Install dependencies
npm install
```

### Configuration

1. **Set up environment variables**: Copy the example file and configure your Screeps credentials

```bash
cp .env.example .env
# Edit .env with your Screeps credentials
```

Alternatively, you can set environment variables directly:

```bash
export SCREEPS_TOKEN=your_token_here
# or
export SCREEPS_USERNAME=your_username
export SCREEPS_PASS=your_password
```

2. **Choose your deployment target** (optional):

```bash
export SCREEPS_BRANCH=main  # default branch name
export SCREEPS_HOSTNAME=screeps.com  # or your private server
```

### Build and Deploy

```bash
# Build the code (generates dist/main.js and dist/main.js.map.js)
npm run build

# Build and deploy to Screeps API
npm run push

# Watch mode - auto-build and deploy on file changes
npm run watch
```

**Note**: The `dist/` folder is tracked in git to support Screeps GitHub integration. After building, commit the updated dist files if you want Screeps to sync from GitHub.

### Development Workflow

1. **Run linter** to check code quality:
   ```bash
   npm run lint
   ```

2. **Run tests** to verify functionality:
   ```bash
   npm test
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Deploy to Screeps**:
   ```bash
   npm run push
   ```

#### Important Notes

- To upload code to a **private server**, you must have [screepsmod-auth](https://github.com/ScreepsMods/screepsmod-auth) installed and configured
- The bot uses environment variables for configuration (no `screeps.json` file needed)
- Configuration is handled via `rollup.config.js` reading from environment variables
- **GitHub Sync**: The `dist/` folder is tracked in git to enable Screeps GitHub integration. When you connect your Screeps account to this repository, it will automatically sync the built JavaScript files

## Architecture

The bot implements a comprehensive **swarm-based architecture** as specified in the root [ROADMAP.md](../../ROADMAP.md) (24 sections).

**For complete architecture documentation and compliance verification, see [ROADMAP_COMPLIANCE.md](ROADMAP_COMPLIANCE.md).**

### Core Architecture Principles

**Swarm Intelligence**: Emergent behavior through local rules and pheromone-based coordination
- **9 Pheromone Types**: expand, harvest, build, upgrade, defense, war, siege, logistics, nukeTarget
- 8 core types from ROADMAP + 1 extension (nukeTarget) for nuclear warfare coordination
- **Stigmergic Communication**: Indirect coordination via Room.memory pheromone values
- **Event-Driven Updates**: Pheromones respond to hostiles, nukes, structure destruction
- **Decay & Diffusion**: Pheromones decay over time and propagate to neighboring rooms

**Process Management**: Kernel-based scheduling with priority and CPU budgeting
- **Kernel**: Central process scheduler with wrap-around queue ensuring fair CPU allocation
- **Process Types**: Creeps, rooms, empire managers, market, labs, etc.
- **CPU Budgeting**: Each process has allocated CPU budget and minimum bucket requirements
- **Fair Execution**: Wrap-around queue guarantees all processes eventually run, even under CPU pressure
- **Bucket Modes**: Critical, Low, Normal, High - adapts behavior to CPU availability

**Layered Architecture** (5 layers from Empire to Creep):

1. **Global Meta-Layer**: Multi-shard empire coordination (ROADMAP Section 3.1)
2. **Shard-Strategic Layer**: Per-shard CPU allocation and strategy (ROADMAP Section 3.2)
3. **Cluster/Colony Layer**: Regional coordination between adjacent rooms (ROADMAP Section 3.3)
4. **Room Layer**: Individual room management (economy, defense, construction) - runs as kernel processes (ROADMAP Section 3.4)
5. **Creep/Squad Layer**: Unit-level behavior and coordination - each creep is a kernel process (ROADMAP Section 3.5)

### Console Commands

The bot provides an extensive set of console commands for debugging and management. Commands are **lazy-loaded by default** to reduce initialization CPU cost.

#### Using Commands

Commands are automatically loaded when you call `help()` or any command for the first time:

```javascript
help()  // Shows all available commands (triggers lazy loading)
showKernelStats()  // View kernel statistics and CPU usage
showCreepStats()  // View creep process statistics by priority
showRoomStats()  // View room process statistics
listCreepProcesses('harvester')  // List harvester processes
listProcesses()  // List all kernel processes
```

#### Lazy Loading

Console commands are lazy-loaded to save CPU during bot initialization:
- **Default behavior**: Commands register only when first accessed via `help()` or direct call
- **CPU savings**: ~0.3-0.8 CPU saved per tick during initialization
- **Configuration**: Set `lazyLoadConsoleCommands: false` in config to disable

See [LAZY_LOADING_COMMANDS.md](LAZY_LOADING_COMMANDS.md) for detailed documentation.

### ROADMAP Compliance

This bot is **100% compliant** with the swarm architecture specified in [ROADMAP.md](../../ROADMAP.md):
- ✅ All 24 sections fully implemented
- ✅ Memory schemas match specification
- ✅ Pheromone system complete
- ✅ POSIS OS integration
- ✅ Screepers Standards support

See [ROADMAP_COMPLIANCE.md](ROADMAP_COMPLIANCE.md) for detailed compliance verification.

## Project Structure

```
src/
├── core/           # Core systems
│   ├── kernel.ts               # Central process scheduler
│   ├── creepProcessManager.ts  # Creep process registration
│   ├── roomProcessManager.ts   # Room process registration
│   ├── scheduler.ts            # Task scheduling
│   ├── logger.ts               # Logging system
│   └── ...
├── memory/         # Memory management and schemas
├── roles/          # Creep role behaviors
├── clusters/       # Colony cluster management
├── empire/         # Empire-wide coordination
├── labs/           # Lab and boost systems
├── defense/        # Defense and combat systems
├── layouts/        # Base planning and blueprints
├── config/         # Configuration and tuning
└── visuals/        # Debug visualizations
```

### Task System (Optional)

The repository includes an optional **task-based architecture** for creep management in `packages/screeps-tasks`:

- **Action-based composition**: Build creep behaviors from atomic actions (Harvest, Transfer, Build, etc.)
- **TaskManager**: Create, execute, and manage task lifecycles
- **Task queues and priorities**: Advanced task scheduling and prioritization
- **Memory persistence**: Tasks persist across ticks
- **Extensible**: Create custom actions for specific behaviors

**Note**: The main bot currently uses a **behavior-based approach** via kernel processes. The task system is available as an alternative architecture pattern but is not currently integrated into the main bot implementation. See `packages/screeps-tasks/README.md` for usage examples.

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test-unit

# Run integration tests
npm run test-integration

# Run performance tests (requires Docker)
npm run test:performance
```

Tests are located in the `test/` directory and use Mocha with Chai assertions.

### Performance Testing

The bot includes comprehensive automated performance testing to ensure CPU efficiency and detect regressions.

**Quick Start:**
```bash
npm run build
npm run test:performance
```

**Documentation:**
- 📘 **[Performance Testing Guide](PERFORMANCE_TESTING_GUIDE.md)** - Comprehensive guide for developers and AI agents
- 📊 **[Performance Baselines](PERFORMANCE_BASELINES.md)** - Target vs. actual performance metrics
- 🔧 **[Performance Testing Reference](PERFORMANCE_TESTING.md)** - Technical reference and detailed documentation

**Key Features:**
- ✅ Automated CI/CD integration (runs on every PR)
- ✅ Regression detection (>10% CPU increase blocks merges)
- ✅ Performance baselines tracked in Git
- ✅ Supports ROADMAP.md targets (≤0.1 CPU per eco room)
- ✅ Grafana monitoring integration

**CI/CD Integration:**
Performance tests automatically run on pull requests and report results as PR comments. Baselines are automatically updated when changes merge to main/develop branches.

**See**: [PERFORMANCE_TESTING_GUIDE.md](PERFORMANCE_TESTING_GUIDE.md) for complete documentation including:
- Creating custom test scenarios
- Interpreting performance reports
- Troubleshooting common issues
- Best practices for performance testing

## Code Style

This project uses:
- **ESLint** for code quality (`.eslintrc.js`)
- **Prettier** for code formatting (`.prettierrc`)
- **TypeScript strict mode** for type safety

Run linting:
```bash
npm run lint
```

## Configuration

Bot behavior can be tuned via configuration files in `src/config/`:
- CPU budgets and thresholds
- Spawn priorities
- Combat behavior
- Market strategy
- Pheromone system parameters

## Documentation

### Bot Documentation
- [ROADMAP Compliance](ROADMAP_COMPLIANCE.md) - Architecture compliance verification
- [Performance Testing Guide](PERFORMANCE_TESTING_GUIDE.md) - Comprehensive performance testing documentation
- [Performance Baselines](PERFORMANCE_BASELINES.md) - Target vs. actual performance metrics
- [Performance Testing Reference](PERFORMANCE_TESTING.md) - Technical reference
- [Integration Testing](INTEGRATION_TEST_GUIDE.md) - Integration test guide
- [Test Coverage](TEST_COVERAGE.md) - Test coverage documentation
- [Lazy Loading Commands](LAZY_LOADING_COMMANDS.md) - Console commands documentation
- [Logging Guidelines](LOGGING_GUIDELINES.md) - Logging best practices
- [State Machine Documentation](docs/STATE_MACHINE.md) - State machine patterns

### Repository Documentation
- [Main Repository README](../../README.md)
- [Development Roadmap](../../ROADMAP.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)
- [Agents Documentation](../../AGENTS.md) - AI agent workflows

## Type Definitions

The type definitions for Screeps come from [@types/screeps](https://www.npmjs.com/package/@types/screeps), which are maintained in the [typed-screeps](https://github.com/screepers/typed-screeps) repository. If you find a problem or have a suggestion, please open an issue there.

## Contributing

Issues, Pull Requests, and contributions are welcome! See our [Contributing Guidelines](../../CONTRIBUTING.md) for more details.

## License

This project is licensed under the Unlicense - see the [LICENSE](../../LICENSE) file for details.

## Acknowledgments

- Based on [screeps-typescript-starter](https://github.com/screepers/screeps-typescript-starter)
- Inspired by the Screeps community and various open-source bots
