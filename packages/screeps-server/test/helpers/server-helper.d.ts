export interface TickMetrics {
  cpu: number[];
  cpuHistory: number[];
  bucket: number[];
  bucketLevel: number[];
  memoryParse: number[];
  memoryParseTime: number[];
  tickTime: number[];
  ticks: number;
}

export const helper: {
  server: {
    world: { readonly gameTime: number };
    tick(): Promise<void>;
  };
  player: {
    console(command: string): Promise<string>;
    readonly memory: string;
  };
  executeConsole(command: string): Promise<string>;
  runTicks(ticks: number, options?: string | { scenario?: string }): Promise<TickMetrics>;
  getMemory(): Promise<any>;
  hasErrors(): Promise<boolean>;
  getAverageCpu(): number;
  getMaxCpu(): number;
  getAverageBucket(): number;
  getAverageMemoryParseTime(): number;
  reset(): void;
};
