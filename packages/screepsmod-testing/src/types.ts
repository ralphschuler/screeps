/**
 * Test result status
 */
export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

/**
 * Test assertion error
 */
export class AssertionError extends Error {
  constructor(message: string, public expected?: any, public actual?: any) {
    super(message);
    this.name = 'AssertionError';
  }
}

/**
 * Individual test case
 */
export interface TestCase {
  name: string;
  description?: string;
  fn: () => void | Promise<void>;
  timeout?: number;
  skip?: boolean;
  tags?: string[];
}

/**
 * Test suite containing multiple tests
 */
export interface TestSuite {
  name: string;
  description?: string;
  tests: TestCase[];
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
  beforeAll?: () => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
}

/**
 * Test result for a single test
 */
export interface TestResult {
  suiteName: string;
  testName: string;
  status: TestStatus;
  duration: number;
  error?: {
    message: string;
    stack?: string;
    expected?: any;
    actual?: any;
  };
  tick: number;
  tags?: string[];
  cpuUsed?: number;
  memoryUsed?: number;
}

/**
 * Summary of all test results
 */
export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  startTick: number;
  endTick: number;
  results: TestResult[];
  timestamp?: number;
  serverVersion?: string;
  coverage?: TestCoverage;
}

/**
 * Test context providing access to game state
 */
export interface TestContext {
  Game: any;
  Memory: any;
  RawMemory: any;
  InterShardMemory: any;
  tick: number;
  getObjectById: (id: string) => any;
  getRoomObject: (roomName: string) => any;
}

/**
 * Test filtering options
 */
export interface TestFilter {
  pattern?: string | RegExp;
  tags?: string[];
  suites?: string[];
  excludeTags?: string[];
  excludeSuites?: string[];
}

/**
 * Test coverage information
 */
export interface TestCoverage {
  lines: {
    total: number;
    covered: number;
    percentage: number;
  };
  branches: {
    total: number;
    covered: number;
    percentage: number;
  };
  functions: {
    total: number;
    covered: number;
    percentage: number;
  };
  statements: {
    total: number;
    covered: number;
    percentage: number;
  };
}

/**
 * Performance benchmark result
 */
export interface BenchmarkResult {
  name: string;
  samples: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  iterations: number;
}

/**
 * Visual snapshot for testing
 */
export interface VisualSnapshot {
  roomName: string;
  tick: number;
  visualData: string; // Serialized RoomVisual data
  timestamp: number;
}

/**
 * Test persistence metadata
 */
export interface TestPersistence {
  version: string;
  lastRun: number;
  totalRuns: number;
  summaries: TestSummary[];
  maxHistorySize?: number;
}

/**
 * JSON output format for CI/CD
 */
export interface TestOutput {
  version: string;
  timestamp: number;
  environment: {
    server: string;
    tick: number;
  };
  summary: TestSummary;
  coverage?: TestCoverage;
  benchmarks?: BenchmarkResult[];
}
