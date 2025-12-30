/**
 * Help system for creating interactive documentation in the Screeps console
 * Adapted from HoPGoldy/my-screeps-ai
 */

import { colorful, ConsoleColor } from './ui';

/**
 * Parameter description for a function
 */
export interface ParamDescribe {
  /** Parameter name */
  name: string;
  /** Parameter description */
  desc: string;
}

/**
 * Function/API description
 */
export interface FunctionDescribe {
  /** Usage title */
  title: string;
  /** Detailed description of what the function does */
  describe?: string;
  /** List of parameters */
  params?: ParamDescribe[];
  /** Function name (e.g., 'room.spawn' or 'Game.help') */
  functionName: string;
  /** Whether this is a direct command (no parentheses needed) */
  commandType?: boolean;
}

/**
 * Module description containing multiple APIs
 */
export interface ModuleDescribe {
  /** Module name */
  name: string;
  /** Module description */
  describe: string;
  /** List of APIs in this module */
  api: FunctionDescribe[];
}

/**
 * Create a help interface from module descriptions
 * 
 * @param modules - One or more module descriptions
 * @returns HTML string for the help interface
 */
export function createHelp(...modules: ModuleDescribe[]): string {
  return moduleStyle() + apiStyle() + `<div class="module-help">${modules.map(createModule).join('')}</div>`;
}

/**
 * Create HTML for a single module
 * 
 * @param module - Module description
 * @returns HTML string for the module
 */
const createModule = function(module: ModuleDescribe): string {
  const functionList = module.api.map(createApiHelp).join('');

  const html = `<div class="module-container">
    <div class="module-info">
      <span class="module-title">${colorful(module.name, 'yellow')}</span>
      <span class="module-describe">${colorful(module.describe, 'green')}</span>
    </div>
    <div class="module-api-list">${functionList}</div>
  </div>`;

  return html.replace(/\n/g, '');
};

/**
 * Create HTML for a single API/function
 * 
 * @param func - Function description
 * @returns HTML string for the API
 */
const createApiHelp = function(func: FunctionDescribe): string {
  const contents: string[] = [];

  // Add description
  if (func.describe) {
    contents.push(colorful(func.describe, 'green'));
  }

  // Add parameter descriptions
  if (func.params) {
    contents.push(func.params.map(param => {
      return `  - ${colorful(param.name, 'blue')}: ${colorful(param.desc, 'green')}`;
    }).map(s => `<div class="api-content-line">${s}</div>`).join(''));
  }

  // Build function call example
  let paramInFunc = func.params ? func.params.map(param => colorful(param.name, 'blue')).join(', ') : '';
  // If it's a command type, ignore parameters
  let funcCall = colorful(func.functionName, 'yellow') + (func.commandType ? '' : `(${paramInFunc})`);

  // Add function example
  contents.push(funcCall);

  const content = contents.map(s => `<div class="api-content-line">${s}</div>`).join('');
  const checkboxId = `${func.functionName}${Game.time}`;

  const result = `
  <div class="api-container">
    <label for="${checkboxId}">${func.title} ${colorful(func.functionName, 'yellow', true)}</label>
    <input id="${checkboxId}" type="checkbox" />
    <div class="api-content">${content}</div>
  </div>
  `;

  return result.replace(/\n/g, '');
};

/**
 * Generate CSS for module styling
 * 
 * @returns CSS style block
 */
const moduleStyle = function(): string {
  const style = `
  <style>
  .module-help {
    display: flex;
    flex-flow: column nowrap;
  }
  .module-container {
    padding: 0px 10px 10px 10px;
    display: flex;
    flex-flow: column nowrap;
  }
  .module-info {
    margin: 5px;
    display: flex;
    flex-flow: row nowrap;
    align-items: baseline;
  }
  .module-title {
    font-size: 19px;
    font-weight: bolder;
    margin-left: -15px;
  }
  .module-api-list {
    display: flex;
    flex-flow: row wrap;
  }
  </style>`;

  return style.replace(/\n/g, '');
};

/**
 * Generate CSS for API styling
 * 
 * @returns CSS style block
 */
const apiStyle = function(): string {
  const style = `
  <style>
  .api-content-line {
    width: max-content;
    padding-right: 15px;
  }
  .api-container {
    margin: 5px;
    width: 250px;
    background-color: #2b2b2b;
    overflow: hidden;
    display: flex;
    flex-flow: column;
  }

  .api-container label {
    transition: all 0.1s;
    min-width: 300px;
  }

  /* Hide checkbox */
  .api-container input {
    display: none;
  }

  .api-container label {
    cursor: pointer;
    display: block;
    padding: 10px;
    background-color: #3b3b3b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .api-container label:hover, label:focus {
    background-color: #525252;
  }

  /* Collapsed state */
  .api-container input + .api-content {
    overflow: hidden;
    transition: all 0.1s;
    width: auto;
    max-height: 0px;
    padding: 0px 10px;
  }

  /* Expanded state when checkbox is checked */
  .api-container input:checked + .api-content {
    max-height: 200px;
    padding: 10px;
    background-color: #1c1c1c;
    overflow-x: auto;
  }
  </style>`;

  return style.replace(/\n/g, '');
};
