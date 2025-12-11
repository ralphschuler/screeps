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
