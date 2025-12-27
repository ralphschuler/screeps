#!/usr/bin/env node

/**
 * Grafana Metrics Export Script (Example)
 * 
 * This is an example script showing how to export performance metrics
 * to Grafana. Requires configuration of Grafana data source.
 * 
 * NOTE: This is a template. Actual implementation depends on your
 * Grafana setup (Prometheus, Graphite, InfluxDB, etc.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_FILE = path.join(__dirname, '..', 'performance-report.json');

/**
 * Load performance report
 */
function loadReport() {
  if (!fs.existsSync(REPORT_FILE)) {
    throw new Error(`Performance report not found: ${REPORT_FILE}`);
  }
  
  const data = fs.readFileSync(REPORT_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Convert performance report to Prometheus metrics format
 */
function toPrometheusFormat(report) {
  const timestamp = Date.now();
  const labels = {
    branch: report.branch,
    commit: report.commit.substring(0, 7)
  };
  
  const labelString = Object.entries(labels)
    .map(([k, v]) => `${k}="${v}"`)
    .join(',');
  
  const metrics = [];
  
  if (report.analysis && report.analysis.cpu) {
    metrics.push(`screeps_performance_avg_cpu{${labelString}} ${report.analysis.cpu.avg} ${timestamp}`);
    metrics.push(`screeps_performance_max_cpu{${labelString}} ${report.analysis.cpu.max} ${timestamp}`);
    metrics.push(`screeps_performance_p95_cpu{${labelString}} ${report.analysis.cpu.p95} ${timestamp}`);
    metrics.push(`screeps_performance_p99_cpu{${labelString}} ${report.analysis.cpu.p99} ${timestamp}`);
  }
  
  if (report.analysis && report.analysis.bucket) {
    metrics.push(`screeps_performance_avg_bucket{${labelString}} ${report.analysis.bucket.avg} ${timestamp}`);
    metrics.push(`screeps_performance_min_bucket{${labelString}} ${report.analysis.bucket.min} ${timestamp}`);
  }
  
  if (report.regression) {
    const regressionValue = report.regression.detected ? 1 : 0;
    metrics.push(`screeps_performance_regression{${labelString}} ${regressionValue} ${timestamp}`);
  }
  
  return metrics.join('\n');
}

/**
 * Convert performance report to Graphite metrics format
 */
function toGraphiteFormat(report) {
  const timestamp = Math.floor(Date.now() / 1000);
  const prefix = 'screeps.performance';
  const branch = report.branch.replace(/[^a-zA-Z0-9]/g, '_');
  
  const metrics = [];
  
  if (report.analysis && report.analysis.cpu) {
    metrics.push(`${prefix}.${branch}.cpu.avg ${report.analysis.cpu.avg} ${timestamp}`);
    metrics.push(`${prefix}.${branch}.cpu.max ${report.analysis.cpu.max} ${timestamp}`);
    metrics.push(`${prefix}.${branch}.cpu.p95 ${report.analysis.cpu.p95} ${timestamp}`);
    metrics.push(`${prefix}.${branch}.cpu.p99 ${report.analysis.cpu.p99} ${timestamp}`);
  }
  
  if (report.analysis && report.analysis.bucket) {
    metrics.push(`${prefix}.${branch}.bucket.avg ${report.analysis.bucket.avg} ${timestamp}`);
    metrics.push(`${prefix}.${branch}.bucket.min ${report.analysis.bucket.min} ${timestamp}`);
  }
  
  if (report.regression) {
    const regressionValue = report.regression.detected ? 1 : 0;
    metrics.push(`${prefix}.${branch}.regression ${regressionValue} ${timestamp}`);
  }
  
  return metrics.join('\n');
}

/**
 * Export to Prometheus Pushgateway
 */
async function exportToPrometheus(metrics) {
  const pushgatewayUrl = process.env.PROMETHEUS_PUSHGATEWAY_URL;
  
  if (!pushgatewayUrl) {
    console.log('PROMETHEUS_PUSHGATEWAY_URL not set, skipping export');
    return;
  }
  
  console.log('Exporting to Prometheus Pushgateway...');
  console.log('URL:', pushgatewayUrl);
  
  // Example using fetch (Node 18+)
  try {
    const response = await fetch(
      `${pushgatewayUrl}/metrics/job/screeps-performance`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: metrics
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Metrics exported to Prometheus');
  } catch (error) {
    console.error('❌ Failed to export to Prometheus:', error.message);
    throw error;
  }
}

/**
 * Export to Graphite
 */
async function exportToGraphite(metrics) {
  const graphiteHost = process.env.GRAPHITE_HOST;
  const graphitePort = process.env.GRAPHITE_PORT || 2003;
  
  if (!graphiteHost) {
    console.log('GRAPHITE_HOST not set, skipping export');
    return;
  }
  
  console.log('Exporting to Graphite...');
  console.log('Host:', graphiteHost);
  console.log('Port:', graphitePort);
  
  // Example using TCP socket
  const net = await import('net');
  
  return new Promise((resolve, reject) => {
    const client = net.connect(graphitePort, graphiteHost, () => {
      client.write(metrics + '\n');
      client.end();
    });
    
    client.on('error', (error) => {
      console.error('❌ Failed to export to Graphite:', error.message);
      reject(error);
    });
    
    client.on('close', () => {
      console.log('✅ Metrics exported to Graphite');
      resolve();
    });
  });
}

/**
 * Main function
 */
async function main() {
  console.log('=== Grafana Metrics Export ===\n');
  
  // Load performance report
  console.log('Loading performance report...');
  const report = loadReport();
  
  console.log(`Branch: ${report.branch}`);
  console.log(`Commit: ${report.commit.substring(0, 7)}`);
  console.log(`Timestamp: ${report.timestamp}`);
  
  // Determine export format
  const exportFormat = process.env.METRICS_FORMAT || 'prometheus';
  console.log(`\nExport format: ${exportFormat}`);
  
  let metrics;
  
  switch (exportFormat) {
    case 'prometheus':
      metrics = toPrometheusFormat(report);
      console.log('\nPrometheus metrics:');
      console.log(metrics);
      await exportToPrometheus(metrics);
      break;
      
    case 'graphite':
      metrics = toGraphiteFormat(report);
      console.log('\nGraphite metrics:');
      console.log(metrics);
      await exportToGraphite(metrics);
      break;
      
    default:
      throw new Error(`Unknown metrics format: ${exportFormat}`);
  }
  
  console.log('\n✅ Metrics export complete');
}

// Run the script
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
