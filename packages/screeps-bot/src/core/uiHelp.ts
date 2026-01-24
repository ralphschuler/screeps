/**
 * UI-Enhanced Help System
 * 
 * Integrates the new console UI system with the existing command registry
 * to provide a rich, interactive help interface.
 */

import { FunctionDescribe, ModuleDescribe, createHelp } from '@ralphschuler/screeps-utils';
import { commandRegistry } from './commandRegistry';

/**
 * Generate an interactive help interface using the new UI system
 * 
 * @returns HTML string with interactive help interface
 */
export function generateInteractiveHelp(): string {
  const commandsByCategory = commandRegistry.getCommandsByCategory();
  const modules: ModuleDescribe[] = [];

  // Convert command registry data to ModuleDescribe format
  for (const [category, commands] of commandsByCategory) {
    const api: FunctionDescribe[] = commands.map(cmd => {
      const func: FunctionDescribe = {
        title: cmd.metadata.description,
        functionName: cmd.metadata.name,
        commandType: !cmd.metadata.usage?.includes('(')
      };

      // Add detailed description if available
      if (cmd.metadata.examples && cmd.metadata.examples.length > 0) {
        func.describe = cmd.metadata.examples[0];
      }

      // Parse parameters from usage string if available
      if (cmd.metadata.usage) {
        const paramMatch = cmd.metadata.usage.match(/\((.*?)\)/);
        if (paramMatch && paramMatch[1]) {
          const paramNames = paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
          if (paramNames.length > 0) {
            func.params = paramNames.map(name => ({
              name,
              desc: `Parameter: ${name}`
            }));
          }
        }
      }

      return func;
    });

    modules.push({
      name: category,
      describe: `${category} commands for bot management`,
      api
    });
  }

  return createHelp(...modules);
}

/**
 * Generate help for a specific category
 * 
 * @param category - The category to show help for
 * @returns HTML string with category help
 */
export function generateCategoryHelp(category: string): string {
  const commandsByCategory = commandRegistry.getCommandsByCategory();
  const commands = commandsByCategory.get(category);

  if (!commands || commands.length === 0) {
    return `Category "${category}" not found. Available categories: ${Array.from(commandsByCategory.keys()).join(', ')}`;
  }

  const api: FunctionDescribe[] = commands.map(cmd => ({
    title: cmd.metadata.description,
    describe: cmd.metadata.examples?.[0],
    functionName: cmd.metadata.name,
    commandType: !cmd.metadata.usage?.includes('('),
    params: cmd.metadata.usage ? parseParamsFromUsage(cmd.metadata.usage) : undefined
  }));

  return createHelp({
    name: category,
    describe: `${category} commands`,
    api
  });
}

/**
 * Parse parameter information from usage string
 * 
 * @param usage - Usage string (e.g., "command(arg1, arg2)")
 * @returns Array of parameter descriptions
 */
function parseParamsFromUsage(usage: string): { name: string; desc: string }[] | undefined {
  const paramMatch = usage.match(/\((.*?)\)/);
  if (!paramMatch || !paramMatch[1]) {
    return undefined;
  }

  const paramNames = paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
  if (paramNames.length === 0) {
    return undefined;
  }

  return paramNames.map(name => ({
    name,
    desc: `Parameter: ${name}`
  }));
}
