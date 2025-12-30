/**
 * Pathfinding Audit Script
 * 
 * Scans the codebase to identify pathfinding patterns and usage.
 * Generates a report with optimization opportunities.
 * 
 * Usage:
 *   npm run audit:pathfinding
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PathfindingCall {
  file: string;
  line: number;
  type: 'moveTo' | 'PathFinder.search' | 'findPath' | 'moveByPath';
  context: string;
  hasCaching: boolean;
  isCartographer: boolean;
}

interface AuditResults {
  totalCalls: number;
  callsByType: Record<string, number>;
  uncachedCalls: number;
  cachedCalls: number;
  cartographerCalls: number;
  calls: PathfindingCall[];
  recommendations: string[];
}

const SRC_DIR = path.join(__dirname, '../src');
const OUTPUT_FILE = path.join(__dirname, '../../../PATHFINDING_AUDIT.md');

/**
 * Recursively find all TypeScript files
 */
function findTsFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Analyze a single file for pathfinding calls
 */
function analyzeFile(filePath: string): PathfindingCall[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const calls: PathfindingCall[] = [];
  const relativePath = path.relative(SRC_DIR, filePath);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Skip comments and imports
    if (line.trim().startsWith('//') || 
        line.trim().startsWith('*') ||
        line.trim().startsWith('import') ||
        line.includes('import {')) {
      continue;
    }
    
    // Detect moveTo calls
    if (line.includes('.moveTo(') && !line.includes('moveToWithRemoteCache')) {
      const isCartographer = content.includes('from "screeps-cartographer"') && 
                             content.includes('import { moveTo }');
      const hasCaching = line.includes('reusePath') || 
                        content.includes('getCachedPath') ||
                        content.includes('PathCache');
      
      calls.push({
        file: relativePath,
        line: lineNum,
        type: 'moveTo',
        context: line.trim(),
        hasCaching,
        isCartographer
      });
    }
    
    // Detect PathFinder.search calls
    if (line.includes('PathFinder.search(')) {
      const hasCaching = content.includes('getCachedPath') ||
                        content.includes('cachePath') ||
                        content.includes('PathCache');
      
      calls.push({
        file: relativePath,
        line: lineNum,
        type: 'PathFinder.search',
        context: line.trim(),
        hasCaching,
        isCartographer: false
      });
    }
    
    // Detect Room.findPath calls
    if (line.includes('.findPath(')) {
      const hasCaching = content.includes('getCachedPath') ||
                        content.includes('cachePath');
      
      calls.push({
        file: relativePath,
        line: lineNum,
        type: 'findPath',
        context: line.trim(),
        hasCaching,
        isCartographer: false
      });
    }
    
    // Detect moveByPath calls (indicates cached path usage)
    if (line.includes('.moveByPath(')) {
      calls.push({
        file: relativePath,
        line: lineNum,
        type: 'moveByPath',
        context: line.trim(),
        hasCaching: true,
        isCartographer: false
      });
    }
  }
  
  return calls;
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations(results: AuditResults): string[] {
  const recommendations: string[] = [];
  
  if (results.uncachedCalls > 0) {
    recommendations.push(
      `**HIGH PRIORITY**: ${results.uncachedCalls} pathfinding calls found without caching. ` +
      `Add path caching to reduce CPU usage by ~90% per call.`
    );
  }
  
  const moveToCount = results.callsByType['moveTo'] || 0;
  const cartographerRatio = results.cartographerCalls / Math.max(moveToCount, 1);
  
  if (cartographerRatio < 0.5 && moveToCount > 10) {
    recommendations.push(
      `**MEDIUM PRIORITY**: Only ${(cartographerRatio * 100).toFixed(0)}% of moveTo calls use screeps-cartographer. ` +
      `Consider migrating direct moveTo calls to use cartographer for traffic management.`
    );
  }
  
  const pathFinderCount = results.callsByType['PathFinder.search'] || 0;
  if (pathFinderCount > 5) {
    recommendations.push(
      `**MEDIUM PRIORITY**: ${pathFinderCount} direct PathFinder.search calls found. ` +
      `Consider wrapping these with path caching for repetitive paths.`
    );
  }
  
  const cacheHitRate = results.cachedCalls / Math.max(results.totalCalls, 1);
  if (cacheHitRate < 0.8) {
    recommendations.push(
      `**OPTIMIZATION**: Current cache usage is ${(cacheHitRate * 100).toFixed(0)}%. ` +
      `Target is ≥80% for optimal CPU savings. Focus on repetitive movement patterns.`
    );
  }
  
  return recommendations;
}

/**
 * Generate markdown report
 */
function generateReport(results: AuditResults): string {
  const report: string[] = [];
  
  report.push('# Pathfinding Audit Report');
  report.push('');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push('');
  
  // Summary statistics
  report.push('## Summary Statistics');
  report.push('');
  report.push(`- **Total pathfinding calls**: ${results.totalCalls}`);
  report.push(`- **Cached calls**: ${results.cachedCalls} (${(results.cachedCalls / Math.max(results.totalCalls, 1) * 100).toFixed(1)}%)`);
  report.push(`- **Uncached calls**: ${results.uncachedCalls} (${(results.uncachedCalls / Math.max(results.totalCalls, 1) * 100).toFixed(1)}%)`);
  report.push(`- **Cartographer calls**: ${results.cartographerCalls}`);
  report.push('');
  
  // Breakdown by type
  report.push('## Calls by Type');
  report.push('');
  report.push('| Type | Count | Percentage |');
  report.push('|------|-------|------------|');
  
  for (const [type, count] of Object.entries(results.callsByType)) {
    const pct = (count / Math.max(results.totalCalls, 1) * 100).toFixed(1);
    report.push(`| ${type} | ${count} | ${pct}% |`);
  }
  report.push('');
  
  // Recommendations
  report.push('## Optimization Recommendations');
  report.push('');
  
  if (results.recommendations.length === 0) {
    report.push('✅ No critical optimizations needed. Pathfinding usage is well-optimized.');
  } else {
    for (const rec of results.recommendations) {
      report.push(`- ${rec}`);
      report.push('');
    }
  }
  
  // High-impact optimization targets
  report.push('## High-Impact Optimization Targets');
  report.push('');
  
  const uncachedCalls = results.calls.filter(c => !c.hasCaching && c.type !== 'moveByPath');
  
  if (uncachedCalls.length > 0) {
    report.push('### Uncached Pathfinding Calls');
    report.push('');
    report.push('These calls could benefit most from path caching:');
    report.push('');
    
    // Group by file
    const byFile = new Map<string, PathfindingCall[]>();
    for (const call of uncachedCalls) {
      if (!byFile.has(call.file)) {
        byFile.set(call.file, []);
      }
      byFile.get(call.file)!.push(call);
    }
    
    for (const [file, fileCalls] of Array.from(byFile.entries()).slice(0, 10)) {
      report.push(`**${file}**:`);
      for (const call of fileCalls.slice(0, 3)) {
        report.push(`- Line ${call.line}: \`${call.context.substring(0, 80)}\``);
      }
      if (fileCalls.length > 3) {
        report.push(`- ... and ${fileCalls.length - 3} more`);
      }
      report.push('');
    }
  }
  
  // Estimated CPU savings
  report.push('## Estimated CPU Savings');
  report.push('');
  report.push('**Assumptions**:');
  report.push('- Uncached PathFinder.search: ~0.5-1.0 CPU per call');
  report.push('- Cached path reuse: ~0.05 CPU per call');
  report.push('- Cache hit rate target: 80%');
  report.push('');
  
  const estimatedSavings = results.uncachedCalls * 0.7 * 0.8; // 0.7 CPU saved per call, 80% hit rate
  report.push(`**Potential savings**: ~${estimatedSavings.toFixed(1)} CPU per tick`);
  report.push('');
  report.push('This assumes all uncached calls are converted to cached patterns with 80% hit rate.');
  report.push('');
  
  // Next steps
  report.push('## Next Steps');
  report.push('');
  report.push('1. Implement path caching wrappers for high-frequency uncached calls');
  report.push('2. Add role-based path reuse for repetitive movement (harvesters, haulers, upgraders)');
  report.push('3. Monitor pathfinding metrics in unifiedStats');
  report.push('4. Validate CPU savings with before/after measurements');
  report.push('');
  
  return report.join('\n');
}

/**
 * Main audit function
 */
function runAudit(): void {
  console.log('Starting pathfinding audit...');
  
  const files = findTsFiles(SRC_DIR);
  console.log(`Found ${files.length} TypeScript files`);
  
  const allCalls: PathfindingCall[] = [];
  
  for (const file of files) {
    const calls = analyzeFile(file);
    allCalls.push(...calls);
  }
  
  // Aggregate results
  const results: AuditResults = {
    totalCalls: allCalls.length,
    callsByType: {},
    uncachedCalls: 0,
    cachedCalls: 0,
    cartographerCalls: 0,
    calls: allCalls,
    recommendations: []
  };
  
  for (const call of allCalls) {
    // Count by type
    results.callsByType[call.type] = (results.callsByType[call.type] || 0) + 1;
    
    // Count caching status
    if (call.hasCaching || call.type === 'moveByPath') {
      results.cachedCalls++;
    } else {
      results.uncachedCalls++;
    }
    
    // Count cartographer usage
    if (call.isCartographer) {
      results.cartographerCalls++;
    }
  }
  
  // Generate recommendations
  results.recommendations = generateRecommendations(results);
  
  // Generate report
  const report = generateReport(results);
  
  // Write to file
  fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');
  
  console.log(`\nAudit complete!`);
  console.log(`Total calls: ${results.totalCalls}`);
  console.log(`Cached: ${results.cachedCalls} (${(results.cachedCalls / Math.max(results.totalCalls, 1) * 100).toFixed(1)}%)`);
  console.log(`Uncached: ${results.uncachedCalls} (${(results.uncachedCalls / Math.max(results.totalCalls, 1) * 100).toFixed(1)}%)`);
  console.log(`\nReport written to: ${OUTPUT_FILE}`);
}

// Run the audit
runAudit();
