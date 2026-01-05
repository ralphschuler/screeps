# @ralphschuler/screeps-console

Console command framework with decorators and plugin system for Screeps bots.

## Status

⚠️ **Work in Progress** - This package is partially extracted and requires additional work to complete:

1. **Interface Definitions**: Need to complete stub interfaces to match actual method signatures used in commands
2. **Decorator Support**: Command decorator needs proper TypeScript configuration
3. **Method Signatures**: Many console command methods reference properties/methods not yet stubbed
4. **Integration Testing**: Package needs integration tests with consuming bot

## Features (Planned)

- **Decorator-Based Commands**: Use `@Command` decorator to register console commands
- **Plugin System**: Extensible command collections (economy, market, lab, etc.)
- **Auto-Generated Help**: Automatic help() command with usage and examples
- **Global Scope Integration**: Commands automatically exposed to game console
- **Command Categories**: Organized command groups (logging, visualization, stats, etc.)

## Current Structure

**Extracted Files:**
- `commandRegistry.ts` (492 LOC) - Command registration and decorator system
- `consoleCommands.ts` (1,080 LOC) - Core console commands

**Total:** 1,572 LOC extracted

## Installation

```bash
npm install @ralphschuler/screeps-console
```

## Usage (When Complete)

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
registerDecoratedCommands([myCommands]);

// Commands are now available in game console:
// > test()
// "Hello from console!"

// > help()
// [Lists all registered commands with descriptions]
```

## API Reference (Planned)

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
- `registerCommand(metadata, handler)` - Manually register a command
- `getCommand(name)` - Get command by name
- `getAllCommands()` - Get all registered commands
- `getCategories()` - Get all command categories

### registerDecoratedCommands(objects)

Scans objects for `@Command` decorated methods and registers them.

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

## Completion Tasks

To complete this package extraction:

1. **Fix Interface Signatures**: Update `interfaces.ts` to match all methods used in commands
2. **Fix Decorator Issues**: Resolve TypeScript decorator configuration
3. **Add Missing Methods**: Implement all methods referenced but not defined
4. **Remove Bot-Specific Commands**: Separate truly generic commands from bot-specific ones
5. **Add Tests**: Create unit tests for command registration and execution
6. **Documentation**: Complete API documentation with examples

## Contributing

This package is part of the screeps bot modularization effort. See `MODULARIZATION_GUIDE.md` in the repository root for extraction guidelines.

## License

Unlicense
