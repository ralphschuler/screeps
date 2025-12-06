# Contributing to Screeps Ant Swarm Bot

Thank you for your interest in contributing to this project!

Please see the main [Contributing Guidelines](../../CONTRIBUTING.md) in the root of the repository for detailed information on:

- Code of Conduct
- Development workflow
- Git workflow and branching strategy
- Commit message guidelines
- Code style and formatting
- Testing requirements
- Pull request process

## Bot-Specific Guidelines

When contributing to the bot code specifically:

1. **Follow the architecture** defined in [ROADMAP.md](../../ROADMAP.md)
2. **Write tests** for new functionality (see `test/` directory)
3. **Run linter** before submitting: `npm run lint`
4. **Document complex logic** with clear comments
5. **Consider CPU performance** - this bot is optimized for efficiency
6. **Test your changes** both in simulation and on a test server

## Quick Start for Contributors

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Run tests
npm test

# Build the code
npm run build
```

## Architecture Overview

The bot follows a layered architecture with these key principles:
- **Decentralization**: Each room manages itself autonomously
- **Pheromone-based coordination**: Stigmergic communication between components
- **CPU efficiency**: Aggressive caching and event-driven logic
- **Modularity**: Clear separation of concerns

See [ROADMAP.md](../../ROADMAP.md) for complete architecture documentation.

## Additional Resources

- [Main README](../../README.md)
- [Project Roadmap](../../ROADMAP.md)
- [State Machine Documentation](docs/STATE_MACHINE.md)
- [Screeps Documentation](https://docs.screeps.com/)

---

For any questions, please open an issue or refer to the main [Contributing Guidelines](../../CONTRIBUTING.md).
