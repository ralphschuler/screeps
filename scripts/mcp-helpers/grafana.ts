/**
 * Grafana MCP Integration Documentation
 * 
 * This module provides documentation and examples for AI agents on how to use
 * the grafana-mcp tools directly. These are MCP server tools that are only
 * available to AI agents at runtime, not callable from Node.js scripts.
 * 
 * AI agents should use grafana-mcp tools directly:
 * - query_prometheus() - Query Prometheus metrics
 * - query_loki_logs() - Search Loki logs  
 * - search_dashboards() - Find dashboards
 * - get_dashboard_by_uid() - Get dashboard details
 * - list_alert_rules() - Get alert configurations
 * - get_alert_rule_by_uid() - Get specific alert details
 * 
 * The examples below show the correct usage patterns.
 */

/**
 * CPU Metrics Query Example
 * 
 * To get CPU metrics over a time range, AI agents should use:
 * 
 * ```typescript
 * const result = await query_prometheus({
 *   datasourceUid: "prometheus-uid",
 *   expr: "screeps_cpu_usage",
 *   startTime: "now-24h",
 *   endTime: "now",
 *   queryType: "range",
 *   stepSeconds: 300
 * });
 * ```
 * 
 * This returns time-series data with CPU usage values over the specified range.
 */

/**
 * GCL Progress Query Example
 * 
 * To get GCL progress metrics, AI agents should use:
 * 
 * ```typescript
 * const result = await query_prometheus({
 *   datasourceUid: "prometheus-uid",
 *   expr: "screeps_gcl_progress",
 *   startTime: "now-24h",
 *   endTime: "now",
 *   queryType: "range"
 * });
 * ```
 */

/**
 * Error Logs Query Example
 * 
 * To get error logs from Loki, AI agents should use:
 * 
 * ```typescript
 * const result = await query_loki_logs({
 *   datasourceUid: "loki-uid",
 *   logql: '{app="screeps-bot"} |~ "ERROR|error"',
 *   startRfc3339: "2024-01-05T00:00:00Z",
 *   endRfc3339: "2024-01-05T23:59:59Z",
 *   limit: 100
 * });
 * ```
 */

/**
 * Custom Prometheus Metric Query Example
 * 
 * To query any custom Prometheus metric, AI agents should use:
 * 
 * ```typescript
 * const result = await query_prometheus({
 *   datasourceUid: "prometheus-uid",
 *   expr: "your_metric_name{label=\"value\"}",
 *   startTime: "now-1h",
 *   endTime: "now",
 *   queryType: "instant" // or "range"
 * });
 * ```
 */

/**
 * Log Search Example
 * 
 * To search logs with LogQL, AI agents should use:
 * 
 * ```typescript
 * const result = await query_loki_logs({
 *   datasourceUid: "loki-uid",
 *   logql: '{service="bot"} |= "search term"',
 *   startRfc3339: "2024-01-05T00:00:00Z",
 *   endRfc3339: "2024-01-05T23:59:59Z",
 *   limit: 50
 * });
 * ```
 */

/**
 * Dashboard Query Examples
 * 
 * To find dashboards by name:
 * 
 * ```typescript
 * const dashboards = await search_dashboards({ 
 *   query: "CPU Performance" 
 * });
 * ```
 * 
 * To get a specific dashboard by UID:
 * 
 * ```typescript
 * const dashboard = await get_dashboard_by_uid({ 
 *   uid: "dashboard-uid" 
 * });
 * ```
 */

/**
 * Alert Query Examples
 * 
 * To list all alert rules:
 * 
 * ```typescript
 * const alerts = await list_alert_rules({});
 * ```
 * 
 * To get a specific alert by UID:
 * 
 * ```typescript
 * const alert = await get_alert_rule_by_uid({ 
 *   uid: "alert-uid" 
 * });
 * ```
 */
