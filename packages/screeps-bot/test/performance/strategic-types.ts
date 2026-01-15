/**
 * Strategic Planning Performance Snapshot Types
 * 
 * These types define the data structures for capturing live game performance
 * metrics during strategic planning analysis runs. They are used by the
 * strategic-planner agent to collect evidence-based performance data from
 * screeps-mcp and grafana-mcp servers.
 */

/**
 * Complete performance snapshot captured during strategic planning analysis
 */
export interface PerformanceSnapshot {
  /** ISO 8601 timestamp of when snapshot was captured */
  timestamp: string;
  /** Current game time (tick number) */
  gameTime: number;
  /** CPU performance metrics */
  cpu: CPUMetrics;
  /** GCL (Global Control Level) metrics */
  gcl: GCLMetrics;
  /** Room-level metrics */
  rooms: RoomMetrics;
  /** Creep population metrics */
  creeps: CreepMetrics;
  /** Error tracking metrics */
  errors: ErrorMetrics;
  /** Optional energy metrics */
  energy?: EnergyMetrics;
  /** Optional memory usage metrics */
  memory?: MemoryMetrics;
}

/**
 * CPU performance metrics
 */
export interface CPUMetrics {
  /** Current CPU usage */
  current: number;
  /** CPU limit for the account */
  limit: number;
  /** Current bucket level (0-10000) */
  bucket: number;
  /** Average CPU over last 24 hours */
  avg24h: number;
  /** 95th percentile CPU over last 24 hours */
  p95_24h?: number;
  /** Peak CPU usage in last 24 hours */
  peak24h?: number;
}

/**
 * GCL (Global Control Level) metrics
 */
export interface GCLMetrics {
  /** Current GCL level */
  level: number;
  /** Progress to next level (0-1) */
  progress: number;
  /** Progress rate per tick */
  progressRate: number;
  /** Estimated ticks until next level */
  estimatedTicksToNext?: number;
}

/**
 * Room-level aggregated metrics
 */
export interface RoomMetrics {
  /** Total number of owned rooms */
  total: number;
  /** Room count by RCL level */
  byRCL: Record<number, number>;
  /** Average CPU per room */
  avgCPU: number;
  /** Average RCL across all rooms */
  avgRCL?: number;
  /** Number of rooms under threat */
  underThreat?: number;
}

/**
 * Creep population metrics
 */
export interface CreepMetrics {
  /** Total creep count across all rooms */
  total: number;
  /** Creep count by role */
  byRole: Record<string, number>;
  /** Average creeps per room */
  avgPerRoom?: number;
  /** Idle creeps (no active task) */
  idle?: number;
}

/**
 * Error tracking metrics
 */
export interface ErrorMetrics {
  /** Total errors in last 24 hours */
  last24h: number;
  /** Current error rate (errors per tick) */
  currentRate: number;
  /** Top error messages with counts */
  topErrors: Array<{
    message: string;
    count: number;
    lastSeen?: string;
  }>;
}

/**
 * Energy economy metrics
 */
export interface EnergyMetrics {
  /** Total energy income per tick */
  incomePerTick: number;
  /** Total energy spending per tick */
  spendingPerTick: number;
  /** Net energy delta per tick */
  netPerTick: number;
  /** Total energy stored across all rooms */
  totalStored?: number;
  /** Average energy per room */
  avgPerRoom?: number;
}

/**
 * Memory usage metrics
 */
export interface MemoryMetrics {
  /** Memory usage in bytes */
  used: number;
  /** Memory limit in bytes */
  limit: number;
  /** Memory usage percentage */
  usagePercent: number;
  /** Memory parse time in CPU */
  parseTime?: number;
}

/**
 * Performance baseline for comparison
 */
export interface PerformanceBaseline {
  /** ISO 8601 timestamp of baseline creation */
  timestamp: string;
  /** Game time when baseline was created */
  gameTime: number;
  /** Git commit hash at baseline creation */
  commit: string;
  /** Git branch name */
  branch: string;
  /** Performance snapshot at baseline */
  metrics: PerformanceSnapshot;
  /** Issues created during this analysis run */
  issuesCreated: string[];
  /** Issues updated during this analysis run */
  issuesUpdated: string[];
  /** Top recommendations from this analysis */
  recommendations: string[];
  /** GitHub Actions run ID */
  runId?: string;
  /** GitHub Actions run URL */
  runUrl?: string;
}

/**
 * Performance trend analysis (comparing current vs baseline)
 */
export interface PerformanceTrend {
  /** Baseline snapshot for comparison */
  baseline: PerformanceSnapshot;
  /** Current snapshot */
  current: PerformanceSnapshot;
  /** CPU trend analysis */
  cpuTrend: TrendAnalysis;
  /** GCL trend analysis */
  gclTrend: TrendAnalysis;
  /** Error rate trend analysis */
  errorTrend: TrendAnalysis;
  /** Overall health score (0-100) */
  healthScore: number;
  /** Detected regressions */
  regressions: RegressionAlert[];
  /** Detected improvements */
  improvements: string[];
}

/**
 * Trend analysis for a specific metric
 */
export interface TrendAnalysis {
  /** Baseline value */
  baseline: number;
  /** Current value */
  current: number;
  /** Absolute change */
  change: number;
  /** Percentage change */
  percentChange: number;
  /** Trend direction */
  direction: 'improving' | 'degrading' | 'stable';
  /** Whether trend is concerning */
  isConcerning: boolean;
}

/**
 * Regression alert for automated issue creation
 */
export interface RegressionAlert {
  /** Type of regression */
  type: 'cpu' | 'gcl' | 'error' | 'energy' | 'room';
  /** Severity level */
  severity: 'critical' | 'high' | 'medium' | 'low';
  /** Human-readable description */
  description: string;
  /** Baseline value */
  baseline: number;
  /** Current value */
  current: number;
  /** Percentage change */
  percentChange: number;
  /** Threshold that was exceeded */
  threshold: number;
  /** Recommended action */
  recommendation: string;
  /** Grafana dashboard URL for investigation */
  dashboardUrl?: string;
}

/**
 * Strategic analysis output (JSON summary at end of agent run)
 */
export interface StrategicAnalysisOutput {
  /** GitHub Actions run ID */
  run_id: string;
  /** GitHub Actions run URL */
  run_url: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Overall bot health score (0-100) */
  bot_health_score: number;
  /** Data sources that were successfully queried */
  data_sources_used: {
    screeps_stats: boolean;
    screeps_user_rooms: boolean;
    screeps_game_time: boolean;
    grafana_dashboards: boolean;
    screeps_memory: boolean;
    screeps_wiki: boolean;
  };
  /** Key metrics that were analyzed */
  metrics_analyzed: {
    cpu_usage: number;
    gcl_level: number;
    gcl_progress: number;
    room_count: number;
    creep_count: number;
    error_rate: number;
  };
  /** Number of opportunities identified */
  opportunities_identified: number;
  /** GitHub issue numbers created */
  issues_created: string[];
  /** GitHub issue numbers updated */
  issues_updated: string[];
  /** Issue priority breakdown */
  priority_breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  /** Issue category breakdown */
  category_breakdown: {
    performance: number;
    economy: number;
    expansion: number;
    defense: number;
    infrastructure: number;
  };
  /** Top 3 recommendations */
  top_recommendations: string[];
  /** Key insights from Grafana monitoring */
  grafana_insights: string[];
  /** Areas to investigate in next run */
  next_focus_areas: string[];
  /** Performance snapshot captured during this run */
  performance_snapshot?: PerformanceSnapshot;
  /** Performance trend analysis (if baseline exists) */
  performance_trend?: PerformanceTrend;
}

/**
 * Issue template data for creating performance-based issues
 */
export interface PerformanceIssueTemplate {
  /** Issue title */
  title: string;
  /** Issue body markdown */
  body: string;
  /** Issue labels */
  labels: string[];
  /** Live metrics to include in evidence section */
  liveMetrics: {
    gameTime: number;
    cpu: string;
    cpuPercent: number;
    bucket: number;
    gclLevel: number;
    gclProgress: number;
    roomCount: number;
    avgRCL: number;
  };
  /** 24-hour trend data */
  trends24h: {
    cpuTrend: string;
    gclRate: number;
    errorRate: number;
  };
  /** Grafana dashboard URLs */
  grafanaLinks: {
    cpuDashboard?: string;
    errorLogs?: string;
    roomOverview?: string;
  };
}
