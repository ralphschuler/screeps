/**
 * Rolling average tracker for metrics
 */

export class RollingAverage {
  private values: number[] = [];
  private sum = 0;

  public constructor(private maxSamples: number = 10) {}

  public add(value: number): number {
    this.values.push(value);
    this.sum += value;

    if (this.values.length > this.maxSamples) {
      const removed = this.values.shift();
      this.sum -= removed ?? 0;
    }

    return this.get();
  }

  public get(): number {
    return this.values.length > 0 ? this.sum / this.values.length : 0;
  }

  public reset(): void {
    this.values = [];
    this.sum = 0;
  }
}

/** Room metrics tracker */
export interface RoomMetricsTracker {
  energyHarvested: RollingAverage;
  energySpawning: RollingAverage;
  energyConstruction: RollingAverage;
  energyRepair: RollingAverage;
  energyTower: RollingAverage;
  controllerProgress: RollingAverage;
  hostileCount: RollingAverage;
  damageReceived: RollingAverage;
  idleWorkers: RollingAverage;
  lastControllerProgress: number;
}

/** Create a new metrics tracker */
export function createMetricsTracker(): RoomMetricsTracker {
  return {
    energyHarvested: new RollingAverage(10),
    energySpawning: new RollingAverage(10),
    energyConstruction: new RollingAverage(10),
    energyRepair: new RollingAverage(10),
    energyTower: new RollingAverage(10),
    controllerProgress: new RollingAverage(10),
    hostileCount: new RollingAverage(5),
    damageReceived: new RollingAverage(5),
    idleWorkers: new RollingAverage(10),
    lastControllerProgress: 0
  };
}
