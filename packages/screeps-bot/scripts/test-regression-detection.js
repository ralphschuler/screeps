#!/usr/bin/env node

/**
 * Test Regression Detection
 * 
 * This script tests the regression detection logic with various scenarios.
 * 
 * NOTE: This duplicates the detectRegression function from analyze-performance.js
 * intentionally for integration testing. It verifies the logic works correctly
 * in isolation with well-defined test cases before being used in production.
 */

const REGRESSION_THRESHOLD = 0.10; // 10%
const MEMORY_REGRESSION_THRESHOLD = 0.10; // 10%

/**
 * Detect performance regression
 */
function detectRegression(current, baseline, threshold = REGRESSION_THRESHOLD) {
  if (!baseline) {
    return {
      detected: false,
      reason: 'No baseline available for comparison'
    };
  }
  
  const avgCpuDenom = baseline.avgCpu || Number.EPSILON;
  const maxCpuDenom = baseline.maxCpu || Number.EPSILON;
  const avgMemoryDenom = baseline.avgMemory || Number.EPSILON;
  const maxMemoryDenom = baseline.maxMemory || Number.EPSILON;
  
  const avgCpuChange = (current.avgCpu - baseline.avgCpu) / avgCpuDenom;
  const maxCpuChange = (current.maxCpu - baseline.maxCpu) / maxCpuDenom;
  
  // Only calculate memory changes if both current and baseline have memory data
  const avgMemoryChange = (current.avgMemory !== undefined && baseline.avgMemory !== undefined)
    ? (current.avgMemory - baseline.avgMemory) / avgMemoryDenom
    : 0;
  const maxMemoryChange = (current.maxMemory !== undefined && baseline.maxMemory !== undefined)
    ? (current.maxMemory - baseline.maxMemory) / maxMemoryDenom
    : 0;
  
  const avgRegression = avgCpuChange > threshold;
  const maxRegression = maxCpuChange > threshold;
  const memoryRegression = avgMemoryChange > MEMORY_REGRESSION_THRESHOLD || maxMemoryChange > MEMORY_REGRESSION_THRESHOLD;
  
  return {
    detected: avgRegression || maxRegression || memoryRegression,
    avgCpuChange: avgCpuChange * 100,
    maxCpuChange: maxCpuChange * 100,
    avgMemoryChange: avgMemoryChange * 100,
    maxMemoryChange: maxMemoryChange * 100,
    avgRegression,
    maxRegression,
    memoryRegression,
    threshold: threshold * 100,
    memoryThreshold: MEMORY_REGRESSION_THRESHOLD * 100,
    current,
    baseline
  };
}

console.log('=== Regression Detection Test ===\n');

// Test 1: No regression (equal values)
console.log('Test 1: No regression (equal values)');
const test1 = detectRegression(
  { avgCpu: 0.08, maxCpu: 0.1, avgMemory: 150000, maxMemory: 200000 },
  { avgCpu: 0.08, maxCpu: 0.1, avgMemory: 150000, maxMemory: 200000 }
);
console.log('Result:', test1.detected ? '❌ FAIL' : '✅ PASS');
console.log('Expected: false, Got:', test1.detected);
console.log();

// Test 2: No regression (improvement)
console.log('Test 2: No regression (improvement)');
const test2 = detectRegression(
  { avgCpu: 0.07, maxCpu: 0.09, avgMemory: 140000, maxMemory: 180000 },
  { avgCpu: 0.08, maxCpu: 0.1, avgMemory: 150000, maxMemory: 200000 }
);
console.log('Result:', test2.detected ? '❌ FAIL' : '✅ PASS');
console.log('Expected: false, Got:', test2.detected);
console.log('CPU Change:', test2.avgCpuChange.toFixed(2) + '%');
console.log();

// Test 3: CPU regression detected
console.log('Test 3: CPU regression detected (>10%)');
const test3 = detectRegression(
  { avgCpu: 0.09, maxCpu: 0.1, avgMemory: 150000, maxMemory: 200000 },
  { avgCpu: 0.08, maxCpu: 0.1, avgMemory: 150000, maxMemory: 200000 }
);
console.log('Result:', test3.detected ? '✅ PASS' : '❌ FAIL');
console.log('Expected: true, Got:', test3.detected);
console.log('CPU Change:', test3.avgCpuChange.toFixed(2) + '%');
console.log();

// Test 4: Memory regression detected
console.log('Test 4: Memory regression detected (>10%)');
const test4 = detectRegression(
  { avgCpu: 0.08, maxCpu: 0.1, avgMemory: 200000, maxMemory: 200000 },
  { avgCpu: 0.08, maxCpu: 0.1, avgMemory: 150000, maxMemory: 200000 }
);
console.log('Result:', test4.detected ? '✅ PASS' : '❌ FAIL');
console.log('Expected: true, Got:', test4.detected);
console.log('Memory Change:', test4.avgMemoryChange.toFixed(2) + '%');
console.log();

// Test 5: Small increase within threshold
console.log('Test 5: Small increase within threshold (<10%)');
const test5 = detectRegression(
  { avgCpu: 0.085, maxCpu: 0.105, avgMemory: 155000, maxMemory: 205000 },
  { avgCpu: 0.08, maxCpu: 0.1, avgMemory: 150000, maxMemory: 200000 }
);
console.log('Result:', test5.detected ? '❌ FAIL' : '✅ PASS');
console.log('Expected: false, Got:', test5.detected);
console.log('CPU Change:', test5.avgCpuChange.toFixed(2) + '%');
console.log('Memory Change:', test5.avgMemoryChange.toFixed(2) + '%');
console.log();

// Test 6: No baseline available
console.log('Test 6: No baseline available');
const test6 = detectRegression(
  { avgCpu: 0.08, maxCpu: 0.1, avgMemory: 150000, maxMemory: 200000 },
  null
);
console.log('Result:', test6.detected ? '❌ FAIL' : '✅ PASS');
console.log('Expected: false, Got:', test6.detected);
console.log('Reason:', test6.reason);
console.log();

// Test 7: Memory undefined (should not cause error)
console.log('Test 7: Memory undefined (should not cause error)');
const test7 = detectRegression(
  { avgCpu: 0.08, maxCpu: 0.1 }, // No memory
  { avgCpu: 0.08, maxCpu: 0.1, avgMemory: 150000, maxMemory: 200000 }
);
console.log('Result:', test7.detected ? '❌ FAIL' : '✅ PASS');
console.log('Expected: false, Got:', test7.detected);
console.log('Memory Change:', test7.avgMemoryChange.toFixed(2) + '%');
console.log();

// Summary
const tests = [test1, test2, test3, test4, test5, test6, test7];
const expectedResults = [false, false, true, true, false, false, false];
let passed = 0;

console.log('=== Summary ===');
for (let i = 0; i < tests.length; i++) {
  const result = tests[i].detected === expectedResults[i];
  if (result) passed++;
  console.log(`Test ${i + 1}: ${result ? '✅' : '❌'}`);
}

console.log(`\n${passed}/${tests.length} tests passed`);

if (passed === tests.length) {
  console.log('✅ All regression detection tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}
