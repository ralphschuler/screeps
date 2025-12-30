/**
 * Example implementations of the console UI and help system
 * These examples demonstrate how to use the UI and help utilities in your bot
 */

import { createHelp, ModuleDescribe } from './help';
import { createElement, colorful } from './ui';

/**
 * Example: Create a help system for room commands
 * This can be called from the console with: Game.rooms['W1N1'].help()
 */
export function createRoomHelp(): string {
  const modules: ModuleDescribe[] = [
    {
      name: 'Room Management',
      describe: 'Commands for managing room operations and resources',
      api: [
        {
          title: 'Spawn a creep',
          describe: 'Spawn a new creep with the specified role',
          params: [
            { name: 'role', desc: 'The role of the creep to spawn' },
            { name: 'body', desc: 'Optional body parts array' }
          ],
          functionName: 'room.spawnCreep'
        },
        {
          title: 'Get room statistics',
          describe: 'Display detailed statistics about the room',
          functionName: 'room.stats',
          commandType: true
        },
        {
          title: 'Set room mode',
          describe: 'Change the operational mode of the room',
          params: [
            { name: 'mode', desc: 'Mode: "economy", "defense", or "expansion"' }
          ],
          functionName: 'room.setMode'
        }
      ]
    },
    {
      name: 'Resource Management',
      describe: 'Commands for managing resources and transfers',
      api: [
        {
          title: 'Transfer energy',
          describe: 'Transfer energy from storage to terminal',
          params: [
            { name: 'amount', desc: 'Amount of energy to transfer' }
          ],
          functionName: 'room.transferEnergy'
        },
        {
          title: 'Send resources',
          describe: 'Send resources to another room',
          params: [
            { name: 'targetRoom', desc: 'Target room name' },
            { name: 'resourceType', desc: 'Type of resource to send' },
            { name: 'amount', desc: 'Amount to send' }
          ],
          functionName: 'room.sendResource'
        }
      ]
    }
  ];

  return createHelp(...modules);
}

/**
 * Example: Create a help system for global commands
 * This can be called from the console with: help
 */
export function createGlobalHelp(): string {
  const modules: ModuleDescribe[] = [
    {
      name: 'Global Commands',
      describe: 'Commands that affect all rooms and global operations',
      api: [
        {
          title: 'Show all rooms',
          describe: 'Display status of all owned rooms',
          functionName: 'Game.showRooms',
          commandType: true
        },
        {
          title: 'Emergency mode',
          describe: 'Enable emergency CPU saving mode',
          params: [
            { name: 'enabled', desc: 'true to enable, false to disable' }
          ],
          functionName: 'Game.setEmergencyMode'
        },
        {
          title: 'Get resource totals',
          describe: 'Show total resources across all rooms',
          params: [
            { name: 'resourceType', desc: 'Type of resource to check' }
          ],
          functionName: 'Game.getResourceTotal'
        }
      ]
    }
  ];

  return createHelp(...modules);
}

/**
 * Example: Create an interactive form for spawning creeps
 * This demonstrates how to use the form creation utilities
 */
export function createSpawnForm(roomName: string): string {
  return createElement.form('spawnCreep', [
    {
      type: 'select',
      name: 'role',
      label: 'Role:',
      options: [
        { value: 'harvester', label: 'Harvester' },
        { value: 'upgrader', label: 'Upgrader' },
        { value: 'builder', label: 'Builder' },
        { value: 'hauler', label: 'Hauler' }
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
}

/**
 * Example: Create an interactive form for resource transfers
 */
export function createTransferForm(roomName: string): string {
  return createElement.form('transferResource', [
    {
      type: 'select',
      name: 'resourceType',
      label: 'Resource:',
      options: [
        { value: RESOURCE_ENERGY, label: 'Energy' },
        { value: RESOURCE_POWER, label: 'Power' },
        { value: RESOURCE_HYDROGEN, label: 'Hydrogen' },
        { value: RESOURCE_OXYGEN, label: 'Oxygen' }
      ]
    },
    {
      type: 'input',
      name: 'amount',
      label: 'Amount:',
      placeholder: '1000'
    },
    {
      type: 'select',
      name: 'direction',
      label: 'Direction:',
      options: [
        { value: 'storage-terminal', label: 'Storage → Terminal' },
        { value: 'terminal-storage', label: 'Terminal → Storage' }
      ]
    }
  ], {
    content: 'Transfer',
    command: `({resourceType, amount, direction}) => Game.rooms['${roomName}'].transfer(resourceType, parseInt(amount), direction)`
  });
}

/**
 * Example: Create a simple button
 */
export function createEmergencyButton(): string {
  return createElement.button({
    content: '🚨 Emergency Mode',
    command: '() => Game.setEmergencyMode(true)'
  });
}

/**
 * Example: Using colorful logging
 */
export function logExample(): void {
  console.log(colorful('Success!', 'green', true));
  console.log(colorful('Warning: Low energy', 'yellow'));
  console.log(colorful('Error: Spawn failed', 'red', true));
  console.log(colorful('Info: Processing...', 'blue'));
}
