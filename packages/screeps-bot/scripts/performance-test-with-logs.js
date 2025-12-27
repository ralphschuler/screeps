#!/usr/bin/env node

/**
 * Performance test wrapper that captures all console logs
 * 
 * This script:
 * 1. Starts the screeps-performance-server
 * 2. Connects to the Screeps API to capture ALL console output
 * 3. Writes logs to the logs/ directory for artifact upload
 */

import { spawn } from 'child_process';
import { ScreepsAPI } from 'screeps-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = minimist(process.argv.slice(2));

// Configuration
const config = {
  serverPort: argv.serverPort || 21025,
  cliPort: argv.cliPort || 21026,
  maxTickCount: argv.maxTickCount || 10000,
  maxTimeDuration: argv.maxTimeDuration || 30,
  botFilePath: argv.botFilePath || 'dist',
  deleteLogs: argv.deleteLogs || false,
  force: argv.force || false,
  debug: argv.debug || false,
  logsDir: path.join(__dirname, '..', 'logs'),
  consoleLogFile: path.join(__dirname, '..', 'logs', 'console.log'),
  serverLogFile: path.join(__dirname, '..', 'logs', 'server.log'),
};

// Ensure logs directory exists
if (!fs.existsSync(config.logsDir)) {
  fs.mkdirSync(config.logsDir, { recursive: true });
}

// Create write streams for logs
const consoleLogStream = fs.createWriteStream(config.consoleLogFile, { flags: 'a' });
const serverLogStream = fs.createWriteStream(config.serverLogFile, { flags: 'a' });

let performanceServerProcess = null;
let isShuttingDown = false;

/**
 * Sanitize HTML from messages
 * Uses multiple passes to remove nested HTML tags with a safety limit
 */
function sanitizeHtml(input) {
  const MAX_ITERATIONS = 10; // Prevent infinite loops with malformed HTML
  let clean = String(input);
  let previous = '';
  let iterations = 0;
  
  while (clean !== previous && iterations < MAX_ITERATIONS) {
    previous = clean;
    clean = clean.replace(/<[^>]*>/g, '');
    iterations++;
  }
  
  return clean;
}

/**
 * Log message with timestamp
 */
function log(message, stream = console.log) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  stream(logMessage);
  return logMessage;
}

/**
 * Start the performance server
 */
function startPerformanceServer() {
  return new Promise((resolve, reject) => {
    log('Starting screeps-performance-server...');
    
    const args = [
      'screeps-performance-server',
      `--serverPort=${config.serverPort}`,
      `--cliPort=${config.cliPort}`,
      `--maxTickCount=${config.maxTickCount}`,
      `--maxTimeDuration=${config.maxTimeDuration}`,
      `--botFilePath=${config.botFilePath}`,
    ];

    if (config.deleteLogs) args.push('--deleteLogs');
    if (config.force) args.push('--force');
    if (config.debug) args.push('--debug');

    performanceServerProcess = spawn('npx', args, {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: {
        ...process.env,
        DOCKER_DEFAULT_PLATFORM: 'linux/amd64',
      },
    });

    let serverReady = false;

    // Capture stdout and stderr
    performanceServerProcess.stdout.on('data', (data) => {
      const message = data.toString();
      serverLogStream.write(message);
      if (config.debug) {
        process.stdout.write(message);
      }

      // Detect when server is ready
      if (!serverReady && (message.includes('Start the simulation') || message.includes('system.resumeSimulation'))) {
        serverReady = true;
        log('Performance server is ready, connecting to API...');
        resolve();
      }
    });

    performanceServerProcess.stderr.on('data', (data) => {
      const message = data.toString();
      serverLogStream.write(message);
      if (config.debug) {
        process.stderr.write(message);
      }
    });

    performanceServerProcess.on('error', (error) => {
      log(`Performance server error: ${error.message}`, console.error);
      reject(error);
    });

    performanceServerProcess.on('exit', (code) => {
      log(`Performance server exited with code ${code}`);
      if (!isShuttingDown) {
        cleanup().then(() => process.exit(code));
      }
    });

    // Give it some time to start up
    setTimeout(() => {
      if (!serverReady) {
        log('Server startup timeout reached, attempting to connect anyway...');
        serverReady = true; // Prevent double resolve
        resolve();
      }
    }, 60000); // 60 second timeout (increased from 30)
  });
}

/**
 * Connect to the Screeps API and capture console logs
 */
async function connectToAPI() {
  const maxRetries = 10;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log(`Attempting to connect to Screeps API (attempt ${attempt}/${maxRetries})...`);

      const api = new ScreepsAPI({
        email: 'W1N1', // Default bot username
        password: 'password',
        protocol: 'http',
        hostname: '127.0.0.1',
        port: config.serverPort,
        path: '/',
      });

      // Authenticate
      await api.auth();
      log('Successfully authenticated with Screeps API');

      // Connect websocket
      api.socket.connect();

      api.socket.on('connected', () => {
        log('WebSocket connected');
        apiConnected = true;
      });

      api.socket.on('auth', (event) => {
        log('WebSocket authenticated');
      });

      api.socket.on('error', (error) => {
        log(`WebSocket error: ${error}`, console.error);
      });

      // Subscribe to console output for all tracked rooms
      const rooms = ['W1N1', 'W2N1', 'W3N1']; // Add more rooms as needed
      
      // Note: We don't need room data updates for log capture, only console output
      // Room subscriptions are kept minimal to reduce network traffic

      // Subscribe to console logs
      api.socket.subscribe('console', (event) => {
        if (event.data && event.data.messages && event.data.messages.log) {
          event.data.messages.log.forEach((message) => {
            const cleanMessage = sanitizeHtml(message);
            const logLine = log(`[Console] ${cleanMessage}`);
            consoleLogStream.write(logLine + '\n');
          });
        }

        // Also capture results
        if (event.data && event.data.messages && event.data.messages.results) {
          event.data.messages.results.forEach((result) => {
            const cleanResult = sanitizeHtml(result);
            const logLine = log(`[Result] ${cleanResult}`);
            consoleLogStream.write(logLine + '\n');
          });
        }
      });

      log('Successfully connected to Screeps API and subscribed to console logs');
      return api;

    } catch (error) {
      log(`Failed to connect to Screeps API: ${error.message}`, console.error);
      
      if (attempt < maxRetries) {
        log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        log('Max retries reached, continuing without API connection', console.error);
        return null;
      }
    }
  }
}

/**
 * Cleanup resources
 */
async function cleanup() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  log('Cleaning up...');

  // Close log streams
  consoleLogStream.end();
  serverLogStream.end();

  // Kill performance server if still running
  if (performanceServerProcess && !performanceServerProcess.killed) {
    log('Terminating performance server...');
    performanceServerProcess.kill('SIGTERM');

    // Force kill after 5 seconds
    const forceKillTimeout = setTimeout(() => {
      if (performanceServerProcess && !performanceServerProcess.killed) {
        log('Force killing performance server...');
        performanceServerProcess.kill('SIGKILL');
      }
    }, 5000);

    // Clear timeout if process exits before force kill
    performanceServerProcess.once('exit', () => {
      clearTimeout(forceKillTimeout);
    });
  }

  log('Cleanup complete');
}

/**
 * Main execution
 */
async function main() {
  log('=== Performance Test with Log Capture ===');
  log(`Configuration: ${JSON.stringify(config, null, 2)}`);

  // Setup signal handlers
  process.on('SIGINT', async () => {
    log('Received SIGINT, shutting down...');
    await cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    log('Received SIGTERM, shutting down...');
    await cleanup();
    process.exit(0);
  });

  try {
    // Start performance server
    await startPerformanceServer();

    // Connect to API for log capture
    const api = await connectToAPI();

    if (api) {
      log('Log capture is active. Waiting for performance test to complete...');
    } else {
      log('Warning: Running without log capture. Logs may be incomplete.', console.error);
    }

    // The performance server will exit when done, which will trigger our cleanup
    log('Performance test is running. Press Ctrl+C to stop.');

  } catch (error) {
    log(`Fatal error: ${error.message}`, console.error);
    await cleanup();
    process.exit(1);
  }
}

// Run the main function
main().catch(async (error) => {
  log(`Unhandled error: ${error.message}`, console.error);
  await cleanup();
  process.exit(1);
});
