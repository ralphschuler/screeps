# Console UI and Help System

This module provides a powerful set of utilities for creating interactive user interfaces and help documentation directly within the Screeps console. It is adapted from the UI system in the `HoPGoldy/my-screeps-ai` repository.

## Features

-   **Interactive UI Elements**: Create forms, buttons, input fields, and dropdowns in the console.
-   **Help System**: Dynamically generate a structured and user-friendly help interface.
-   **Command Integration**: Seamlessly connect UI elements to your bot's commands.
-   **Custom Styling**: Consistent and customizable styling for all UI elements.

## UI System (`ui.ts`)

The `createElement` object is the core of the UI system, providing functions to generate HTML for various console elements.

### `createElement.form(name, details, buttonDetail)`

Creates a complete form with multiple input elements and a submit button.

**Example:**

```typescript
import { createElement } from '@ralphschuler/screeps-utils';

function showSpawnForm(roomName: string) {
  const formHtml = createElement.form('spawnCreep', [
    {
      type: 'select',
      name: 'role',
      label: 'Role:',
      options: [
        { value: 'harvester', label: 'Harvester' },
        { value: 'upgrader', label: 'Upgrader' },
      ]
    },
    {
      type: 'input',
      name: 'name',
      label: 'Name:',
      placeholder: 'Optional custom name'
    }
  ], {
    content: 'Spawn Creep',
    command: `({role, name}) => Game.rooms['${roomName}'].spawnCreep(role, name)`
  });

  console.log(formHtml);
}
```

### `createElement.button(detail)`

Creates a clickable button that executes a command.

**Example:**

```typescript
import { createElement } from '@ralphschuler/screeps-utils';

const buttonHtml = createElement.button({
  content: '🚨 Emergency Mode',
  command: '() => Game.setEmergencyMode(true)'
});

console.log(buttonHtml);
```

## Help System (`help.ts`)

The `createHelp` function generates a detailed and interactive help interface from a structured data format.

### `createHelp(...modules)`

**Example:**

```typescript
import { createHelp, ModuleDescribe } from '@ralphschuler/screeps-utils';

function showHelp() {
  const modules: ModuleDescribe[] = [
    {
      name: 'Room Management',
      describe: 'Commands for managing room operations',
      api: [
        {
          title: 'Spawn a creep',
          describe: 'Spawn a new creep with the specified role',
          params: [
            { name: 'role', desc: 'The role of the creep to spawn' },
          ],
          functionName: 'room.spawnCreep'
        },
        {
          title: 'Get room statistics',
          describe: 'Display detailed statistics about the room',
          functionName: 'room.stats',
          commandType: true
        }
      ]
    }
  ];

  console.log(createHelp(...modules));
}
```

## Integration

To use these utilities, import them from the `@ralphschuler/screeps-utils` package:

```typescript
import { createElement, createHelp, colorful, log } from '@ralphschuler/screeps-utils';
```

You can then create global commands or room-specific commands that display the UI elements or help documentation in the console.

**Global Help Command Example:**

```typescript
// main.ts
global.help = () => {
  // ... create ModuleDescribe array ...
  console.log(createHelp(...modules));
};
```

**Room Help Command Example:**

```typescript
// Room prototype extension
Room.prototype.help = function() {
  // ... create ModuleDescribe array for room commands ...
  console.log(createHelp(...modules));
};
```
