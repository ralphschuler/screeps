/**
 * Global type declarations for screepsmod-testing
 */

// Node.js globals
declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
};

declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): any;
declare function clearTimeout(timeoutId: any): void;
declare function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): any;
declare function clearInterval(intervalId: any): void;

declare const process: {
  cwd(): string;
  memoryUsage(): {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
};

declare const module: {
  exports: any;
};

// Node.js fs module (minimal declarations)
declare module 'fs' {
  export function existsSync(path: string): boolean;
  export function readFileSync(path: string, encoding: string): string;
  export function writeFileSync(path: string, data: string, encoding: string): void;
  export function unlinkSync(path: string): void;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
}

// Node.js path module (minimal declarations)
declare module 'path' {
  export function join(...paths: string[]): string;
}

// Screeps globals (minimal declarations for what we use)
declare const Game: any;
declare const Memory: any;
declare const RawMemory: any;
declare const InterShardMemory: any;
declare const PathFinder: any;
declare const RoomVisual: any;

// Screeps constants
declare const FIND_MY_SPAWNS: any;
declare const FIND_MY_CREEPS: any;
declare const FIND_HOSTILE_CREEPS: any;
declare const FIND_MY_STRUCTURES: any;
declare const STRUCTURE_TOWER: any;
declare const ATTACK: any;
