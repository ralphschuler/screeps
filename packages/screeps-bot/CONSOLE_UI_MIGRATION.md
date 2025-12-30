# Console UI System Migration

## Overview

This document describes the integration of the new console UI and help system into the Screeps bot. The system provides interactive forms, buttons, and enhanced help documentation directly in the Screeps console.

## What's New

### 1. Interactive Help System (`uiHelp`)

A new command that provides an expandable, color-coded help interface:

```javascript
uiHelp()           // Show all commands
uiHelp("Logging")  // Show specific category
```

**Features:**
- Expandable/collapsible sections for each command
- Color-coded syntax highlighting
- Parameter documentation
- Organized by category

### 2. Interactive Forms

New form-based commands for common operations:

#### Spawn Form
```javascript
spawnForm("W1N1")
```
Provides an interactive form to spawn creeps with role selection and optional naming.

#### Log Configuration Form
```javascript
logForm()
```
Interactive form to configure log levels with dropdown selection.

#### Visualization Form
```javascript
visForm()
```
Interactive form to set visualization modes.

### 3. Room Control Panel

```javascript
roomControl("W1N1")
```

Provides a comprehensive control panel for a room with:
- Real-time room statistics
- Quick action buttons
- Energy and controller information

### 4. Quick Actions Dashboard

```javascript
quickActions()
```

Provides one-click buttons for common operations:
- Emergency mode toggle
- Debug mode toggle
- Cache clearing

### 5. Enhanced Logging

The system now supports colored console output:

```javascript
colorDemo()  // See color demonstration
```

## New Commands Reference

| Command | Description | Example |
|---------|-------------|---------|
| `uiHelp()` | Interactive help interface | `uiHelp()` or `uiHelp("Logging")` |
| `spawnForm(room)` | Interactive creep spawning form | `spawnForm("W1N1")` |
| `roomControl(room)` | Room control panel | `roomControl("W1N1")` |
| `logForm()` | Log configuration form | `logForm()` |
| `visForm()` | Visualization configuration form | `visForm()` |
| `quickActions()` | Quick action buttons | `quickActions()` |
| `colorDemo()` | Color demonstration | `colorDemo()` |

## Migration Notes

### Backward Compatibility

All existing commands remain functional. The new UI system adds enhanced versions but does not replace the original commands.

**Old way (still works):**
```javascript
setLogLevel('debug')
toggleVisualizations()
```

**New way (enhanced UI):**
```javascript
logForm()      // Interactive form
visForm()      // Interactive form
uiHelp()       // Enhanced help
```

### Command Registry Integration

The new UI system integrates seamlessly with the existing command registry. All commands registered with the `@Command` decorator are automatically available in the `uiHelp()` interface.

### Custom Commands

You can create your own UI-enhanced commands using the utilities from `@ralphschuler/screeps-utils`:

```typescript
import { createElement, createHelp, colorful } from '@ralphschuler/screeps-utils';

@Command({
  name: 'myCustomForm',
  description: 'My custom interactive form',
  category: 'Custom'
})
public myCustomForm(): string {
  return createElement.form('myForm', [
    {
      type: 'input',
      name: 'value',
      label: 'Enter value:',
      placeholder: 'Type here'
    }
  ], {
    content: 'Submit',
    command: `({value}) => console.log('Value: ' + value)`
  });
}
```

## Implementation Details

### Files Added

- `packages/screeps-utils/src/console/ui.ts` - Core UI utilities
- `packages/screeps-utils/src/console/help.ts` - Help system
- `packages/screeps-utils/src/console/examples.ts` - Usage examples
- `packages/screeps-bot/src/core/uiHelp.ts` - Help system integration
- `packages/screeps-bot/src/core/uiCommands.ts` - UI-enhanced commands

### Files Modified

- `packages/screeps-utils/src/index.ts` - Added console exports
- `packages/screeps-bot/src/core/consoleCommands.ts` - Added UI commands

## Usage Examples

### Example 1: Spawning Creeps

**Before:**
```javascript
// Manual spawning
Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE], 'Harvester1', {memory: {role: 'harvester'}})
```

**After:**
```javascript
// Interactive form
spawnForm("W1N1")
// Then fill in the form and click "Spawn Creep"
```

### Example 2: Viewing Help

**Before:**
```javascript
help()  // Plain text output
```

**After:**
```javascript
uiHelp()  // Interactive, expandable interface
```

### Example 3: Configuring Settings

**Before:**
```javascript
setLogLevel('debug')
toggleVisualizations()
```

**After:**
```javascript
quickActions()  // One-click buttons for common operations
logForm()       // Interactive form for detailed configuration
```

## Benefits

The new UI system provides several advantages:

**Improved Usability**: Interactive forms are easier to use than remembering command syntax.

**Better Documentation**: The enhanced help system makes it easier to discover and understand commands.

**Visual Feedback**: Color-coded output and styled elements improve readability.

**Reduced Errors**: Forms validate input and provide clear options, reducing command errors.

**Faster Workflow**: Quick action buttons and forms speed up common operations.

## Future Enhancements

Potential future additions to the UI system:

- Room comparison dashboard
- Creep management interface
- Market trading forms
- Defense configuration panel
- Resource transfer wizard
- Empire overview dashboard

## Troubleshooting

### Forms Not Appearing

If forms don't appear, ensure you've built the `@ralphschuler/screeps-utils` package:

```bash
cd packages/screeps-utils
npm run build
```

### Commands Not Found

If UI commands are not available, check that the bot has been deployed with the latest code:

```bash
npm run build
npm run deploy
```

### UI Elements Not Styled

If UI elements appear but aren't styled correctly, the CSS may not be loading. This is usually resolved by refreshing the Screeps console or reloading the page.

## Support

For issues or questions about the console UI system:

1. Check the examples in `packages/screeps-utils/src/console/examples.ts`
2. Review the documentation in `packages/screeps-utils/src/console/README.md`
3. Examine the implementation in `packages/screeps-bot/src/core/uiCommands.ts`

## Conclusion

The new console UI system significantly enhances the bot's usability while maintaining full backward compatibility with existing commands. Users can choose to use the traditional command-line interface or the new interactive forms based on their preference.
