import { TestSuite, TestCase, TestResult, TestSummary, TestContext, TestStatus, TestFilter } from './types';
import { FilterManager } from './filter';
import { CPUTracker, MemoryTracker } from './performance';

/**
 * Test runner that executes tests within the Screeps server environment
 */
export class TestRunner {
  private suites: Map<string, TestSuite> = new Map();
  private results: TestResult[] = [];
  private isRunning = false;
  private startTick = 0;
  private currentSuiteIndex = 0;
  private currentTestIndex = 0;
  private filter?: FilterManager;

  /**
   * Register a test suite
   */
  registerSuite(suite: TestSuite): void {
    this.suites.set(suite.name, suite);
  }

  /**
   * Register a single test (creates a suite if needed)
   */
  registerTest(suiteName: string, test: TestCase): void {
    let suite = this.suites.get(suiteName);
    if (!suite) {
      suite = {
        name: suiteName,
        tests: []
      };
      this.suites.set(suiteName, suite);
    }
    suite.tests.push(test);
  }

  /**
   * Get all registered suites
   */
  getSuites(): TestSuite[] {
    return Array.from(this.suites.values());
  }

  /**
   * Set test filter
   */
  setFilter(filter?: TestFilter): void {
    this.filter = filter ? new FilterManager(filter) : undefined;
  }

  /**
   * Start running tests
   */
  async start(context: TestContext, filter?: TestFilter): Promise<void> {
    if (this.isRunning) {
      console.log('[screepsmod-testing] Test run already in progress');
      return;
    }

    this.isRunning = true;
    this.startTick = context.tick;
    this.results = [];
    this.currentSuiteIndex = 0;
    this.currentTestIndex = 0;

    // Apply filter if provided
    if (filter) {
      this.setFilter(filter);
    }

    console.log(`[screepsmod-testing] Starting test run at tick ${context.tick}`);
    console.log(`[screepsmod-testing] Found ${this.suites.size} test suites`);
    
    if (this.filter) {
      console.log(`[screepsmod-testing] Filter: ${this.filter.getSummary()}`);
    }

    await this.runAllTests(context);
  }

  /**
   * Run all registered tests
   */
  private async runAllTests(context: TestContext): Promise<void> {
    let suites = Array.from(this.suites.values());

    // Apply filter if set
    if (this.filter) {
      suites = this.filter.filterSuites(suites);
      console.log(`[screepsmod-testing] Running ${suites.length} filtered suites`);
    }

    for (const suite of suites) {
      await this.runSuite(suite, context);
    }

    this.isRunning = false;
    this.logSummary(context);
  }

  /**
   * Run a single test suite
   */
  private async runSuite(suite: TestSuite, context: TestContext): Promise<void> {
    console.log(`[screepsmod-testing] Running suite: ${suite.name}`);

    // Run beforeAll hook
    if (suite.beforeAll) {
      try {
        await suite.beforeAll();
      } catch (error) {
        console.log(`[screepsmod-testing] Suite beforeAll failed: ${error}`);
        return;
      }
    }

    // Run each test
    for (const test of suite.tests) {
      if (test.skip) {
        this.results.push({
          suiteName: suite.name,
          testName: test.name,
          status: 'skipped',
          duration: 0,
          tick: context.tick
        });
        continue;
      }

      // Run beforeEach hook
      if (suite.beforeEach) {
        try {
          await suite.beforeEach();
        } catch (error) {
          console.log(`[screepsmod-testing] beforeEach failed: ${error}`);
        }
      }

      // Run the test
      await this.runTest(suite.name, test, context);

      // Run afterEach hook
      if (suite.afterEach) {
        try {
          await suite.afterEach();
        } catch (error) {
          console.log(`[screepsmod-testing] afterEach failed: ${error}`);
        }
      }
    }

    // Run afterAll hook
    if (suite.afterAll) {
      try {
        await suite.afterAll();
      } catch (error) {
        console.log(`[screepsmod-testing] Suite afterAll failed: ${error}`);
      }
    }
  }

  /**
   * Run a single test
   */
  private async runTest(suiteName: string, test: TestCase, context: TestContext): Promise<void> {
    const startTime = Date.now();
    const cpuTracker = new CPUTracker();
    const memoryTracker = new MemoryTracker();
    
    const result: TestResult = {
      suiteName,
      testName: test.name,
      status: 'running',
      duration: 0,
      tick: context.tick,
      tags: test.tags
    };

    try {
      // Start performance tracking
      cpuTracker.start();
      memoryTracker.start();

      // Run test with timeout
      const timeout = test.timeout || 5000;
      await this.runWithTimeout(test.fn, timeout);
      
      // Stop performance tracking
      result.cpuUsed = cpuTracker.stop();
      result.memoryUsed = memoryTracker.stop();
      
      result.status = 'passed';
      result.duration = Date.now() - startTime;
      
      let perfInfo = '';
      if (result.cpuUsed !== undefined) {
        perfInfo = ` (${result.duration}ms, ${result.cpuUsed.toFixed(2)} CPU)`;
      } else {
        perfInfo = ` (${result.duration}ms)`;
      }
      
      console.log(`[screepsmod-testing] ✓ ${suiteName} > ${test.name}${perfInfo}`);
    } catch (error: any) {
      result.status = 'failed';
      result.duration = Date.now() - startTime;
      result.cpuUsed = cpuTracker.stop();
      result.memoryUsed = memoryTracker.stop();
      result.error = {
        message: error.message || String(error),
        stack: error.stack,
        expected: error.expected,
        actual: error.actual
      };
      console.log(`[screepsmod-testing] ✗ ${suiteName} > ${test.name}`);
      console.log(`[screepsmod-testing]   ${error.message}`);
      if (error.stack) {
        console.log(`[screepsmod-testing]   ${error.stack}`);
      }
    }

    this.results.push(result);
  }

  /**
   * Run a function with timeout
   */
  private async runWithTimeout(fn: () => void | Promise<void>, timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Test timeout after ${timeout}ms`));
      }, timeout);

      Promise.resolve(fn())
        .then(() => {
          clearTimeout(timer);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Get test summary
   */
  getSummary(currentTick: number): TestSummary {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return {
      total: this.results.length,
      passed,
      failed,
      skipped,
      duration,
      startTick: this.startTick,
      endTick: currentTick,
      results: this.results,
      timestamp: Date.now()
    };
  }

  /**
   * Log test summary
   */
  private logSummary(context: TestContext): void {
    const summary = this.getSummary(context.tick);
    const tickDuration = context.tick - summary.startTick;

    console.log('\n[screepsmod-testing] ========================================');
    console.log('[screepsmod-testing] Test Summary');
    console.log('[screepsmod-testing] ========================================');
    console.log(`[screepsmod-testing] Total:   ${summary.total}`);
    console.log(`[screepsmod-testing] Passed:  ${summary.passed}`);
    console.log(`[screepsmod-testing] Failed:  ${summary.failed}`);
    console.log(`[screepsmod-testing] Skipped: ${summary.skipped}`);
    console.log(`[screepsmod-testing] Duration: ${summary.duration}ms (${tickDuration} ticks)`);
    console.log('[screepsmod-testing] ========================================\n');

    if (summary.failed > 0) {
      console.log('[screepsmod-testing] Failed tests:');
      for (const result of summary.results.filter(r => r.status === 'failed')) {
        console.log(`[screepsmod-testing]   ✗ ${result.suiteName} > ${result.testName}`);
        if (result.error) {
          console.log(`[screepsmod-testing]     ${result.error.message}`);
        }
      }
      console.log('');
    }
  }

  /**
   * Clear all test results
   */
  clear(): void {
    this.results = [];
    this.isRunning = false;
    this.currentSuiteIndex = 0;
    this.currentTestIndex = 0;
  }

  /**
   * Reset the test runner (clear suites and results)
   */
  reset(): void {
    this.suites.clear();
    this.clear();
  }
}
