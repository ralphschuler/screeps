# @ralphschuler/screeps-console

Console command framework with decorators and plugin system for Screeps bots.

## Status

`@ralphschuler/screeps-console` is the canonical framework owner for command registration, command decorators, generated help output, and global Screeps console exposure. See [ADR-0009](../../../docs/adr/0009-console-command-registry-ownership.md).

Some built-in command collections still depend on consuming-bot stubs in `interfaces.ts`, but the registry/decorator core is tested in this package.

## Features

- **Decorator-Based Commands**: Use `@Command` decorator to register console commands
- **Plugin-Friendly Collections**: Extensible command collections (economy, market, lab, etc.)
- **Auto-Generated Help**: Automatic `help()` command with usage, examples, and category sorting
- **Global Scope Integration**: Commands exposed to the Screeps console with lazy-loading support
- **Command Categories**: Organized command groups (logging, visualization, stats, etc.)

## Module Guide

- `commandRegistry.ts` - Public registry facade, lazy loading, command execution, and global exposure
- `commandTypes.ts` - Shared command, registered-command, and decorator metadata types
- `decoratorStore.ts` - Isolated storage/lookup for decorator metadata captured before instances exist
- `helpFormatter.ts` - Pure deterministic rendering for registry-level and per-command help
- `consoleCommands.ts` - Built-in command collections wired through decorators
- `interfaces.ts` - Minimal dependency contracts/stubs supplied by a consuming bot

## Installation

```bash
npm install @ralphschuler/screeps-console
```

## Usage

```typescript
import { Command, commandRegistry, registerDecoratedCommands } from '@ralphschuler/screeps-console';

// Define custom commands
class MyCommands {
  @Command({
    name: "test",
    description: "Test command",
    usage: "test()",
    category: "Custom"
  })
  test(): string {
    return "Hello from console!";
  }
}

// Register commands
const myCommands = new MyCommands();
registerDecoratedCommands(myCommands);

// Commands are now available in game console:
// > test()
// "Hello from console!"

// > help()
// [Lists all registered commands with descriptions]
```

## API Reference

### @Command Decorator

Marks a method as a console command.

```typescript
@Command({
  name: string;           // Command name (required)
  description: string;    // Brief description (required)
  usage?: string;         // Usage syntax
  examples?: string[];    // Example invocations
  category?: string;      // Category for grouping
})
```

### commandRegistry

Central registry for console commands.

**Methods:**
- `register(metadata, handler)` - Manually register a command
- `unregister(name)` - Remove a command
- `execute(name, ...args)` - Run a command with error capture
- `getCommand(name)` - Get command by name without triggering lazy loading
- `getCommands()` - Get all registered commands, triggering lazy loading if enabled
- `getCommandsByCategory()` - Get commands grouped by category
- `generateHelp()` / `generateCommandHelp(name)` - Render deterministic help output
- `exposeToGlobal()` - Expose command handlers and `help()` to the global Screeps console
- `enableLazyLoading(callback)` - Defer command registration until first execution/help access
- `reset()` / `clear()` - Clear registry state for tests or compatibility

### registerDecoratedCommands(instance)

Scans one object for `@Command` decorated methods and registers matching bound methods.

### registerAllDecoratedCommands(...instances)

Registers decorated commands from multiple command collection instances.

## Built-in Command Collections

- **LoggingCommands**: Control log output and verbosity
- **VisualizationCommands**: Toggle visual overlays
- **StatsCommands**: View bot statistics and metrics
- **KernelCommands**: Manage kernel processes
- **ConfigCommands**: View/modify bot configuration

## External Dependencies

This package requires the consuming bot to provide:
- Logger implementation
- Kernel process manager
- Stats collection systems
- Visualization managers
- Configuration system

See `interfaces.ts` for required contracts.

## Remaining Extraction Work

- Replace minimal dependency stubs in `interfaces.ts` with stronger consuming-bot adapters.
- Split generic command collections from bot-specific command groups as usage stabilizes.
- Add integration tests from the consuming bot package for full console wiring.

## Contributing

This package is part of the screeps bot modularization effort. See `MODULARIZATION_GUIDE.md` in the repository root for extraction guidelines.

## License

Unlicense
