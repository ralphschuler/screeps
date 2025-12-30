/**
 * UI-Enhanced Console Commands
 * 
 * Provides interactive UI elements for common bot operations using the new console UI system.
 */

import { Command } from './commandRegistry';
import { createElement, colorful, log } from '@ralphschuler/screeps-utils';
import { generateInteractiveHelp, generateCategoryHelp } from './uiHelp';

/**
 * UI-enhanced commands for better user experience
 */
export class UICommands {
  @Command({
    name: 'uiHelp',
    description: 'Show interactive help interface with expandable sections',
    usage: 'uiHelp()',
    examples: ['uiHelp()', 'uiHelp("Logging")', 'uiHelp("Visualization")'],
    category: 'System'
  })
  public uiHelp(category?: string): string {
    if (category) {
      return generateCategoryHelp(category);
    }
    return generateInteractiveHelp();
  }

  @Command({
    name: 'spawnForm',
    description: 'Show interactive form for spawning creeps',
    usage: 'spawnForm(roomName)',
    examples: ['spawnForm("W1N1")', 'spawnForm("E2S3")'],
    category: 'Spawning'
  })
  public spawnForm(roomName: string): string {
    const room = Game.rooms[roomName];
    if (!room) {
      return colorful(`Room ${roomName} not found or not visible`, 'red', true);
    }

    return createElement.form('spawnCreep', [
      {
        type: 'select',
        name: 'role',
        label: 'Role:',
        options: [
          { value: 'harvester', label: 'Harvester' },
          { value: 'upgrader', label: 'Upgrader' },
          { value: 'builder', label: 'Builder' },
          { value: 'hauler', label: 'Hauler' },
          { value: 'repairer', label: 'Repairer' },
          { value: 'defender', label: 'Defender' }
        ]
      },
      {
        type: 'input',
        name: 'name',
        label: 'Name (optional):',
        placeholder: 'Auto-generated if empty'
      }
    ], {
      content: 'Spawn Creep',
      command: `({role, name}) => {
        const room = Game.rooms['${roomName}'];
        if (!room) return 'Room not found';
        const spawns = room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) return 'No spawns found';
        const spawn = spawns[0];
        const body = [WORK, CARRY, MOVE]; // Basic body
        const creepName = name || role + '_' + Game.time;
        const result = spawn.spawnCreep(body, creepName, {memory: {role: role}});
        return result === OK ? 'Spawning ' + creepName : 'Error: ' + result;
      }`
    });
  }

  @Command({
    name: 'roomControl',
    description: 'Show interactive room control panel',
    usage: 'roomControl(roomName)',
    examples: ['roomControl("W1N1")'],
    category: 'Room Management'
  })
  public roomControl(roomName: string): string {
    const room = Game.rooms[roomName];
    if (!room) {
      return colorful(`Room ${roomName} not found or not visible`, 'red', true);
    }

    let html = `<div style="background: #2b2b2b; padding: 10px; margin: 5px;">`;
    html += `<h3 style="color: #c5c599; margin: 0 0 10px 0;">Room Control: ${roomName}</h3>`;

    // Room stats
    html += `<div style="margin-bottom: 10px;">`;
    html += colorful(`Energy: ${room.energyAvailable}/${room.energyCapacityAvailable}`, 'green') + '<br>';
    if (room.controller) {
      html += colorful(`Controller Level: ${room.controller.level} (${room.controller.progress}/${room.controller.progressTotal})`, 'blue') + '<br>';
    }
    html += `</div>`;

    // Quick action buttons
    html += createElement.button({
      content: '🔄 Toggle Visualizations',
      command: `() => {
        const config = require('./config').getConfig();
        require('./config').updateConfig({visualizations: !config.visualizations});
        return 'Visualizations: ' + (!config.visualizations ? 'ON' : 'OFF');
      }`
    });

    html += ' ';

    html += createElement.button({
      content: '📊 Room Stats',
      command: `() => {
        const room = Game.rooms['${roomName}'];
        if (!room) return 'Room not found';
        let stats = '=== Room Stats ===\\n';
        stats += 'Energy: ' + room.energyAvailable + '/' + room.energyCapacityAvailable + '\\n';
        stats += 'Creeps: ' + Object.values(Game.creeps).filter(c => c.room.name === '${roomName}').length + '\\n';
        if (room.controller) {
          stats += 'RCL: ' + room.controller.level + '\\n';
          stats += 'Progress: ' + room.controller.progress + '/' + room.controller.progressTotal + '\\n';
        }
        return stats;
      }`
    });

    html += `</div>`;

    return html;
  }

  @Command({
    name: 'logForm',
    description: 'Show interactive form for configuring logging',
    usage: 'logForm()',
    examples: ['logForm()'],
    category: 'Logging'
  })
  public logForm(): string {
    return createElement.form('configureLogging', [
      {
        type: 'select',
        name: 'level',
        label: 'Log Level:',
        options: [
          { value: 'debug', label: 'Debug (Verbose)' },
          { value: 'info', label: 'Info (Normal)' },
          { value: 'warn', label: 'Warning (Important)' },
          { value: 'error', label: 'Error (Critical Only)' },
          { value: 'none', label: 'None (Disabled)' }
        ]
      }
    ], {
      content: 'Set Log Level',
      command: `({level}) => {
        const levelMap = {
          debug: 0,
          info: 1,
          warn: 2,
          error: 3,
          none: 4
        };
        const logLevel = levelMap[level];
        require('./core/logger').configureLogger({level: logLevel});
        return 'Log level set to: ' + level.toUpperCase();
      }`
    });
  }

  @Command({
    name: 'visForm',
    description: 'Show interactive form for visualization settings',
    usage: 'visForm()',
    examples: ['visForm()'],
    category: 'Visualization'
  })
  public visForm(): string {
    return createElement.form('configureVisualization', [
      {
        type: 'select',
        name: 'mode',
        label: 'Visualization Mode:',
        options: [
          { value: 'debug', label: 'Debug (All layers)' },
          { value: 'presentation', label: 'Presentation (Clean)' },
          { value: 'minimal', label: 'Minimal (Basic only)' },
          { value: 'performance', label: 'Performance (Disabled)' }
        ]
      }
    ], {
      content: 'Set Visualization Mode',
      command: `({mode}) => {
        const { visualizationManager } = require('../visuals/visualizationManager');
        visualizationManager.setMode(mode);
        return 'Visualization mode set to: ' + mode;
      }`
    });
  }

  @Command({
    name: 'quickActions',
    description: 'Show quick action buttons for common operations',
    usage: 'quickActions()',
    examples: ['quickActions()'],
    category: 'System'
  })
  public quickActions(): string {
    let html = `<div style="background: #2b2b2b; padding: 10px; margin: 5px;">`;
    html += `<h3 style="color: #c5c599; margin: 0 0 10px 0;">Quick Actions</h3>`;

    // Emergency mode button
    html += createElement.button({
      content: '🚨 Emergency Mode',
      command: `() => {
        const config = require('./config').getConfig();
        require('./config').updateConfig({emergencyMode: !config.emergencyMode});
        return 'Emergency Mode: ' + (!config.emergencyMode ? 'ON' : 'OFF');
      }`
    });

    html += ' ';

    // Toggle debug button
    html += createElement.button({
      content: '🐛 Toggle Debug',
      command: `() => {
        const config = require('./config').getConfig();
        const newValue = !config.debug;
        require('./config').updateConfig({debug: newValue});
        require('./core/logger').configureLogger({level: newValue ? 0 : 1});
        return 'Debug mode: ' + (newValue ? 'ON' : 'OFF');
      }`
    });

    html += ' ';

    // Clear cache button
    html += createElement.button({
      content: '🗑️ Clear Cache',
      command: `() => {
        const { cacheManager } = require('./cache/CacheManager');
        cacheManager.clear();
        return 'Cache cleared successfully';
      }`
    });

    html += `</div>`;

    return html;
  }

  @Command({
    name: 'colorDemo',
    description: 'Show color demonstration for console output',
    usage: 'colorDemo()',
    examples: ['colorDemo()'],
    category: 'System'
  })
  public colorDemo(): string {
    let output = '=== Console Color Demo ===\n\n';
    output += colorful('✓ Success message', 'green', true) + '\n';
    output += colorful('⚠ Warning message', 'yellow', true) + '\n';
    output += colorful('✗ Error message', 'red', true) + '\n';
    output += colorful('ℹ Info message', 'blue', true) + '\n';
    output += '\nNormal text: ' + colorful('colored text', 'green') + ' normal text\n';
    output += 'Bold text: ' + colorful('important', null, true) + '\n';
    return output;
  }
}
