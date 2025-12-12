#!/usr/bin/env node

/**
 * Simple test to verify the log capture script creates log files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '..', 'logs');
const consoleLogFile = path.join(logsDir, 'console.log');
const serverLogFile = path.join(logsDir, 'server.log');

console.log('Testing log capture script...');

// Clean up any existing logs
if (fs.existsSync(consoleLogFile)) fs.unlinkSync(consoleLogFile);
if (fs.existsSync(serverLogFile)) fs.unlinkSync(serverLogFile);

console.log('Starting script with timeout...');

// Start the script with a timeout
const scriptProcess = spawn('node', ['scripts/performance-test-with-logs.js', '--maxTickCount=100'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'pipe'
});

let output = '';
scriptProcess.stdout.on('data', (data) => {
  output += data.toString();
});

scriptProcess.stderr.on('data', (data) => {
  output += data.toString();
});

// Give it 10 seconds to start and create log files
setTimeout(() => {
  console.log('Stopping script...');
  scriptProcess.kill('SIGTERM');
  
  // Wait a bit for cleanup
  setTimeout(() => {
    console.log('\nChecking results...');
    
    // Check if log files were created
    const consoleLogExists = fs.existsSync(consoleLogFile);
    const serverLogExists = fs.existsSync(serverLogFile);
    
    console.log(`Console log exists: ${consoleLogExists}`);
    console.log(`Server log exists: ${serverLogExists}`);
    
    if (serverLogExists) {
      const serverLogContent = fs.readFileSync(serverLogFile, 'utf8');
      console.log(`Server log size: ${serverLogContent.length} bytes`);
      if (serverLogContent.length > 0) {
        console.log('First 200 chars of server log:');
        console.log(serverLogContent.substring(0, 200));
      }
    }
    
    // Test result
    const testPassed = consoleLogExists && serverLogExists && fs.statSync(serverLogFile).size > 0;
    
    if (testPassed) {
      console.log('\n✅ Test PASSED: Log files were created');
      process.exit(0);
    } else {
      console.log('\n❌ Test FAILED: Log files were not created properly');
      console.log('\nScript output:');
      console.log(output);
      process.exit(1);
    }
  }, 2000);
}, 10000);
