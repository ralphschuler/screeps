/* eslint-disable no-console */
export interface Logger {
  info(message: string, extra?: unknown): void;
  warn(message: string, extra?: unknown): void;
  error(message: string, extra?: unknown): void;
}

export function createLogger(): Logger {
  return {
    info(message: string, extra?: unknown) {
      extra ? console.log(message, extra) : console.log(message);
    },
    warn(message: string, extra?: unknown) {
      extra ? console.warn(message, extra) : console.warn(message);
    },
    error(message: string, extra?: unknown) {
      extra ? console.error(message, extra) : console.error(message);
    }
  };
}
