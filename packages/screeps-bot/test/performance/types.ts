/**
 * Performance testing types and interfaces
 */

export interface PerformanceScenario {
  name: string;
  description: string;
  setup: ScenarioSetup;
  targets: PerformanceTargets;
}

export interface ScenarioSetup {
  /** Room names to spawn bot in */
  rooms: string[];
  /** Room Control Levels (single value or array matching rooms) */
  rcl?: number | number[];
  /** Initial energy per room */
  energy?: number;
  /** Number of sources per room */
  sources?: number;
  /** Initial creep composition */
  creeps?: {
    [role: string]: number;
  };
  /** Hostile creeps for combat scenarios */
  hostiles?: {
    [type: string]: number;
  };
  /** Number of towers for defense scenarios */
  towers?: number;
  /** Total creep count (for multi-room scenarios) */
  totalCreeps?: number;
}

export interface PerformanceTargets {
  /** Maximum CPU per tick allowed */
  maxCpuPerTick: number;
  /** Average CPU per tick target */
  avgCpuPerTick: number;
  /** Minimum CPU bucket stability */
  bucketStability?: number;
  /** Whether hostiles must be eliminated (combat scenarios) */
  hostilesEliminated?: boolean;
  /** Whether structures must survive (combat scenarios) */
  structuresSurvived?: boolean;
}

export interface PerformanceMetrics {
  /** CPU usage per tick */
  cpuHistory: number[];
  /** Bucket level per tick */
  bucketHistory: number[];
  /** Number of ticks executed */
  tickCount: number;
  /** Start time of test */
  startTime: number;
  /** End time of test */
  endTime: number;
  /** Test duration in milliseconds */
  duration: number;
}

export interface PerformanceAnalysis {
  /** Average CPU usage */
  avgCpu: number;
  /** Maximum CPU usage */
  maxCpu: number;
  /** 95th percentile CPU usage */
  p95Cpu: number;
  /** 99th percentile CPU usage */
  p99Cpu: number;
  /** Median CPU usage */
  medianCpu: number;
  /** Average bucket level */
  avgBucket?: number;
  /** Minimum bucket level */
  minBucket?: number;
  /** Whether bucket remained stable */
  bucketStable: boolean;
}

export interface PerformanceReport {
  /** Scenario name */
  scenario: string;
  /** Whether test passed all targets */
  passed: boolean;
  /** Performance metrics collected */
  metrics: PerformanceMetrics;
  /** Analyzed performance data */
  analysis: PerformanceAnalysis;
  /** Target values for comparison */
  targets: PerformanceTargets;
  /** Detailed failure reasons */
  failures?: string[];
  /** Timestamp of test run */
  timestamp: string;
  /** Git commit hash */
  commit?: string;
}

export interface PerformanceBaseline {
  /** Git commit hash */
  commit: string;
  /** Timestamp of baseline creation */
  timestamp: string;
  /** Branch name */
  branch: string;
  /** Scenario results */
  scenarios: {
    [scenarioName: string]: {
      avgCpu: number;
      maxCpu: number;
      p95Cpu: number;
      p99Cpu: number;
    };
  };
}

export interface RegressionResult {
  /** Whether regression was detected */
  detected: boolean;
  /** Scenario name */
  scenario: string;
  /** Current performance values */
  current: PerformanceAnalysis;
  /** Baseline performance values */
  baseline: PerformanceAnalysis;
  /** Percentage change in avg CPU */
  avgCpuChange: number;
  /** Percentage change in max CPU */
  maxCpuChange: number;
  /** Whether change exceeds threshold */
  exceedsThreshold: boolean;
  /** Regression threshold percentage */
  threshold: number;
}
