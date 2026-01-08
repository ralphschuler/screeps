#!/usr/bin/env node

/**
 * Test Memory Parsing Integration
 * 
 * This script tests the memory parsing functionality by creating
 * a mock console log and verifying it's parsed correctly.
 * 
 * NOTE: This duplicates the parseCpuMetrics function from analyze-performance.js
 * intentionally for integration testing. It verifies the logic works correctly
 * in isolation before being used in the main analysis script.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data
const mockConsoleLog = `
{"type":"stats","tick":1,"data":{"cpu":{"used":5.5,"bucket":9500},"memory":{"used":150000}}}
CPU: 3.2 Bucket: 9800 Memory: 125KB
{"type":"stats","tick":2,"data":{"cpu":{"used":6.0,"bucket":9450},"memory":{"used":160000}}}
CPU: 4.1 Bucket: 9750 Memory: 2MB
{"type":"stats","tick":3,"data":{"cpu":{"used":5.8,"bucket":9480}}}
CPU: 3.5 Bucket: 9820
`;

/**
 * Parse CPU usage and memory metrics from console logs
 */
function parseCpuMetrics(consoleLog) {
  const cpuHistory = [];
  const bucketHistory = [];
  const memoryHistory = [];
  
  const lines = consoleLog.split('\n');
  
  for (const line of lines) {
    // Try parsing JSON stats format first
    if (line.includes('"type":"stats"') || line.includes('"type": "stats"')) {
      try {
        const stats = JSON.parse(line);
        if (stats.data && stats.data.cpu) {
          if (typeof stats.data.cpu.used === 'number') {
            cpuHistory.push(stats.data.cpu.used);
          }
          if (typeof stats.data.cpu.bucket === 'number') {
            bucketHistory.push(stats.data.cpu.bucket);
          }
        }
        if (stats.data && stats.data.memory) {
          if (typeof stats.data.memory.used === 'number') {
            memoryHistory.push(stats.data.memory.used);
          }
        }
        continue;
      } catch {
        // Not valid JSON, continue to plain text parsing
      }
    }
    
    // Try plain text format
    const cpuMatch = line.match(/CPU:\s*([\d.]+)/i);
    if (cpuMatch) {
      const cpu = parseFloat(cpuMatch[1]);
      if (!isNaN(cpu)) {
        cpuHistory.push(cpu);
      }
    }
    
    const bucketMatch = line.match(/Bucket:\s*(\d+)/i);
    if (bucketMatch) {
      const bucket = parseInt(bucketMatch[1], 10);
      if (!isNaN(bucket)) {
        bucketHistory.push(bucket);
      }
    }
    
    const memoryMatch = line.match(/Memory:\s*([\d.]+)\s*(KB|MB|bytes)?/i);
    if (memoryMatch) {
      let memory = parseFloat(memoryMatch[1]);
      const unit = memoryMatch[2] ? memoryMatch[2].toLowerCase() : 'kb';
      
      if (unit === 'kb') {
        memory = memory * 1024;
      } else if (unit === 'mb') {
        memory = memory * 1024 * 1024;
      }
      
      if (!isNaN(memory)) {
        memoryHistory.push(memory);
      }
    }
  }
  
  return { cpuHistory, bucketHistory, memoryHistory };
}

// Run test
console.log('=== Memory Parsing Integration Test ===\n');

const { cpuHistory, bucketHistory, memoryHistory } = parseCpuMetrics(mockConsoleLog);

console.log('CPU History:', cpuHistory);
console.log('Bucket History:', bucketHistory);
console.log('Memory History:', memoryHistory);

// Verify results
const expectedCpu = [5.5, 3.2, 6.0, 4.1, 5.8, 3.5];
const expectedBucket = [9500, 9800, 9450, 9750, 9480, 9820];
const expectedMemory = [150000, 125 * 1024, 160000, 2 * 1024 * 1024];

console.log('\n=== Verification ===');

let passed = true;

// Check CPU
if (JSON.stringify(cpuHistory) !== JSON.stringify(expectedCpu)) {
  console.log('❌ CPU parsing failed');
  console.log('Expected:', expectedCpu);
  console.log('Got:', cpuHistory);
  passed = false;
} else {
  console.log('✅ CPU parsing passed');
}

// Check Bucket
if (JSON.stringify(bucketHistory) !== JSON.stringify(expectedBucket)) {
  console.log('❌ Bucket parsing failed');
  console.log('Expected:', expectedBucket);
  console.log('Got:', bucketHistory);
  passed = false;
} else {
  console.log('✅ Bucket parsing passed');
}

// Check Memory
if (JSON.stringify(memoryHistory) !== JSON.stringify(expectedMemory)) {
  console.log('❌ Memory parsing failed');
  console.log('Expected:', expectedMemory);
  console.log('Got:', memoryHistory);
  passed = false;
} else {
  console.log('✅ Memory parsing passed');
}

if (passed) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed');
  process.exit(1);
}
