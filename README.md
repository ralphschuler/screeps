# Screeps Ant Swarm Bot · [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> An advanced Screeps AI implementation using swarm intelligence and distributed colony management

A sophisticated Screeps bot built with TypeScript that implements swarm-based coordination, emergent behavior through pheromone systems, and multi-shard colony management. The bot is designed to efficiently manage 100+ rooms and 5000+ creeps while maintaining CPU efficiency.

## Features

- **Swarm Architecture**: Distributed colony management with emergent behavior
- **Pheromone System**: Stigmergic communication for decentralized decision-making
- **Multi-Shard Support**: Cross-shard coordination and expansion
- **Resource Efficient**: Optimized for CPU performance with aggressive caching
- **Complete Automation**: Full lifecycle management from RCL1 to RCL8
- **Advanced Combat**: Defensive and offensive capabilities with boost system
- **Market Integration**: Automated trading and resource management

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

# Install dependencies
npm install

# Navigate to the bot package
cd packages/screeps-bot

# Install bot dependencies
npm install
```

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
│   ├── screeps-server/        # Docker setup for private server
│   └── screeps-influx-exporter/ # Metrics exporter
├── ROADMAP.md                 # Development roadmap
└── package.json               # Root package configuration
```

### Setting up Dev Environment

1. **Configure credentials**: Copy the example environment file and add your Screeps credentials

```shell
cd packages/screeps-bot
cp .env.example .env
# Edit .env with your credentials (SCREEPS_TOKEN or SCREEPS_USERNAME/SCREEPS_PASS)
```

2. **Build the project**:

```shell
npm run build
```

3. **Deploy to Screeps**:

```shell
npm run push
```

### Development Workflow

- **Lint your code**: `npm run lint`
- **Run tests**: `npm test`
- **Watch mode**: `npm run watch` (auto-builds and deploys on file changes)
- **Build only**: `npm run build`

### Running Tests

```shell
# Run all tests
npm test

# Run unit tests only
npm run test-unit

# Run integration tests (requires setup)
npm run test-integration
```

Tests are located in `packages/screeps-bot/test/` and use Mocha with Chai assertions.

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
- `packages/screeps-influx-exporter/.env.example`

## Architecture

The bot follows a layered architecture as defined in [ROADMAP.md](./ROADMAP.md):

1. **Global Meta-Layer**: Multi-shard empire coordination
2. **Shard-Strategic Layer**: Per-shard resource allocation
3. **Cluster/Colony Layer**: Regional colony coordination
4. **Room Layer**: Individual room management
5. **Creep/Squad Layer**: Unit-level behavior

Key design principles:
- **Decentralization**: Each room has autonomous control logic
- **Event-driven**: Efficient reactive behavior
- **Aggressive caching**: Minimize CPU with TTL-based caching
- **CPU bucket management**: Adaptive behavior based on CPU availability

## Documentation

- [ROADMAP.md](./ROADMAP.md) - Comprehensive development roadmap and architecture
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [packages/screeps-bot/docs/](./packages/screeps-bot/docs/) - Detailed technical documentation

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
- InfluxDB for metrics
- Grafana for visualization

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
