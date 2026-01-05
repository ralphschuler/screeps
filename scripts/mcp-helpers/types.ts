/**
 * Type definitions for MCP helper functions
 */

export interface CPUMetrics {
  avg: number;
  max: number;
  min: number;
  p95: number;
  p99: number;
  timestamp: number;
}

export interface BotHealth {
  cpu: {
    used: number;
    limit: number;
    bucket: number;
    usage: number; // percentage
  };
  gcl: {
    level: number;
    progress: number;
    progressTotal: number;
  };
  rooms: {
    total: number;
    owned: number;
    reserved: number;
  };
  creeps: {
    total: number;
    byRole: Record<string, number>;
  };
  energy: {
    total: number;
    available: number;
  };
}

export interface PerformanceBaseline {
  cpu: {
    avg: number;
    p95: number;
  };
  gcl: {
    progressPerTick: number;
  };
  energy: {
    incomePerTick: number;
  };
  timestamp: number;
  branch: string;
}

export interface RegressionReport {
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  message: string;
  baseline?: {
    avg: number;
    p95: number;
  };
  current?: {
    avg: number;
    p95: number;
    max: number;
  };
  recommendation?: string;
  details?: {
    cpuIncrease: string;
    p95Increase: string;
    baselineBranch: string;
    baselineTimestamp: number;
  };
}

export interface WikiArticle {
  title: string;
  content: string;
  categories: string[];
  url: string;
}

export interface MetricQuery {
  metric: string;
  start?: number | string;
  end?: number | string;
  step?: string;
}

export interface LogQuery {
  query: string;
  start?: number | string;
  end?: number | string;
  limit?: number;
}
