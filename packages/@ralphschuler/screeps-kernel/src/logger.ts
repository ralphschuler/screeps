/**
 * Minimal logger interface for kernel package
 * Allows kernel to be independent while still supporting logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogContext {
  subsystem?: string;
  room?: string;
  creep?: string;
  processId?: string;
  meta?: Record<string, any>;
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

/**
 * Default console logger implementation
 */
class ConsoleLogger implements Logger {
  private level: LogLevel = LogLevel.INFO;

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public debug(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(JSON.stringify({ level: 'DEBUG', message, tick: Game.time, ...context }));
    }
  }

  public info(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.INFO) {
      console.log(JSON.stringify({ level: 'INFO', message, tick: Game.time, ...context }));
    }
  }

  public warn(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.WARN) {
      console.log(JSON.stringify({ level: 'WARN', message, tick: Game.time, ...context }));
    }
  }

  public error(message: string, context?: LogContext): void {
    if (this.level <= LogLevel.ERROR) {
      console.log(JSON.stringify({ level: 'ERROR', message, tick: Game.time, ...context }));
    }
  }
}

export const logger: Logger = new ConsoleLogger();
export function configureLogger(config: { level?: LogLevel }): void {
  if (config.level !== undefined && logger instanceof ConsoleLogger) {
    (logger as ConsoleLogger).setLevel(config.level);
  }
}
