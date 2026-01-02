/**
 * External dependency interfaces for console package
 * 
 * These interfaces define the contracts with external systems.
 * The consuming bot must provide implementations.
 */

// ============================================================================
// Logger Interface
// ============================================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export interface LoggerConfig {
  level: LogLevel;
  categories: Record<string, LogLevel>;
}

export function createLogger(category: string): Logger {
  return {
    debug: (msg: string, ...args: any[]) => console.log(`[${category}]`, msg, ...args),
    info: (msg: string, ...args: any[]) => console.log(`[${category}]`, msg, ...args),
    warn: (msg: string, ...args: any[]) => console.log(`[${category}] WARN:`, msg, ...args),
    error: (msg: string, ...args: any[]) => console.log(`[${category}] ERROR:`, msg, ...args)
  };
}

export const logger: Logger = createLogger('console');

export function configureLogger(config: Partial<LoggerConfig>): void {
  // Stub implementation
}

export function getLoggerConfig(): LoggerConfig {
  return {
    level: LogLevel.INFO,
    categories: {}
  };
}

// ============================================================================
// Configuration Interface
// ============================================================================

export interface Config {
  [key: string]: any;
}

export function getConfig(): Config {
  return {};
}

export function updateConfig(updates: Partial<Config>): void {
  // Stub implementation
}

// ============================================================================
// Kernel Interface (minimal subset for commands)
// ============================================================================

export interface ProcessInfo {
  id: string;
  name: string;
  priority: number;
  cpuUsed: number;
  state: string;
}

export interface Kernel {
  getProcesses(): ProcessInfo[];
  suspendProcess(id: string): void;
  resumeProcess(id: string): void;
  killProcess(id: string): void;
  getProcessStats(): any;
}

export const kernel: Kernel = {
  getProcesses: () => [],
  suspendProcess: (id: string) => {},
  resumeProcess: (id: string) => {},
  killProcess: (id: string) => {},
  getProcessStats: () => ({})
};

// ============================================================================
// Stats Interfaces
// ============================================================================

export interface MemorySegmentStats {
  run(): void;
  getMetricSeries(name: string): any;
}

export const memorySegmentStats: MemorySegmentStats = {
  run: () => {},
  getMetricSeries: (name: string) => null
};

export interface UnifiedStats {
  getSnapshot(): any;
  getBudgetReport(): any;
}

export const unifiedStats: UnifiedStats = {
  getSnapshot: () => ({}),
  getBudgetReport: () => ({})
};

// ============================================================================
// Visualizer Interfaces
// ============================================================================

export interface RoomVisualizer {
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  toggleLayer(layer: string): void;
}

export const roomVisualizer: RoomVisualizer = {
  setEnabled: (enabled: boolean) => {},
  isEnabled: () => false,
  toggleLayer: (layer: string) => {}
};

export interface MapVisualizer {
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
}

export const mapVisualizer: MapVisualizer = {
  setEnabled: (enabled: boolean) => {},
  isEnabled: () => false
};

// ============================================================================
// Process Manager Interfaces
// ============================================================================

export interface ProcessManager {
  getProcessInfo(processId: string): any;
  listProcesses(): any[];
}

export const creepProcessManager: ProcessManager = {
  getProcessInfo: (id: string) => null,
  listProcesses: () => []
};

export const roomProcessManager: ProcessManager = {
  getProcessInfo: (id: string) => null,
  listProcesses: () => []
};

// ============================================================================
// Command Collection Interfaces
// ============================================================================

export interface CommandCollection {
  [key: string]: (...args: any[]) => any;
}

// These are stubs - actual implementations would be provided by the consuming bot
export const labCommands: CommandCollection = {};
export const marketCommands: CommandCollection = {};
export const powerCommands: CommandCollection = {};
export const shardCommands: CommandCollection = {};
export const economyCommands: CommandCollection = {};
export const expansionCommands: CommandCollection = {};
export const tooAngelCommands: CommandCollection = {};
export const memoryCommands: CommandCollection = {};
export const UICommands: CommandCollection = {};
