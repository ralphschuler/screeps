/**
 * Console UI utilities for creating interactive HTML elements in the Screeps console
 * Adapted from HoPGoldy/my-screeps-ai
 */

/**
 * Color constants for console output
 */
export type ConsoleColor = 'red' | 'green' | 'yellow' | 'blue';

/**
 * Color palette for console elements
 */
const colors: Record<ConsoleColor, string> = {
  red: '#ef9a9a',
  green: '#6b9955',
  yellow: '#c5c599',
  blue: '#8dc5e3'
};

/**
 * Add color styling to text content
 * 
 * @param content - The text to colorize
 * @param colorName - The color to apply
 * @param bold - Whether to make the text bold
 * @returns HTML-formatted colored text
 */
export function colorful(
  content: string,
  colorName: ConsoleColor | null = null,
  bold: boolean = false
): string {
  const colorStyle = colorName ? `color: ${colors[colorName]};` : '';
  const boldStyle = bold ? 'font-weight: bolder;' : '';

  return `<text style="${[colorStyle, boldStyle].join(' ')}">${content}</text>`;
}

/**
 * Create a clickable link in the console
 * 
 * @param content - The text to display
 * @param url - The URL to link to
 * @param newTab - Whether to open in a new tab
 * @returns HTML link element
 */
export function createLink(content: string, url: string, newTab: boolean = true): string {
  return `<a href="${url}" target="${newTab ? '_blank' : '_self'}">${content}</a>`;
}

/**
 * Send a command to the Screeps console for execution
 * This wraps the command so it can be executed by clicking a button
 * 
 * @param command - The command to execute in the console
 * @returns JavaScript code to execute the command
 */
function sendCommandToConsole(command: string): string {
  return `angular.element(document.body).injector().get('Console').sendCommand('(${command})()', 1)`;
}

/**
 * Input field details for form creation
 */
export interface InputDetail {
  type: 'input';
  name: string;
  label?: string;
  placeholder?: string;
}

/**
 * Select dropdown details for form creation
 */
export interface SelectDetail {
  type: 'select';
  name: string;
  label?: string;
  options: Array<{
    value: string | number;
    label: string;
  }>;
}

/**
 * Button details for form creation
 */
export interface ButtonDetail {
  content: string;
  command: string;
}

/**
 * Union type for all HTML element details
 */
export type HTMLElementDetail = InputDetail | SelectDetail;

/**
 * Console element creation utilities
 */
export const createElement = {
  /**
   * Generate custom CSS styling for console elements
   * 
   * @returns CSS style block as a string
   */
  customStyle(): string {
    const style = `<style>
      input {
        background-color: #2b2b2b;
        border: none;
        border-bottom: 1px solid #888;
        padding: 3px;
        color: #ccc;
      }
      select {
        border: none;
        background-color: #2b2b2b;
        color: #ccc;
      }
      button {
        border: 1px solid #888;
        cursor: pointer;
        background-color: #2b2b2b;
        color: #ccc;
      }
    </style>`;

    return style.replace(/\n/g, '');
  },

  /**
   * Create an input field
   * 
   * @param detail - Input field configuration
   * @returns HTML input element
   */
  input(detail: InputDetail): string {
    return `${detail.label || ''} <input name="${detail.name}" placeholder="${detail.placeholder || ''}"/>`;
  },

  /**
   * Create a select dropdown
   * 
   * @param detail - Select dropdown configuration
   * @returns HTML select element
   */
  select(detail: SelectDetail): string {
    const parts = [`${detail.label || ''} <select name="${detail.name}">`];
    parts.push(...detail.options.map(option => ` <option value="${option.value}">${option.label}</option>`));
    parts.push(`</select>`);

    return parts.join('');
  },

  /**
   * Create a button that executes a command when clicked
   * 
   * @param detail - Button configuration
   * @returns HTML button element
   */
  button(detail: ButtonDetail): string {
    return `<button onclick="${sendCommandToConsole(detail.command)}">${detail.content}</button>`;
  },

  /**
   * Create a complete form with multiple elements
   * 
   * @param name - Unique name for the form
   * @param details - Array of form elements to include
   * @param buttonDetail - Submit button configuration
   * @returns Complete HTML form
   */
  form(name: string, details: HTMLElementDetail[], buttonDetail: ButtonDetail): string {
    // Create unique form name using game time
    const formName = name + Game.time.toString();

    // Add styling and form opening tag
    const parts = [
      this.customStyle(),
      `<form name='${formName}'>`,
    ];

    // Add form elements
    parts.push(...details.map(detail => {
      switch (detail.type) {
        case 'input':
          return this.input(detail) + '    ';
        case 'select':
          return this.select(detail) + '    ';
      }
    }));

    /**
     * Wrap form data extraction and command execution
     * This creates a function that:
     * 1. Gets the form by name
     * 2. Extracts all field values into an object
     * 3. Sends the command with the form data as JSON
     */
    const commandWrap = `(() => {
      const form = document.forms['${formName}']
      let formDatas = {}
      [${details.map(detail => `'${detail.name}'`).toString()}].map(eleName => formDatas[eleName] = form[eleName].value)
      angular.element(document.body).injector().get('Console').sendCommand(\`(${buttonDetail.command})(\${JSON.stringify(formDatas)\})\`, 1)
    })()`;

    // Add submit button
    parts.push(`<button type="button" onclick="${commandWrap.replace(/\n/g, ';')}">${buttonDetail.content}</button>`);
    parts.push(`</form>`);

    // Compress to single line
    return parts.join('');
  }
};

/**
 * Enhanced logging function with color and prefix support
 * 
 * @param content - The message to log
 * @param prefixes - Array of prefix strings to prepend
 * @param color - Color to apply to the prefix
 * @param notify - Whether to send a game notification
 * @returns OK constant
 */
export function log(
  content: string,
  prefixes: string[] = [],
  color: ConsoleColor | null = null,
  notify: boolean = false
): OK {
  // Assemble prefix if provided
  let prefix = prefixes.length > 0 ? `【${prefixes.join(' ')}】 ` : '';
  // Apply color to prefix
  prefix = colorful(prefix, color, true);

  const logContent = `${prefix}${content}`;
  console.log(logContent);

  // Forward to email if notification requested
  if (notify) {
    Game.notify(logContent);
  }

  return OK;
}
