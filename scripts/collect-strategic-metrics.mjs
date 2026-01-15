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
 *   GRAFANA_SERVICE_ACCOUNT_TOKEN - Grafana API token
 *   RUN_ID - GitHub Actions run ID (optional)
 *   RUN_URL - GitHub Actions run URL (optional)
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Configuration
const OUTPUT_FILE = process.argv[2] || 'performance-baselines/strategic/collected-metrics.json';
const TIMESTAMP = new Date().toISOString();

console.log('📊 Collecting strategic metrics...');
console.log(`   Output: ${OUTPUT_FILE}`);
console.log(`   Timestamp: ${TIMESTAMP}`);

// Ensure output directory exists
mkdirSync(dirname(OUTPUT_FILE), { recursive: true });

/**
 * Create an MCP client connected to a Docker-based server
 */
async function createDockerMCPClient(dockerImage, envVars) {
  const dockerArgs = [
    'run', '--rm', '-i',
    ...Object.entries(envVars).flatMap(([key, value]) => ['-e', `${key}=${value}`]),
    dockerImage
  ];

  const transport = new StdioClientTransport({
    command: 'docker',
    args: dockerArgs,
    env: process.env
  });

  const client = new Client(
    { name: `metrics-collector`, version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);
  return client;
}

/**
 * Call an MCP tool and return the result
 */
async function callMCPTool(client, toolName, args = {}) {
  try {
    const result = await client.request({
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    });
    return { success: true, data: result };
  } catch (error) {
    console.error(`⚠️  Failed to call ${toolName}:`, error.message);
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
    console.warn('⚠️  Failed to parse tool result:', error.message);
    return result.data;
  }
}

// Main collection logic
async function collectMetrics() {
  const collectedData = {
    timestamp: TIMESTAMP,
    runId: process.env.RUN_ID || 'unknown',
    runUrl: process.env.RUN_URL || 'unknown',
    dataSourcesUsed: {},
    rawData: {
      screeps: {},
      grafana: {}
    },
    summary: {}
  };

  // ============================================================
  // PHASE 1: Collect Screeps data
  // ============================================================
  console.log('\n🎮 Collecting Screeps game state...');
  
  let screepsClient = null;
  try {
    screepsClient = await createDockerMCPClient(
      'ghcr.io/ralphschuler/screeps-mcp:latest',
      {
        SCREEPS_TOKEN: process.env.SCREEPS_TOKEN,
        SCREEPS_HOST: process.env.SCREEPS_HOST || 'screeps.com',
        SCREEPS_SHARD: process.env.SCREEPS_SHARD || 'shard3'
      }
    );

    // Get stats
    console.log('  → screeps_stats');
    const statsResult = await callMCPTool(screepsClient, 'screeps_stats');
    collectedData.dataSourcesUsed.screeps_stats = statsResult.success;
    collectedData.rawData.screeps.stats = parseToolResult(statsResult);

    // Get game time
    console.log('  → screeps_game_time');
    const timeResult = await callMCPTool(screepsClient, 'screeps_game_time');
    collectedData.dataSourcesUsed.screeps_game_time = timeResult.success;
    collectedData.rawData.screeps.gameTime = parseToolResult(timeResult);

    // Get user info
    console.log('  → screeps_user_info');
    const userInfoResult = await callMCPTool(screepsClient, 'screeps_user_info', {
      username: 'ralphschuler'
    });
    collectedData.dataSourcesUsed.screeps_user_info = userInfoResult.success;
    const userInfo = parseToolResult(userInfoResult);
    collectedData.rawData.screeps.userInfo = userInfo;

    // Get user rooms if we have user ID
    if (userInfo?._id) {
      console.log('  → screeps_user_rooms');
      const roomsResult = await callMCPTool(screepsClient, 'screeps_user_rooms', {
        userId: userInfo._id
      });
      collectedData.dataSourcesUsed.screeps_user_rooms = roomsResult.success;
      collectedData.rawData.screeps.rooms = parseToolResult(roomsResult);
    }
  } catch (error) {
    console.error('❌ Screeps data collection failed:', error.message);
    collectedData.dataSourcesUsed.screeps_stats = false;
    collectedData.dataSourcesUsed.screeps_game_time = false;
    collectedData.dataSourcesUsed.screeps_user_info = false;
    collectedData.dataSourcesUsed.screeps_user_rooms = false;
  } finally {
    if (screepsClient) {
      try { await screepsClient.close(); } catch {}
    }
  }

  // ============================================================
  // PHASE 2: Collect Grafana metrics
  // ============================================================
  console.log('\n📈 Collecting Grafana metrics...');
  
  let grafanaClient = null;
  try {
    grafanaClient = await createDockerMCPClient(
      'mcp/grafana',
      {
        GRAFANA_URL: 'https://ralphschuler.grafana.net',
        GRAFANA_SERVICE_ACCOUNT_TOKEN: process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN
      }
    );

    // Query CPU metrics
    console.log('  → query_prometheus (CPU)');
    const cpuResult = await callMCPTool(grafanaClient, 'query_prometheus', {
      datasourceUid: 'prometheus',
      expr: 'screeps_cpu_used',
      startTime: 'now-24h',
      endTime: 'now',
      queryType: 'instant'
    });
    collectedData.dataSourcesUsed.grafana_cpu_metrics = cpuResult.success;
    collectedData.rawData.grafana.cpuQuery = parseToolResult(cpuResult);

    // Query GCL metrics
    console.log('  → query_prometheus (GCL)');
    const gclResult = await callMCPTool(grafanaClient, 'query_prometheus', {
      datasourceUid: 'prometheus',
      expr: 'screeps_gcl_progress',
      startTime: 'now-24h',
      endTime: 'now',
      queryType: 'instant'
    });
    collectedData.dataSourcesUsed.grafana_gcl_metrics = gclResult.success;
    collectedData.rawData.grafana.gclQuery = parseToolResult(gclResult);

    // Query error logs
    console.log('  → query_loki_logs (errors)');
    const errorLogsResult = await callMCPTool(grafanaClient, 'query_loki_logs', {
      datasourceUid: 'loki',
      logql: '{job="screeps-bot"} |~ "ERROR|error"',
      startRfc3339: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endRfc3339: TIMESTAMP,
      limit: 100
    });
    collectedData.dataSourcesUsed.grafana_error_logs = errorLogsResult.success;
    collectedData.rawData.grafana.errorLogs = parseToolResult(errorLogsResult);
  } catch (error) {
    console.error('❌ Grafana data collection failed:', error.message);
    collectedData.dataSourcesUsed.grafana_cpu_metrics = false;
    collectedData.dataSourcesUsed.grafana_gcl_metrics = false;
    collectedData.dataSourcesUsed.grafana_error_logs = false;
  } finally {
    if (grafanaClient) {
      try { await grafanaClient.close(); } catch {}
    }
  }

  // ============================================================
  // PHASE 3: Create summary
  // ============================================================
  console.log('\n💾 Creating summary...');

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

  return collectedData;
}

// Run collection and save results
try {
  const data = await collectMetrics();
  
  console.log('\n✅ Metrics collected successfully!');
  writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`   Data saved to: ${OUTPUT_FILE}`);
  
  console.log('\n📋 Summary:');
  console.log(`   Game Time: ${data.summary.gameTime}`);
  console.log(`   CPU: ${data.summary.cpu.current}/${data.summary.cpu.limit} (bucket: ${data.summary.cpu.bucket})`);
  console.log(`   GCL: ${data.summary.gcl.level} (progress: ${data.summary.gcl.progress})`);
  console.log(`   Rooms: ${data.summary.rooms.total}`);
  console.log(`   Creeps: ${data.summary.creeps.total}`);
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Collection failed:', error);
  process.exit(1);
}
