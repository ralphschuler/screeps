/**
 * Performance Trend Report Generator
 * 
 * Generates human-readable trend reports from rolling baseline comparisons,
 * regressions, and improvements.
 */

import {
  PerformanceBaseline,
  RollingBaseline,
  Regression,
  Improvement
} from '../../packages/screeps-bot/test/performance/strategic-types.js';

/**
 * Generate a comprehensive trend report
 * @param currentBaseline - Current performance baseline
 * @param rollingBaseline - 7-day rolling baseline for comparison
 * @param regressions - Detected regressions
 * @param improvements - Detected improvements
 * @param healthScore - Overall health score (0-100)
 * @returns Markdown-formatted trend report
 */
export function generateTrendReport(
  currentBaseline: PerformanceBaseline,
  rollingBaseline: RollingBaseline,
  regressions: Regression[],
  improvements: Improvement[],
  healthScore: number
): string {
  const sections: string[] = [];

  // Header
  sections.push('# Performance Trend Report');
  sections.push('');
  sections.push(`**Generated:** ${new Date(currentBaseline.timestamp).toLocaleString()}`);
  sections.push(`**Game Time:** ${currentBaseline.gameTime}`);
  sections.push(`**Health Score:** ${healthScore}/100 ${getHealthEmoji(healthScore)}`);
  sections.push('');

  // 7-Day Rolling Average Summary
  sections.push('## 7-Day Rolling Average');
  sections.push('');
  sections.push(`**Baseline Period:** ${rollingBaseline.startDate} to ${rollingBaseline.endDate}`);
  sections.push(`**Sample Count:** ${rollingBaseline.sampleCount} baselines`);
  sections.push('');

  sections.push('### CPU Metrics');
  const cpu = rollingBaseline.metrics.cpu;
  sections.push(`- **Average:** ${cpu.avg.toFixed(2)} (σ=${cpu.stdDev.toFixed(2)})`);
  sections.push(`- **Range:** ${cpu.min.toFixed(2)} - ${cpu.max.toFixed(2)}`);
  sections.push(`- **P50:** ${cpu.p50.toFixed(2)} | **P95:** ${cpu.p95.toFixed(2)} | **P99:** ${cpu.p99.toFixed(2)}`);
  sections.push('');

  sections.push('### GCL Metrics');
  const gcl = rollingBaseline.metrics.gcl;
  sections.push(`- **Average Rate:** ${gcl.avgRate.toFixed(4)}/tick`);
  sections.push(`- **Range:** ${gcl.minRate.toFixed(4)} - ${gcl.maxRate.toFixed(4)}/tick`);
  sections.push('');

  sections.push('### Error Metrics');
  const errors = rollingBaseline.metrics.errors;
  sections.push(`- **Average Rate:** ${errors.avgRate.toFixed(4)}/tick`);
  sections.push(`- **Range:** ${errors.minRate.toFixed(4)} - ${errors.maxRate.toFixed(4)}/tick`);
  sections.push('');

  if (rollingBaseline.metrics.rooms) {
    sections.push('### Room Metrics');
    const rooms = rollingBaseline.metrics.rooms;
    sections.push(`- **Average Room Count:** ${rooms.avgTotal.toFixed(1)}`);
    sections.push(`- **Average CPU per Room:** ${rooms.avgCPU.toFixed(2)}`);
    sections.push('');
  }

  if (rollingBaseline.metrics.creeps) {
    sections.push('### Creep Metrics');
    const creeps = rollingBaseline.metrics.creeps;
    sections.push(`- **Average Creep Count:** ${creeps.avgTotal.toFixed(1)}`);
    sections.push(`- **Average Creeps per Room:** ${creeps.avgPerRoom.toFixed(1)}`);
    sections.push('');
  }

  // Current vs Baseline Comparison
  sections.push('## Current vs Baseline Comparison');
  sections.push('');

  const current = currentBaseline.metrics;
  const cpuCurrent = current.cpu.avg24h || current.cpu.current;
  const cpuDelta = cpuCurrent - cpu.avg;
  const cpuPercent = ((cpuDelta / cpu.avg) * 100).toFixed(1);
  sections.push(`- **CPU:** ${cpuCurrent.toFixed(2)} (${cpuDelta >= 0 ? '+' : ''}${cpuDelta.toFixed(2)}, ${cpuDelta >= 0 ? '+' : ''}${cpuPercent}%)`);

  const gclDelta = current.gcl.progressRate - gcl.avgRate;
  const gclPercent = ((gclDelta / gcl.avgRate) * 100).toFixed(1);
  sections.push(`- **GCL Rate:** ${current.gcl.progressRate.toFixed(4)}/tick (${gclDelta >= 0 ? '+' : ''}${gclDelta.toFixed(4)}, ${gclDelta >= 0 ? '+' : ''}${gclPercent}%)`);

  const errorDelta = current.errors.currentRate - errors.avgRate;
  const errorPercent = errors.avgRate > 0 ? ((errorDelta / errors.avgRate) * 100).toFixed(1) : '0.0';
  sections.push(`- **Error Rate:** ${current.errors.currentRate.toFixed(4)}/tick (${errorDelta >= 0 ? '+' : ''}${errorDelta.toFixed(4)}, ${errorDelta >= 0 ? '+' : ''}${errorPercent}%)`);

  sections.push(`- **Bucket:** ${current.cpu.bucket}`);
  sections.push('');

  // Detected Regressions
  if (regressions.length > 0) {
    sections.push('## ⚠️ Detected Regressions');
    sections.push('');
    
    const criticalRegressions = regressions.filter(r => r.severity === 'critical');
    const highRegressions = regressions.filter(r => r.severity === 'high');
    const mediumRegressions = regressions.filter(r => r.severity === 'medium');
    const lowRegressions = regressions.filter(r => r.severity === 'low');

    if (criticalRegressions.length > 0) {
      sections.push('### 🔴 Critical');
      for (const r of criticalRegressions) {
        sections.push(`- **${r.type.toUpperCase()}:** ${r.description}`);
      }
      sections.push('');
    }

    if (highRegressions.length > 0) {
      sections.push('### 🟠 High');
      for (const r of highRegressions) {
        sections.push(`- **${r.type.toUpperCase()}:** ${r.description}`);
      }
      sections.push('');
    }

    if (mediumRegressions.length > 0) {
      sections.push('### 🟡 Medium');
      for (const r of mediumRegressions) {
        sections.push(`- **${r.type.toUpperCase()}:** ${r.description}`);
      }
      sections.push('');
    }

    if (lowRegressions.length > 0) {
      sections.push('### 🟢 Low');
      for (const r of lowRegressions) {
        sections.push(`- **${r.type.toUpperCase()}:** ${r.description}`);
      }
      sections.push('');
    }
  } else {
    sections.push('## ✅ Detected Regressions');
    sections.push('');
    sections.push('No regressions detected. All metrics within normal range.');
    sections.push('');
  }

  // Detected Improvements
  if (improvements.length > 0) {
    sections.push('## 🎉 Detected Improvements');
    sections.push('');
    for (const improvement of improvements) {
      sections.push(`- **${improvement.type.toUpperCase()}:** ${improvement.description}`);
    }
    sections.push('');
  } else {
    sections.push('## Detected Improvements');
    sections.push('');
    sections.push('No significant improvements detected.');
    sections.push('');
  }

  // Trend Analysis
  if (currentBaseline.comparisonBaseline) {
    sections.push('## Overall Trend');
    sections.push('');
    sections.push(`**Direction:** ${getTrendEmoji(currentBaseline.comparisonBaseline.trend)} ${currentBaseline.comparisonBaseline.trend.charAt(0).toUpperCase() + currentBaseline.comparisonBaseline.trend.slice(1)}`);
    sections.push('');
  }

  // Footer
  sections.push('---');
  sections.push('');
  sections.push('*This report was automatically generated from 7-day rolling baseline comparison.*');
  sections.push('*Statistical thresholds: mean ± 1σ (warning), mean ± 2σ (critical)*');

  return sections.join('\n');
}

/**
 * Get emoji for health score
 */
function getHealthEmoji(score: number): string {
  if (score >= 90) return '🟢';
  if (score >= 75) return '🟡';
  if (score >= 50) return '🟠';
  return '🔴';
}

/**
 * Get emoji for trend
 */
function getTrendEmoji(trend: 'improving' | 'degrading' | 'stable'): string {
  switch (trend) {
    case 'improving': return '📈';
    case 'degrading': return '📉';
    case 'stable': return '➡️';
  }
}

/**
 * Generate a compact summary for GitHub issue or PR comment
 */
export function generateCompactSummary(
  healthScore: number,
  regressions: Regression[],
  improvements: Improvement[],
  trend: 'improving' | 'degrading' | 'stable'
): string {
  const lines: string[] = [];

  lines.push(`**Health Score:** ${healthScore}/100 ${getHealthEmoji(healthScore)}`);
  lines.push(`**Trend:** ${getTrendEmoji(trend)} ${trend.charAt(0).toUpperCase() + trend.slice(1)}`);
  
  if (regressions.length > 0) {
    const critical = regressions.filter(r => r.severity === 'critical').length;
    const high = regressions.filter(r => r.severity === 'high').length;
    const medium = regressions.filter(r => r.severity === 'medium').length;
    const low = regressions.filter(r => r.severity === 'low').length;
    
    lines.push(`**Regressions:** ${critical} critical, ${high} high, ${medium} medium, ${low} low`);
  }
  
  if (improvements.length > 0) {
    lines.push(`**Improvements:** ${improvements.length} detected`);
  }

  return lines.join(' | ');
}
