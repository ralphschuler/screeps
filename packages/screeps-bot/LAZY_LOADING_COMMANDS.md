# Console Commands Lazy Loading

## Overview

This document describes the lazy loading feature for console commands, which reduces initialization CPU cost by deferring command registration until first use.

## Feature Description

Console commands are now lazy-loaded by default. This means:

1. **On Initialization**: Only the `help()` command is registered
2. **On First Use**: All commands are registered when you call `help()` or any command
3. **CPU Savings**: Reduces initialization CPU by skipping command registration for bots that don't use console commands

## Configuration

Lazy loading is controlled by the `lazyLoadConsoleCommands` flag in the bot configuration:

```typescript
// src/config/index.ts
export const DEFAULT_CONFIG: BotConfig = {
  // ...
  lazyLoadConsoleCommands: true  // Default: enabled
};
```

To disable lazy loading:

```typescript
// In Memory or via console
updateConfig({ lazyLoadConsoleCommands: false });
```

## How It Works

### With Lazy Loading Enabled (Default)

```
Bot Startup (Tick 1):
  ├─ Initialize CommandRegistry
  ├─ Register only help() command
  └─ Expose help() to global scope
  
First Console Command Call:
  ├─ User calls help() or any command
  ├─ Trigger lazy loading
  ├─ Register all command classes
  └─ Expose all commands to global scope
  
Subsequent Calls:
  └─ Commands execute normally (already registered)
```

### With Lazy Loading Disabled

```
Bot Startup (Tick 1):
  ├─ Initialize CommandRegistry
  ├─ Register all command classes (CPU cost here)
  └─ Expose all commands to global scope
  
All Console Commands:
  └─ Execute normally (already registered)
```

## CPU Impact

### Initialization Cost
- **With lazy loading**: ~0.1-0.2 CPU (only help command)
- **Without lazy loading**: ~0.5-1.0 CPU (all commands)

### First Command Call
- **Additional cost on first use**: ~0.3-0.8 CPU (one-time registration)
- **Subsequent calls**: No additional cost

### Recommendation
- **Enable for production bots** that rarely use console
- **Disable for development** if you frequently use console commands

## Testing

### Manual Testing

1. **Test Lazy Loading**:
   ```javascript
   // In Screeps console:
   help()  // Should trigger registration and list all commands
   showStats()  // Should work normally (already registered)
   ```

2. **Test Configuration**:
   ```javascript
   // Disable lazy loading
   updateConfig({ lazyLoadConsoleCommands: false });
   // Next global reset will load all commands immediately
   ```

### Automated Tests

Unit tests for lazy loading are in `test/unit/commandRegistry.test.ts`:

```bash
npm run test:unit
```

## Implementation Details

### Files Modified
- `src/config/index.ts` - Added configuration flag
- `src/core/commandRegistry.ts` - Implemented lazy loading mechanism
- `src/core/consoleCommands.ts` - Added lazy parameter to registration function
- `src/main.ts` - Updated to use config-based lazy loading
- `test/unit/commandRegistry.test.ts` - Added lazy loading tests

### Key Classes

#### CommandRegistry
- `enableLazyLoading(callback)` - Enables lazy mode with registration callback
- `triggerLazyLoad()` - Executes deferred registration on first command call
- `execute(name, ...args)` - Triggers lazy load if needed before executing

#### ConsoleCommands
- `registerAllConsoleCommands(lazy)` - Registers commands immediately or lazily based on flag

## Troubleshooting

### Commands Not Working
If commands aren't available after calling `help()`:
1. Check if lazy loading is enabled: `getConfig().lazyLoadConsoleCommands`
2. Verify help() was called and didn't error
3. Check console logs for "Lazy loading console commands" message

### Performance Issues
If experiencing performance issues with lazy loading:
1. Disable it via `updateConfig({ lazyLoadConsoleCommands: false })`
2. Trigger global reset to apply changes
3. Monitor CPU during initialization

## Future Improvements

Potential enhancements to the lazy loading system:

- Per-category lazy loading (load only visualization commands, etc.)
- Command usage statistics to optimize loading order
- Persistent cache of frequently used commands
- Lazy loading for command decorator metadata
