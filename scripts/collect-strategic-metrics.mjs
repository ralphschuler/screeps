#!/usr/bin/env node

/**
 * Strategic Metrics Collection Script (Node.js Version)
 * 
 * Collects live performance data from screeps-mcp and grafana-mcp servers
 * for use by the strategic planning agent.
 * 
 * This script uses the MCP SDK to properly communicate with MCP servers,
 * solving the problem where Docker-based MCP servers cannot be accessed
 * directly by the GitHub Copilot CLI during workflow runs.
 * 
 * Usage:
 *   node scripts/collect-strategic-metrics.mjs [output-file]
 * 
 * Environment Variables Required:
 *   SCREEPS_TOKEN - Screeps API authentication token
 *   SCREEPS_HOST - Screeps server host (default: screeps.com)
 *   SCREEPS_SHARD - Target shard (default: shard3)
 *   GRAFANA_SERVICE_ACCOUNT_TOKEN - Grafana API token (optional)
 *   RUN_ID - GitHub Actions run ID (optional)
 *   RUN_URL - GitHub Actions run URL (optional)
 *   VERBOSE - Enable verbose logging (optional, default: false)
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { spawn } from "node:child_process";

// Configuration
const OUTPUT_FILE = process.argv[2] || 'performance-baselines/strategic/collected-metrics.json';
const TIMESTAMP = new Date().toISOString();
const VERBOSE = process.env.VERBOSE === 'true' || process.env.VERBOSE === '1';
const MCP_TIMEOUT = 30000; // 30 seconds per MCP call

// Logging helper
function log(message, level = 'info') {
  const prefix = {
    info: '📋',
    success: '✅',
    warn: '⚠️ ',
    error: '❌',
    debug: '🔍'
  }[level] || 'ℹ️ ';
  console.log(`${prefix} ${message}`);
}

function debug(message) {
  if (VERBOSE) {
    log(message, 'debug');
  }
}

log('Collecting strategic metrics...', 'info');
log(`Output: ${OUTPUT_FILE}`, 'info');
log(`Timestamp: ${TIMESTAMP}`, 'info');
log(`Verbose: ${VERBOSE}`, 'info');

// Ensure output directory exists
mkdirSync(dirname(OUTPUT_FILE), { recursive: true });

/**
 * Check if a Docker image exists and is available
 */
async function checkDockerImage(imageName) {
  return new Promise((resolve) => {
    debug(`Checking Docker image: ${imageName}`);
    const proc = spawn('docker', ['image', 'inspect', imageName]);
    
    proc.on('close', (code) => {
      const available = code === 0;
      debug(`Docker image ${imageName}: ${available ? 'available' : 'not found'}`);
      resolve(available);
    });
    
    proc.on('error', (err) => {
      debug(`Docker check error: ${err.message}`);
      resolve(false);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      proc.kill();
      resolve(false);
    }, 5000);
  });
}

/**
 * Check if Docker is available and working
 */
async function checkDocker() {
  return new Promise((resolve) => {
    debug('Checking Docker availability...');
    const proc = spawn('docker', ['version']);
    
    proc.on('close', (code) => {
      const available = code === 0;
      debug(`Docker: ${available ? 'available' : 'not available'}`);
      resolve(available);
    });
    
    proc.on('error', (err) => {
      debug(`Docker error: ${err.message}`);
      resolve(false);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      proc.kill();
      resolve(false);
    }, 5000);
  });
}

/**
 * Create an MCP client connected to a Docker-based server
 */
async function createDockerMCPClient(dockerImage, envVars, clientName = 'metrics-collector') {
  debug(`Creating Docker MCP client for ${dockerImage}`);
  
  const dockerArgs = [
    'run', '--rm', '-i',
    ...Object.entries(envVars).flatMap(([key, value]) => ['-e', `${key}=${value}`]),
    dockerImage
  ];

  debug(`Docker command: docker ${dockerArgs.join(' ')}`);

  const transport = new StdioClientTransport({
    command: 'docker',
    args: dockerArgs,
    env: process.env
  });

  const client = new Client(
    { name: clientName, version: '1.0.0' },
    { capabilities: {} }
  );

  try {
    await Promise.race([
      client.connect(transport),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Client connection timeout')), 10000)
      )
    ]);
    debug(`Successfully connected to ${dockerImage}`);
    return client;
  } catch (error) {
    log(`Failed to connect to ${dockerImage}: ${error.message}`, 'warn');
    throw error;
  }
}

/**
 * Call an MCP tool and return the result with timeout
 */
async function callMCPTool(client, toolName, args = {}, timeout = MCP_TIMEOUT) {
  debug(`Calling MCP tool: ${toolName} with args: ${JSON.stringify(args)}`);
  
  try {
    const result = await Promise.race([
      client.request({
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Tool call timeout after ${timeout}ms`)), timeout)
      )
    ]);
    
    debug(`MCP tool ${toolName} succeeded`);
    return { success: true, data: result };
  } catch (error) {
    log(`Failed to call ${toolName}: ${error.message}`, 'warn');
    return { success: false, error: error.message };
  }
}

/**
 * Parse MCP tool result content
 */
function parseToolResult(result) {
  if (!result.success) {
    return null;
  }
  
  try {
    const content = result.data?.content?.[0];
    if (content?.type === 'text') {
      // Try to parse as JSON if it looks like JSON
      const text = content.text;
      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        return JSON.parse(text);
      }
      return text;
    }
    return result.data;
  } catch (error) {
    log(`Failed to parse tool result: ${error.message}`, 'warn');
    return result.data;
  }
}

/**
 * Fallback: Call Screeps API directly using screeps-api library
 */
async function callScreepsAPIDirectly(endpoint, params = {}) {
  debug(`Calling Screeps API directly: ${endpoint}`);
  
  const token = process.env.SCREEPS_TOKEN;
  const host = process.env.SCREEPS_HOST || 'screeps.com';
  const shard = process.env.SCREEPS_SHARD || 'shard3';
  
  if (!token) {
    log('SCREEPS_TOKEN not provided, cannot use direct API', 'warn');
    return null;
  }
  
  try {
    // Using direct HTTP calls since we don't have screeps-api installed
    const https = await import('https');
    const url = `https://${host}/api/${endpoint}`;
    
    debug(`Direct API URL: ${url}`);
    
    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'GET',
        headers: {
          'X-Token': token,
          'X-Username': token
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.ok) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error || 'API error'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
  } catch (error) {
    log(`Direct Screeps API call failed: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Get user info using direct API
 */
async function getUserInfoDirect(username) {
  try {
    const result = await callScreepsAPIDirectly(`user/find?username=${username}`);
    return result?.user || null;
  } catch (error) {
    log(`Failed to get user info: ${error.message}`, 'error');
    return null;
  }
}

// Main collection logic
async function collectMetrics() {
  const collectedData = {
    timestamp: TIMESTAMP,
    runId: process.env.RUN_ID || 'unknown',
    runUrl: process.env.RUN_URL || 'unknown',
    dataSourcesUsed: {},
    diagnostics: {
      docker: {},
      mcp: {},
      fallbacks: {}
    },
    rawData: {
      screeps: {},
      grafana: {}
    },
    summary: {}
  };

  // ============================================================
  // PHASE 0: Pre-flight checks
  // ============================================================
  log('Running pre-flight checks...', 'info');
  
  const dockerAvailable = await checkDocker();
  collectedData.diagnostics.docker.available = dockerAvailable;
  
  if (!dockerAvailable) {
    log('Docker not available - will use API fallbacks only', 'warn');
  }

  // ============================================================
  // PHASE 1: Collect Screeps data
  // ============================================================
  log('Collecting Screeps game state...', 'info');
  
  let screepsClient = null;
  let screepsClientConnected = false;
  
  try {
    if (dockerAvailable) {
      const imageAvailable = await checkDockerImage('ghcr.io/ralphschuler/screeps-mcp:latest');
      collectedData.diagnostics.docker.screepsMcpImage = imageAvailable;
      
      if (imageAvailable) {
        try {
          screepsClient = await createDockerMCPClient(
            'ghcr.io/ralphschuler/screeps-mcp:latest',
            {
              SCREEPS_TOKEN: process.env.SCREEPS_TOKEN,
              SCREEPS_HOST: process.env.SCREEPS_HOST || 'screeps.com',
              SCREEPS_SHARD: process.env.SCREEPS_SHARD || 'shard3'
            },
            'screeps-collector'
          );
          screepsClientConnected = true;
          collectedData.diagnostics.mcp.screepsConnected = true;
        } catch (error) {
          log(`Failed to create Screeps MCP client: ${error.message}`, 'error');
          collectedData.diagnostics.mcp.screepsConnected = false;
          collectedData.diagnostics.mcp.screepsError = error.message;
        }
      }
    }

    if (screepsClientConnected && screepsClient) {
      // Try MCP calls
      log('→ screeps_stats (via MCP)', 'info');
      const statsResult = await callMCPTool(screepsClient, 'screeps_stats');
      collectedData.dataSourcesUsed.screeps_stats = statsResult.success;
      collectedData.rawData.screeps.stats = parseToolResult(statsResult);

      log('→ screeps_game_time (via MCP)', 'info');
      const timeResult = await callMCPTool(screepsClient, 'screeps_game_time');
      collectedData.dataSourcesUsed.screeps_game_time = timeResult.success;
      collectedData.rawData.screeps.gameTime = parseToolResult(timeResult);

      log('→ screeps_user_info (via MCP)', 'info');
      const userInfoResult = await callMCPTool(screepsClient, 'screeps_user_info', {
        username: 'ralphschuler'
      });
      collectedData.dataSourcesUsed.screeps_user_info = userInfoResult.success;
      let userInfo = parseToolResult(userInfoResult);
      collectedData.rawData.screeps.userInfo = userInfo;

      // Fallback to direct API if MCP user info failed
      if (!userInfoResult.success || !userInfo) {
        log('MCP user info failed, trying direct API fallback...', 'warn');
        collectedData.diagnostics.fallbacks.screepsApi = true;
        
        userInfo = await getUserInfoDirect('ralphschuler');
        if (userInfo) {
          collectedData.rawData.screeps.userInfo = userInfo;
          collectedData.dataSourcesUsed.screeps_user_info = true;
          log('Successfully retrieved user info via direct API', 'success');
        }
      }

      // Get user rooms if we have user ID
      if (userInfo?._id) {
        log('→ screeps_user_rooms (via MCP)', 'info');
        const roomsResult = await callMCPTool(screepsClient, 'screeps_user_rooms', {
          userId: userInfo._id
        });
        collectedData.dataSourcesUsed.screeps_user_rooms = roomsResult.success;
        collectedData.rawData.screeps.rooms = parseToolResult(roomsResult);
      }
    } else {
      log('Using Screeps API fallback...', 'warn');
      collectedData.diagnostics.fallbacks.screepsApi = true;
      
      // Fallback to direct API
      const userInfo = await getUserInfoDirect('ralphschuler');
      if (userInfo) {
        collectedData.rawData.screeps.userInfo = userInfo;
        collectedData.dataSourcesUsed.screeps_user_info = true;
        log('Successfully retrieved user info via direct API', 'success');
      } else {
        collectedData.dataSourcesUsed.screeps_user_info = false;
        log('Failed to retrieve user info via direct API', 'error');
      }
    }
  } catch (error) {
    log(`Screeps data collection failed: ${error.message}`, 'error');
    collectedData.diagnostics.screeps = { error: error.message };
    collectedData.dataSourcesUsed.screeps_stats = collectedData.dataSourcesUsed.screeps_stats || false;
    collectedData.dataSourcesUsed.screeps_game_time = collectedData.dataSourcesUsed.screeps_game_time || false;
    collectedData.dataSourcesUsed.screeps_user_info = collectedData.dataSourcesUsed.screeps_user_info || false;
    collectedData.dataSourcesUsed.screeps_user_rooms = collectedData.dataSourcesUsed.screeps_user_rooms || false;
  } finally {
    if (screepsClient) {
      try { 
        await screepsClient.close(); 
        debug('Screeps MCP client closed');
      } catch (e) {
        debug(`Error closing Screeps client: ${e.message}`);
      }
    }
  }

  // ============================================================
  // PHASE 2: Collect Grafana metrics (optional)
  // ============================================================
  log('Collecting Grafana metrics...', 'info');
  
  const hasGrafanaToken = !!process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN;
  
  if (!hasGrafanaToken) {
    log('GRAFANA_SERVICE_ACCOUNT_TOKEN not provided, skipping Grafana metrics', 'warn');
    collectedData.dataSourcesUsed.grafana_cpu_metrics = false;
    collectedData.dataSourcesUsed.grafana_gcl_metrics = false;
    collectedData.dataSourcesUsed.grafana_error_logs = false;
    collectedData.diagnostics.grafana = { skipped: 'no token provided' };
  } else {
    let grafanaClient = null;
    let grafanaClientConnected = false;
    
    try {
      if (dockerAvailable) {
        const imageAvailable = await checkDockerImage('mcp/grafana:latest');
        collectedData.diagnostics.docker.grafanaMcpImage = imageAvailable;
        
        if (imageAvailable) {
          try {
            grafanaClient = await createDockerMCPClient(
              'mcp/grafana',
              {
                GRAFANA_URL: 'https://ralphschuler.grafana.net',
                GRAFANA_SERVICE_ACCOUNT_TOKEN: process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN
              },
              'grafana-collector'
            );
            grafanaClientConnected = true;
            collectedData.diagnostics.mcp.grafanaConnected = true;
          } catch (error) {
            log(`Failed to create Grafana MCP client: ${error.message}`, 'error');
            collectedData.diagnostics.mcp.grafanaConnected = false;
            collectedData.diagnostics.mcp.grafanaError = error.message;
          }
        }
      }

      if (grafanaClientConnected && grafanaClient) {
        // Try MCP calls with shorter timeout
        log('→ query_prometheus (CPU) - via MCP', 'info');
        const cpuResult = await callMCPTool(grafanaClient, 'query_prometheus', {
          datasourceUid: 'prometheus',
          expr: 'screeps_cpu_used',
          startTime: 'now-24h',
          endTime: 'now',
          queryType: 'instant'
        }, 20000); // 20 second timeout for Grafana
        collectedData.dataSourcesUsed.grafana_cpu_metrics = cpuResult.success;
        collectedData.rawData.grafana.cpuQuery = parseToolResult(cpuResult);

        log('→ query_prometheus (GCL) - via MCP', 'info');
        const gclResult = await callMCPTool(grafanaClient, 'query_prometheus', {
          datasourceUid: 'prometheus',
          expr: 'screeps_gcl_progress',
          startTime: 'now-24h',
          endTime: 'now',
          queryType: 'instant'
        }, 20000);
        collectedData.dataSourcesUsed.grafana_gcl_metrics = gclResult.success;
        collectedData.rawData.grafana.gclQuery = parseToolResult(gclResult);

        log('→ query_loki_logs (errors) - via MCP', 'info');
        const errorLogsResult = await callMCPTool(grafanaClient, 'query_loki_logs', {
          datasourceUid: 'loki',
          logql: '{job="screeps-bot"} |~ "ERROR|error"',
          startRfc3339: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          endRfc3339: TIMESTAMP,
          limit: 100
        }, 20000);
        collectedData.dataSourcesUsed.grafana_error_logs = errorLogsResult.success;
        collectedData.rawData.grafana.errorLogs = parseToolResult(errorLogsResult);
      } else {
        log('Grafana MCP not available, skipping Grafana metrics', 'warn');
        collectedData.dataSourcesUsed.grafana_cpu_metrics = false;
        collectedData.dataSourcesUsed.grafana_gcl_metrics = false;
        collectedData.dataSourcesUsed.grafana_error_logs = false;
        collectedData.diagnostics.fallbacks.grafanaSkipped = true;
      }
    } catch (error) {
      log(`Grafana data collection failed: ${error.message}`, 'error');
      collectedData.diagnostics.grafana = { error: error.message };
      collectedData.dataSourcesUsed.grafana_cpu_metrics = collectedData.dataSourcesUsed.grafana_cpu_metrics || false;
      collectedData.dataSourcesUsed.grafana_gcl_metrics = collectedData.dataSourcesUsed.grafana_gcl_metrics || false;
      collectedData.dataSourcesUsed.grafana_error_logs = collectedData.dataSourcesUsed.grafana_error_logs || false;
    } finally {
      if (grafanaClient) {
        try { 
          await grafanaClient.close(); 
          debug('Grafana MCP client closed');
        } catch (e) {
          debug(`Error closing Grafana client: ${e.message}`);
        }
      }
    }
  }

  // ============================================================
  // PHASE 3: Create summary
  // ============================================================
  log('Creating summary...', 'info');

  const stats = collectedData.rawData.screeps.stats || {};
  const gameTime = collectedData.rawData.screeps.gameTime || {};
  const rooms = collectedData.rawData.screeps.rooms || [];

  collectedData.summary = {
    gameTime: gameTime.time || 0,
    cpu: {
      current: stats.cpu?.used || 0,
      limit: stats.cpu?.limit || 100,
      bucket: stats.cpu?.bucket || 0
    },
    gcl: {
      level: stats.gcl?.level || 0,
      progress: stats.gcl?.progress || 0
    },
    rooms: {
      total: Array.isArray(rooms) ? rooms.length : 0
    },
    creeps: {
      total: stats.creeps?.total || 0
    }
  };
  
  // Validate we got meaningful data
  const successCount = Object.values(collectedData.dataSourcesUsed).filter(v => v === true).length;
  const totalSources = Object.keys(collectedData.dataSourcesUsed).length;
  
  collectedData.diagnostics.collectionStatus = {
    successCount,
    totalSources,
    successRate: totalSources > 0 ? (successCount / totalSources * 100).toFixed(1) + '%' : '0%',
    hasNonZeroData: collectedData.summary.gameTime > 0 || collectedData.summary.cpu.current > 0
  };

  return collectedData;
}

// Run collection and save results
try {
  const data = await collectMetrics();
  
  log('Metrics collected!', 'success');
  writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  log(`Data saved to: ${OUTPUT_FILE}`, 'success');
  
  log('', 'info');
  log('═══════════════════════════════════════════════', 'info');
  log('Collection Summary:', 'info');
  log('═══════════════════════════════════════════════', 'info');
  log(`Game Time: ${data.summary.gameTime}`, 'info');
  log(`CPU: ${data.summary.cpu.current}/${data.summary.cpu.limit} (bucket: ${data.summary.cpu.bucket})`, 'info');
  log(`GCL: ${data.summary.gcl.level} (progress: ${data.summary.gcl.progress})`, 'info');
  log(`Rooms: ${data.summary.rooms.total}`, 'info');
  log(`Creeps: ${data.summary.creeps.total}`, 'info');
  log('', 'info');
  log('Data Sources:', 'info');
  for (const [source, success] of Object.entries(data.dataSourcesUsed)) {
    const status = success ? '✅' : '❌';
    log(`  ${status} ${source}`, 'info');
  }
  log('', 'info');
  log(`Success Rate: ${data.diagnostics.collectionStatus.successRate} (${data.diagnostics.collectionStatus.successCount}/${data.diagnostics.collectionStatus.totalSources})`, 'info');
  log(`Has Non-Zero Data: ${data.diagnostics.collectionStatus.hasNonZeroData ? 'Yes ✅' : 'No ❌'}`, 'info');
  log('═══════════════════════════════════════════════', 'info');
  
  // Exit with appropriate code
  if (!data.diagnostics.collectionStatus.hasNonZeroData) {
    log('', 'warn');
    log('WARNING: All metrics are zero - data collection may have failed', 'warn');
    log('Check diagnostics in output file for details', 'warn');
    process.exit(1);
  }
  
  if (data.diagnostics.collectionStatus.successCount === 0) {
    log('', 'error');
    log('ERROR: No data sources succeeded', 'error');
    log('Check diagnostics in output file for details', 'error');
    process.exit(1);
  }
  
  process.exit(0);
} catch (error) {
  log('', 'error');
  log(`Collection failed: ${error.message}`, 'error');
  if (VERBOSE && error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}
