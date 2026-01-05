/**
 * Grafana MCP Integration Helpers
 * 
 * Note: This module provides helper functions that would normally interact with
 * the Grafana MCP server. However, since MCP servers are tools available to AI agents
 * and not directly callable from Node.js scripts, these functions serve as:
 * 
 * 1. Type-safe wrappers for documentation purposes
 * 2. Examples for how agents should query Grafana
 * 3. Placeholder implementations for testing
 * 
 * When used by AI agents during strategic planning, agents should directly use
 * the grafana-mcp tools (query_prometheus, query_loki_logs, etc.) instead of
 * calling these functions.
 */

import { CPUMetrics, MetricQuery, LogQuery } from './types.js';

/**
 * Get CPU metrics over a time range
 * 
 * AI Agent Usage:
 * Instead of calling this function, use:
 * ```
 * query_prometheus({
 *   datasourceUid: "prometheus-uid",
 *   expr: "screeps_cpu_usage",
 *   startTime: "now-24h",
 *   endTime: "now",
 *   queryType: "range",
 *   stepSeconds: 300
 * })
 * ```
 * 
 * @param hours - Number of hours to look back
 * @returns CPU metrics
 */
export async function getRecentCPUMetrics(hours: number = 24): Promise<CPUMetrics> {
  // TODO: This is a placeholder implementation
  // Issue URL: https://github.com/ralphschuler/screeps/issues/2771
  // AI agents should use grafana-mcp query_prometheus tool directly
  
  const grafanaUrl = process.env.GRAFANA_URL || 'https://ralphschuler.grafana.net';
  const apiKey = process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN;
  
  if (!apiKey) {
    throw new Error('GRAFANA_SERVICE_ACCOUNT_TOKEN environment variable not set');
  }

  // Placeholder: In a real implementation, this would query Grafana
  // For now, return mock data for testing
  console.warn('getRecentCPUMetrics: Using mock data. AI agents should use grafana-mcp tools directly.');
  
  return {
    avg: 50.5,
    max: 95.2,
    min: 10.3,
    p95: 85.7,
    p99: 92.1,
    timestamp: Date.now()
  };
}

/**
 * Get GCL progress metrics
 * 
 * AI Agent Usage:
 * ```
 * query_prometheus({
 *   datasourceUid: "prometheus-uid",
 *   expr: "screeps_gcl_progress",
 *   startTime: "now-24h",
 *   endTime: "now",
 *   queryType: "range"
 * })
 * ```
 */
export async function getGCLProgress(hours: number = 24): Promise<any> {
  console.warn('getGCLProgress: AI agents should use grafana-mcp query_prometheus tool directly.');
  
  return {
    current: 15234567,
    total: 20000000,
    progressPerTick: 0.012,
    timestamp: Date.now()
  };
}

/**
 * Get error logs from Loki
 * 
 * AI Agent Usage:
 * ```
 * query_loki_logs({
 *   datasourceUid: "loki-uid",
 *   logql: '{app="screeps-bot"} |~ "ERROR|error"',
 *   startRfc3339: "2024-01-05T00:00:00Z",
 *   endRfc3339: "2024-01-05T23:59:59Z",
 *   limit: 100
 * })
 * ```
 */
export async function getErrorLogs(hours: number = 24): Promise<any[]> {
  console.warn('getErrorLogs: AI agents should use grafana-mcp query_loki_logs tool directly.');
  
  return [];
}

/**
 * Query custom Prometheus metric
 * 
 * AI Agent Usage: Use query_prometheus from grafana-mcp
 */
export async function queryMetric(query: MetricQuery): Promise<any> {
  console.warn('queryMetric: AI agents should use grafana-mcp query_prometheus tool directly.');
  
  return null;
}

/**
 * Search logs with LogQL
 * 
 * AI Agent Usage: Use query_loki_logs from grafana-mcp
 */
export async function searchLogs(query: LogQuery): Promise<any[]> {
  console.warn('searchLogs: AI agents should use grafana-mcp query_loki_logs tool directly.');
  
  return [];
}

/**
 * Get dashboard information
 * 
 * AI Agent Usage:
 * ```
 * search_dashboards({ query: "CPU Performance" })
 * get_dashboard_by_uid({ uid: "dashboard-uid" })
 * ```
 */
export async function getDashboard(nameOrUid: string): Promise<any> {
  console.warn('getDashboard: AI agents should use grafana-mcp search_dashboards or get_dashboard_by_uid tools.');
  
  return null;
}

/**
 * Get active alerts
 * 
 * AI Agent Usage:
 * ```
 * list_alert_rules({})
 * get_alert_rule_by_uid({ uid: "alert-uid" })
 * ```
 */
export async function getActiveAlerts(): Promise<any[]> {
  console.warn('getActiveAlerts: AI agents should use grafana-mcp list_alert_rules tool.');
  
  return [];
}
