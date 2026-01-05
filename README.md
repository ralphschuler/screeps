# Screeps Ant Swarm Bot

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Tests](https://github.com/ralphschuler/screeps/actions/workflows/test.yml/badge.svg)](https://github.com/ralphschuler/screeps/actions/workflows/test.yml)
[![Lint](https://github.com/ralphschuler/screeps/actions/workflows/lint.yml/badge.svg)](https://github.com/ralphschuler/screeps/actions/workflows/lint.yml)
[![Bundle Size](https://github.com/ralphschuler/screeps/actions/workflows/bundle-size.yml/badge.svg)](https://github.com/ralphschuler/screeps/actions/workflows/bundle-size.yml)
[![Performance Tests](https://github.com/ralphschuler/screeps/actions/workflows/performance-test.yml/badge.svg)](https://github.com/ralphschuler/screeps/actions/workflows/performance-test.yml)
[![CPU Budget: Eco Room](https://img.shields.io/badge/CPU%20Budget%20(Eco)-≤0.1-success?style=flat-square)](https://ralphschuler.grafana.net/public-dashboards/d0bc9548d02247889147e0707cc61e8f)
[![CPU Budget: War Room](https://img.shields.io/badge/CPU%20Budget%20(War)-≤0.25-success?style=flat-square)](https://ralphschuler.grafana.net/public-dashboards/d0bc9548d02247889147e0707cc61e8f)

> An advanced Screeps AI implementation using swarm intelligence and distributed colony management

A sophisticated Screeps bot built with TypeScript that implements swarm-based coordination, emergent behavior through pheromone systems, and multi-shard colony management. The bot is designed to efficiently manage 100+ rooms and 5000+ creeps while maintaining CPU efficiency.

**Architecture Documentation**: For detailed architectural decisions and rationale, see [Architecture Decision Records (ADRs)](docs/adr/README.md)

## Links
- [Grafana Dashboard (All)](https://ralphschuler.grafana.net/public-dashboards/1108066fad99495bbb26d67f0d55fe89)
- [Grafana - Room Management](https://ralphschuler.grafana.net/public-dashboards/54f90cd8f73e4613a4a86ca6bce201c2)
- [Grafana - Processes & Systems Monitor](https://ralphschuler.grafana.net/public-dashboards/a0e74e89c47b44689947a45fc3656ca5)
- [Grafana - Empire & Economy](https://ralphschuler.grafana.net/public-dashboards/7145cd15c5b54eed884dd05d76505b97)
- [Grafana - Creeps & Roles Monitor](https://ralphschuler.grafana.net/public-dashboards/05850278241341c699b8e2f4b99e7390)
- [Grafana - CPU & Performance Monitor](https://ralphschuler.grafana.net/public-dashboards/d0bc9548d02247889147e0707cc61e8f)
- [Grafana - AI & Pheromones](https://ralphschuler.grafana.net/public-dashboards/c7ce1e0c6dbe48d58559832cbcad0bcf)
- [Screeps Profile](https://screeps.com/a/#!/profile/TedRoastBeef)

## Performance Metrics

The bot maintains strict CPU budgets to ensure scalability to 100+ rooms:

| Scenario | Target | Current | Status |
|----------|--------|---------|--------|
| Eco Room | ≤0.1 CPU/tick | ~0.08 | ✅ |
| War Room | ≤0.25 CPU/tick | ~0.20 | ✅ |
| 10-Room Empire | ≤1.5 CPU/tick | ~1.20 | ✅ |

**Monitoring:**
- 📊 [CPU & Performance Dashboard](https://ralphschuler.grafana.net/public-dashboards/d0bc9548d02247889147e0707cc61e8f)
- 🔍 Performance tests run automatically on every PR
- 📈 Historical performance trends tracked in `performance-baselines/history/`
- ⚠️ Automated alerts for CPU budget violations

See [PERFORMANCE_TESTING.md](packages/screeps-bot/PERFORMANCE_TESTING.md) for details on running performance tests locally.

## Features

- **Swarm Architecture**: Distributed colony management with emergent behavior
- **Pheromone System**: Stigmergic communication for decentralized decision-making
- **Multi-Shard Support**: Cross-shard coordination and expansion
- **Resource Efficient**: Optimized for CPU performance with aggressive caching
- **Complete Automation**: Full lifecycle management from RCL1 to RCL8
- **Auto-Respawn System**: Automatic respawn detection and optimal shard selection
- **Advanced Combat**: Defensive and offensive capabilities with boost system
- **Market Integration**: Automated trading and resource management
- **MCP Integration**: Model Context Protocol servers for AI-assisted development
  - **screeps-docs-mcp**: Access Screeps API documentation
  - **screeps-mcp**: Live game state and console integration
  - **screeps-wiki-mcp**: Community wiki search and retrieval
  - **grafana-mcp**: Performance monitoring and observability
- **Autonomous Development**: Self-improving bot with automated optimization
  - Daily strategic planning and performance analysis
  - Automated low-risk improvements with safety checks
  - Post-deployment monitoring with automatic rollback
  - Learning from outcomes to improve over time
  - See [docs/AUTONOMOUS_DEVELOPMENT.md](docs/AUTONOMOUS_DEVELOPMENT.md) for details
- **Framework Packages**: Modular, reusable packages for building your own bots
  - See [FRAMEWORK.md](FRAMEWORK.md) for framework documentation

## Installing / Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (v16.x - v20.x, v18.x recommended)
  - Use [nvm](https://github.com/nvm-sh/nvm) for easy version management: `nvm use`
- Package Manager: [npm](https://docs.npmjs.com/getting-started/installing-node) >=8.0.0
- A Screeps account (official server or private server)

### Quick Setup

```shell
# Clone the repository
git clone https://github.com/ralphschuler/screeps.git
cd screeps

# Optional: Check your Node.js and npm versions
npm run check-versions

# Install dependencies for all packages (using npm workspaces)
npm install
```

**Note**: This repository uses [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces) to manage the monorepo. A single `npm install` at the root will install dependencies for all packages.

## Developing

### Built With

- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Rollup](https://rollupjs.org/) - Module bundler
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting
- [Mocha](https://mochajs.org/) - Testing framework

### Project Structure

```
screeps/
├── packages/
│   ├── screeps-bot/          # Main bot implementation
│   ├── screeps-tasks/        # Optional task-based creep management system
│   ├── screeps-docs-mcp/     # MCP server for Screeps API documentation
│   ├── screeps-mcp/          # MCP server for live Screeps game integration
│   ├── screeps-wiki-mcp/     # MCP server for Screeps community wiki
│   ├── screeps-server/       # Docker setup for private server
│   └── screeps-graphite-exporter/ # Metrics exporter to Grafana Cloud
├── ROADMAP.md                # Complete swarm architecture specification (24 sections)
└── package.json              # Root package configuration
```

**Note**: The `screeps-tasks` package provides an optional task-based architecture for creep management with action composition, task queues, and priorities. The main bot uses a behavior-based approach via kernel processes, but the task system is available as an alternative pattern.

### Architecture

The bot implements a comprehensive **swarm-based architecture** as specified in [ROADMAP.md](ROADMAP.md):

- **24 Architectural Sections**: From core vision to advanced features
- **5-Layer Architecture**: Empire → Shard → Cluster → Room → Creep
- **Pheromone Coordination**: 9 pheromone types for emergent behavior (8 from ROADMAP + nukeTarget extension)
- **Kernel-Based Process Management**: Fair CPU allocation and bucket-aware execution
- **POSIS OS Integration**: Portable Operating System Interface for Screeps
- **Screepers Standards Compliance**: SS1, SS2, SS3 for interoperability

For detailed compliance verification, see [packages/screeps-bot/ROADMAP_COMPLIANCE.md](packages/screeps-bot/ROADMAP_COMPLIANCE.md).

### Setting up Dev Environment

1. **Configure credentials**: Copy the example environment file and add your Screeps credentials

```shell
cd packages/screeps-bot
cp .env.example .env
# Edit .env with your credentials (SCREEPS_TOKEN or SCREEPS_USERNAME/SCREEPS_PASS)
cd ../..  # Return to repository root
```

2. **Build the project**:

```shell
# Build all packages (recommended)
npm run build

# Or build specific packages
npm run build:utils
npm run build:chemistry
npm run build:spawn
```

3. **Deploy to Screeps**:

You can deploy using either:
- **GitHub Sync**: Connect your Screeps account to this repository (build files are tracked in git)
- **API Push**: Use `npm run push` to deploy directly via Screeps API

### Development Workflow

**Working with npm Workspaces**:

All npm scripts at the root level now use workspace commands, so you can run everything from the repository root:

```shell
# Lint the main bot
npm run lint

# Run tests for specific packages
npm run test:utils      # Test utils package
npm run test:spawn      # Test spawn package
npm run test:all        # Test all packages

# Build specific packages
npm run build:utils
npm run build:chemistry
npm run build:all       # Build everything

# Watch mode for the bot
npm run watch
```

**Working within a specific package**:

If you need to work on a specific package, you can still navigate to it and run commands directly:

```shell
cd packages/screeps-bot
npm run build           # Build just this package
npm test                # Test just this package
```

### Running Tests

```shell
# Run tests for the main bot
npm test

# Run tests for specific packages
npm run test:utils
npm run test:spawn
npm run test:chemistry
npm run test:mcp

# Run all tests across all packages
npm run test:all

# Run specific test types (bot only)
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests (requires setup)
```

Tests are located in each package's `test/` directory and use Mocha with Chai assertions.

## Configuration

### Bot Configuration

Edit `packages/screeps-bot/src/config/` files to customize:

- **CPU budgets**: Adjust per-room and global CPU limits
- **Spawn priorities**: Control creep spawning behavior
- **Combat settings**: Configure defensive and offensive behavior
- **Market strategy**: Set trading thresholds and priorities
- **Pheromone settings**: Tune swarm coordination parameters

### Environment Variables

For the private server setup and metrics exporter, see:
- `packages/screeps-server/.env.example`
- `packages/screeps-graphite-exporter/.env.example`

## Architecture

The bot follows a layered architecture as defined in [ROADMAP.md](./ROADMAP.md):

1. **Global Meta-Layer**: Multi-shard empire coordination
2. **Shard-Strategic Layer**: Per-shard resource allocation
3. **Cluster/Colony Layer**: Regional colony coordination
4. **Room Layer**: Individual room management
5. **Creep/Squad Layer**: Unit-level behavior

**Architecture Decision Records**: For detailed rationale behind architectural decisions, see [docs/adr/README.md](docs/adr/README.md)

Key architectural decisions documented:
- [POSIS Process Architecture](docs/adr/0001-posis-process-architecture.md) - Process-based OS abstraction
- [Pheromone Coordination System](docs/adr/0002-pheromone-coordination-system.md) - Stigmergic communication
- [Cartographer Traffic Management](docs/adr/0003-cartographer-traffic-management.md) - Pathfinding optimization
- [Five-Layer Swarm Architecture](docs/adr/0004-five-layer-swarm-architecture.md) - Hierarchical organization
- [Memory vs Heap Storage](docs/adr/0005-memory-segment-vs-heap-storage.md) - Storage strategy
- [Cache Strategy and TTL Policy](docs/adr/0006-cache-strategy-and-ttl-policy.md) - Caching implementation
- [Spawn Queue Prioritization](docs/adr/0007-spawn-queue-prioritization.md) - Spawn logic
- [Tower Targeting Algorithm](docs/adr/0008-tower-targeting-algorithm.md) - Defense automation

Key design principles:
- **Decentralization**: Each room has autonomous control logic
- **Event-driven**: Efficient reactive behavior
- **Aggressive caching**: Minimize CPU with TTL-based caching
- **CPU bucket management**: Adaptive behavior based on CPU availability

## MCP Servers

The repository includes three Model Context Protocol (MCP) servers for AI-assisted development:

### screeps-docs-mcp

Browse and query Screeps API documentation and game mechanics via MCP.

```shell
cd packages/screeps-docs-mcp
npm install
npm run build
npm run inspect  # Launch MCP Inspector (requires Node.js 22.7.5+)
```

[Read more →](./packages/screeps-docs-mcp/README.md)

### screeps-mcp

Live Screeps game API integration with console commands, memory operations, and stats.

```shell
cd packages/screeps-mcp
npm install
npm run build
# Configure with environment variables:
export SCREEPS_TOKEN="your-token"
export SCREEPS_HOST="screeps.com"
export SCREEPS_SHARD="shard3"
```

[Read more →](./packages/screeps-mcp/README.md)

### screeps-wiki-mcp

Access the Screeps community wiki with search, article retrieval, and table extraction.

```shell
cd packages/screeps-wiki-mcp
npm install
npm run build
npm run inspect  # Launch MCP Inspector (requires Node.js 22.7.5+)
```

[Read more →](./packages/screeps-wiki-mcp/README.md)

## Auto-Respawn System

The repository includes an automatic respawn system that detects when your account has lost all spawns and automatically respawns you in the optimal location.

### Features

- **Automatic Detection**: Checks world status every 6 hours and after each deployment
- **Smart Shard Selection**: Evaluates available shards based on room availability, competition, and age
- **Optimal Placement**: Searches for the best spawn location near starting rooms
- **Multi-Environment Support**: Works with official servers and private servers

### Setup

1. Configure your environment in GitHub repository settings:
   - Go to **Settings** → **Environments** → `screeps.com`
   - Add secret: `SCREEPS_TOKEN` (your Screeps API token)
   - Optionally add variable: `SCREEPS_HOSTNAME` for custom servers

2. The respawner runs automatically via GitHub Actions:
   - After successful deployments
   - Every 6 hours (scheduled)
   - On-demand via workflow dispatch

For detailed documentation, see [utils/README.md](./utils/README.md).

## Documentation

The project documentation is organized and automatically published to the [GitHub Wiki](https://github.com/ralphschuler/screeps/wiki).

### Documentation Structure

- **[Project Wiki](https://github.com/ralphschuler/screeps/wiki)** - Combined documentation from all sources
- [ROADMAP.md](./ROADMAP.md) - Comprehensive development roadmap and architecture
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [utils/README.md](./utils/README.md) - Auto-respawn system and utilities
- [docs/](./docs/) - General project documentation
  - **[State Machines](./docs/STATE_MACHINES.md)** - Creep behavior architecture and overview
  - **[State Machine Gallery](./docs/STATE_MACHINE_GALLERY.md)** - Visual index of all 26 creep roles with Mermaid diagrams
- [packages/screeps-bot/docs/](./packages/screeps-bot/docs/) - Detailed technical documentation
- Package-specific docs in `packages/*/docs/` directories

### Building Documentation

Documentation is automatically built and published to the wiki when changes are pushed to the `main` branch. To build locally:

```shell
npm run build:docs
```

This aggregates all markdown files from the root `docs/` directory and all package `docs/` directories into a unified wiki format.

For more information, see [docs/README.md](./docs/README.md).

## Private Server Setup

To run a local Screeps server with monitoring:

```shell
cd packages/screeps-server
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d
```

This includes:
- Screeps private server
- MongoDB and Redis
- Grafana Cloud for metrics and visualization

## Code Style

This project uses:
- **ESLint** for code quality (config: `.eslintrc.js`)
- **Prettier** for code formatting (config: `.prettierrc`)
- **TypeScript strict mode** for type safety

Run style checks:
```shell
npm run lint
```

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

Key guidelines:
1. Work in a feature branch
2. Follow existing code style (enforced by ESLint/Prettier)
3. Write tests for new functionality
4. Update documentation as needed
5. Make pull requests to `develop` branch

## Versioning

This project follows [Semantic Versioning](http://semver.org/). For available versions, see the [tags on this repository](https://github.com/ralphschuler/screeps/tags).

## License

This project is licensed under the Unlicense - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Built using [screeps-typescript-starter](https://github.com/screepers/screeps-typescript-starter)
- Architecture inspired by the [Screeps community](https://screeps.com/)
- Development guidelines based on [project guidelines](https://github.com/ralphschuler/project-guidelines)
