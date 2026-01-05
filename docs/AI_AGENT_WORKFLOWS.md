# AI Agent Guide: Autonomous Development Workflows

This guide explains how AI agents should use the autonomous development system to continuously improve the Screeps bot.

## Quick Reference

### For Strategic Planning Agent

**When to run**: Daily at midnight UTC (automatic)

**Your tasks**:
1. ✅ Query live bot performance using screeps-mcp
2. ✅ Analyze metrics using grafana-mcp  
3. ✅ Search for optimization strategies using screeps-wiki-mcp
4. ✅ Review existing issues to avoid duplicates
5. ✅ Create evidence-based improvement issues
6. ✅ Detect performance regressions

**Key MCP Tools**:
```typescript
// Get bot stats
const stats = await screeps_stats();

// Query CPU metrics
const cpuMetrics = await query_prometheus({
  datasourceUid: "prometheus-uid",
  expr: "screeps_cpu_usage",
  startTime: "now-24h",
  endTime: "now",
  queryType: "range"
});

// Search for strategies
const strategies = await screeps_wiki_search({
  query: "CPU optimization techniques",
  limit: 10
});

// Check existing issues
const existing = await github-mcp-server-search_issues({
  query: "label:performance optimization"
});
```

### For Autonomous Improvement Agent

**When to run**: Weekly on Monday at 6am UTC (automatic) or manual trigger

**Your tasks**:
1. ✅ Load learning database (`.github/autonomous-learning/outcomes.json`)
2. ✅ Identify ONE specific improvement opportunity
3. ✅ Assess risk level (low/medium/high)
4. ✅ Assess confidence level (low/medium/high)
5. ✅ Implement ONLY if: Low Risk + High Confidence
6. ✅ Otherwise: Create GitHub issue
7. ✅ Run all tests before committing

**Decision Matrix**:
```
High Confidence + Low Risk = IMPLEMENT
High Confidence + Medium Risk = CREATE ISSUE
Medium Confidence = CREATE ISSUE
Low Confidence = SKIP
```

**Risk Indicators**:

Low Risk:
- Documentation changes only
- Test changes only
- < 50 lines changed
- < 3 files modified
- Helper functions (not core systems)

High Risk:
- Kernel, memory, or main.ts changes
- Data structure changes
- > 200 lines changed
- > 10 files modified
- No community validation

**Example Workflow**:
```typescript
// 1. Load learning database
const db = JSON.parse(
  fs.readFileSync('.github/autonomous-learning/outcomes.json', 'utf-8')
);

// 2. Check for similar past attempts
const similar = Object.values(db.outcomes).filter(o => 
  o.type === 'performance' && 
  o.filesChanged.some(f => f.includes('pathfinding'))
);

const successRate = similar.filter(o => o.success).length / similar.length;

// 3. Adjust confidence based on history
let confidence = 'medium';
if (successRate > 0.8) confidence = 'high';
else if (successRate < 0.5) confidence = 'low';

// 4. Make decision
if (confidence === 'high' && risk === 'low') {
  // Implement the change
  // ... make code changes ...
  
  // Run tests
  execSync('npm run build && npm test');
  
  // Changes will be committed by workflow
} else {
  // Create issue instead
  await github.rest.issues.create({
    title: 'feat: Optimize pathfinding with caching',
    body: '...',
    labels: ['performance', 'needs-review']
  });
}
```

### For Maintainer Agent (PR Review)

**When to run**: When PRs are created or updated

**Your tasks**:
1. ✅ Review code quality and alignment with ROADMAP.md
2. ✅ Check test coverage
3. ✅ Verify no breaking changes
4. ✅ Add `auto-merge-candidate` label if appropriate
5. ✅ Request changes if issues found

**Auto-Merge Criteria**:
- Risk assessed as LOW
- All tests passing
- Code follows patterns
- < 50 lines changed
- < 3 files modified

## Detailed Workflows

### Workflow 1: Daily Strategic Analysis

**Objective**: Identify improvement opportunities based on real performance data

**Steps**:

1. **Query Live Bot Performance**
   ```typescript
   // Get current stats
   const stats = await screeps_stats();
   console.log('CPU Usage:', stats.cpu);
   console.log('GCL:', stats.gcl);
   console.log('Rooms:', stats.rooms);
   
   // Get room details
   const rooms = await screeps_user_rooms({ userId: "your-user-id" });
   ```

2. **Analyze Grafana Metrics**
   ```typescript
   // Query CPU trends
   const cpuTrend = await query_prometheus({
     datasourceUid: "prometheus-uid",
     expr: "avg_over_time(screeps_cpu_usage[24h])",
     startTime: "now-7d",
     endTime: "now",
     queryType: "range",
     stepSeconds: 3600
   });
   
   // Search for errors
   const errors = await query_loki_logs({
     datasourceUid: "loki-uid",
     logql: '{app="screeps-bot"} |~ "ERROR|error"',
     startRfc3339: "2025-01-04T00:00:00Z",
     endRfc3339: "2025-01-05T00:00:00Z",
     limit: 100
   });
   ```

3. **Search Wiki for Solutions**
   ```typescript
   // If CPU is high, search for optimization techniques
   if (stats.cpu.usage > 80) {
     const strategies = await screeps_wiki_search({
       query: "CPU optimization pathfinding caching",
       limit: 5
     });
     
     // Get detailed article
     const article = await screeps_wiki_get_article({
       title: strategies[0].title
     });
   }
   ```

4. **Check for Duplicates**
   ```typescript
   const existing = await github-mcp-server-search_issues({
     query: "repo:ralphschuler/screeps label:performance is:open pathfinding"
   });
   
   if (existing.items.length === 0) {
     // Create new issue
   } else {
     // Update existing issue with new data
   }
   ```

5. **Create Evidence-Based Issue**
   ```typescript
   await github.rest.issues.create({
     owner: 'ralphschuler',
     repo: 'screeps',
     title: 'perf: Optimize pathfinding with caching (15% CPU reduction)',
     body: `## Performance Evidence
     
   **Current State:**
   - CPU Usage: ${stats.cpu.usage.toFixed(1)}%
   - Pathfinding: ~40% of CPU time (from Grafana)
   - No path caching implemented
   
   **Proposed Solution:**
   - Implement path caching (proven technique from wiki)
   - Reuse paths for 5 ticks
   - Expected CPU reduction: 15%
   
   **References:**
   - Wiki: [CPU Management Best Practices](...)
   - Grafana: [CPU Dashboard](...)
   
   **Implementation Plan:**
   1. Add PathCache class in src/cache/
   2. Update creep movement logic
   3. Add tests for cache behavior
   4. Monitor CPU impact
   
   ---
   *Generated by Strategic Planning Agent - Run: ...*`,
     labels: ['performance', 'good-first-issue', 'strategic-analysis']
   });
   ```

### Workflow 2: Autonomous Improvement Implementation

**Objective**: Implement a single low-risk improvement

**Steps**:

1. **Select Opportunity**
   ```typescript
   // Option A: From strategic planning issues
   const issues = await github-mcp-server-list_issues({
     owner: 'ralphschuler',
     repo: 'screeps',
     labels: ['good-first-issue', 'performance'],
     state: 'open'
   });
   
   const opportunity = issues[0]; // Select highest priority
   
   // Option B: From performance metrics
   const cpuMetrics = await query_prometheus({...});
   // Identify bottleneck and propose solution
   ```

2. **Assess Risk**
   ```typescript
   const filesAffected = ['src/cache/path.ts']; // New file
   const linesChanged = 45; // Small change
   
   // Check if files are critical
   const criticalFiles = [
     'src/main.ts',
     'src/kernel/',
     'src/memory/'
   ];
   
   const isCritical = filesAffected.some(f => 
     criticalFiles.some(c => f.includes(c))
   );
   
   const risk = isCritical ? 'high' :
                linesChanged > 200 ? 'high' :
                linesChanged > 100 ? 'medium' : 'low';
   ```

3. **Check Learning Database**
   ```typescript
   const db = JSON.parse(
     fs.readFileSync('.github/autonomous-learning/outcomes.json')
   );
   
   // Find similar changes
   const similar = Object.values(db.outcomes).filter(o =>
     o.type === 'performance' &&
     o.tags?.includes('caching')
   );
   
   // Calculate success rate
   const successRate = similar.length > 0 ?
     similar.filter(o => o.success).length / similar.length :
     0.5; // Default to medium confidence
   
   const confidence = successRate > 0.8 ? 'high' :
                      successRate > 0.5 ? 'medium' : 'low';
   ```

4. **Make Decision**
   ```typescript
   if (risk === 'low' && confidence === 'high') {
     console.log('✅ PROCEEDING with implementation');
     
     // Implement the change
     // ... create/modify files ...
     
   } else {
     console.log('❌ SKIPPING implementation - creating issue instead');
     console.log(`Reason: Risk=${risk}, Confidence=${confidence}`);
     
     await github.rest.issues.create({...});
     process.exit(0);
   }
   ```

5. **Implement Changes**
   ```typescript
   // Example: Add path caching
   
   // Create new file: src/cache/path.ts
   const pathCacheCode = `
   export class PathCache {
     private static cache = new Map<string, CachedPath>();
     
     static get(creepName: string, target: RoomPosition): string | null {
       const key = \`\${creepName}-\${target.x},\${target.y},\${target.roomName}\`;
       const cached = this.cache.get(key);
       
       if (!cached || Game.time > cached.expiresAt) {
         return null;
       }
       
       return cached.path;
     }
     
     static set(creepName: string, target: RoomPosition, path: string): void {
       const key = \`\${creepName}-\${target.x},\${target.y},\${target.roomName}\`;
       this.cache.set(key, {
         path,
         expiresAt: Game.time + 5
       });
     }
   }`;
   
   fs.writeFileSync('src/cache/path.ts', pathCacheCode);
   
   // Update movement logic
   // ... modify existing files ...
   ```

6. **Test Thoroughly**
   ```typescript
   // Run all tests
   execSync('npm run build', { stdio: 'inherit' });
   execSync('npm test', { stdio: 'inherit' });
   execSync('npm run lint', { stdio: 'inherit' });
   
   console.log('✅ All tests passed');
   ```

7. **Commit Changes** (handled by workflow)
   ```typescript
   // Workflow will:
   // - Create feature branch
   // - Commit changes
   // - Create PR with auto-merge-candidate label
   ```

### Workflow 3: Post-Deployment Learning

**Objective**: Record outcomes and improve future decisions

**Steps**:

1. **Monitor Deployment**
   ```typescript
   // After PR merges, post-deployment monitoring runs
   
   // Capture baseline (from before merge)
   const baseline = {
     cpu: { avg: 50.5, p95: 75.2 },
     timestamp: Date.now()
   };
   
   // Wait for deployment (30 minutes default)
   await sleep(30 * 60 * 1000);
   
   // Capture post-deployment metrics
   const postDeploy = await query_prometheus({
     expr: "screeps_cpu_usage",
     startTime: "now-10m",
     endTime: "now"
   });
   ```

2. **Compare Performance**
   ```typescript
   const cpuIncrease = (postDeploy.avg - baseline.cpu.avg) / baseline.cpu.avg;
   
   console.log(`CPU change: ${(cpuIncrease * 100).toFixed(1)}%`);
   
   const needsRollback = cpuIncrease > 0.20; // 20% threshold
   const severity = cpuIncrease > 0.30 ? 'critical' :
                    cpuIncrease > 0.20 ? 'high' :
                    cpuIncrease > 0.10 ? 'medium' : 'low';
   ```

3. **Record Outcome**
   ```typescript
   // Load learning database
   const db = JSON.parse(
     fs.readFileSync('.github/autonomous-learning/outcomes.json')
   );
   
   // Add new outcome
   db.outcomes[`pr_${prNumber}`] = {
     pr: prNumber,
     timestamp: new Date().toISOString(),
     type: 'performance',
     filesChanged: ['src/cache/path.ts'],
     linesChanged: 45,
     predicted: {
       cpuImpact: -0.15, // Expected 15% reduction
       confidence: 'high',
       risk: 'low'
     },
     actual: {
       cpuChange: cpuIncrease * 100,
       baseline: baseline.cpu.avg,
       postDeploy: postDeploy.avg
     },
     success: !needsRollback,
     rolledBack: needsRollback,
     severity,
     lessons: [
       cpuIncrease < -0.15 ? 'Path caching more effective than predicted' :
       cpuIncrease > -0.05 ? 'Path caching less effective than expected' :
       'Path caching performed as expected'
     ],
     tags: ['caching', 'pathfinding', 'optimization']
   };
   
   // Save database
   fs.writeFileSync(
     '.github/autonomous-learning/outcomes.json',
     JSON.stringify(db, null, 2)
   );
   ```

4. **Trigger Rollback if Needed**
   ```typescript
   if (needsRollback) {
     // Create rollback PR
     await github.rest.pulls.create({
       owner: 'ralphschuler',
       repo: 'screeps',
       title: `revert: Rollback PR #${prNumber} (${(cpuIncrease * 100).toFixed(1)}% CPU increase)`,
       head: `rollback/pr-${prNumber}`,
       base: 'main',
       body: `Automatic rollback due to ${(cpuIncrease * 100).toFixed(1)}% CPU increase`
     });
     
     // Create incident if critical
     if (severity === 'critical') {
       await github.rest.issues.create({
         title: `🔴 INCIDENT: Critical performance degradation from PR #${prNumber}`,
         labels: ['incident', 'critical', 'performance-issue']
       });
     }
   }
   ```

## Best Practices

### For All Agents

1. **Always fact-check with MCP servers** before making decisions
2. **Search for duplicates** before creating issues
3. **Be conservative** - when in doubt, create an issue for human review
4. **Document decisions** - explain why you chose a particular approach
5. **Learn from history** - check learning database for similar attempts

### For Strategic Planning

1. Use real data from Grafana, not assumptions
2. Reference wiki articles for proven techniques
3. Include evidence (metrics, graphs, links) in issues
4. Prioritize by impact and effort
5. Create weekly summary reports

### For Autonomous Improvement

1. Implement ONE thing at a time
2. Keep changes minimal (< 50 lines, < 3 files)
3. Run ALL tests before committing
4. Follow existing code patterns
5. If unsure, create an issue instead

### For Maintainer

1. Verify alignment with ROADMAP.md
2. Check test coverage
3. Add `auto-merge-candidate` only if truly low-risk
4. Request changes if issues found
5. Monitor post-merge performance

## Common Patterns

### Pattern: CPU Optimization

```typescript
// 1. Identify bottleneck from Grafana
const cpuBySystem = await query_prometheus({
  expr: 'screeps_cpu_by_system'
});

// 2. Search wiki for solutions
const solutions = await screeps_wiki_search({
  query: `${bottleneckSystem} optimization`
});

// 3. Verify API usage
const apiDocs = await screeps_docs_get_api({
  objectName: bottleneckObject
});

// 4. Implement with caching/optimization
// 5. Test and measure impact
```

### Pattern: Feature Gap

```typescript
// 1. Check ROADMAP.md for planned features
// 2. Search wiki for implementation examples
// 3. Verify API support
// 4. Create detailed issue with plan
// 5. Let human decide on priority
```

### Pattern: Bug Fix

```typescript
// 1. Get error logs from Loki
const errors = await query_loki_logs({
  logql: '{app="screeps-bot"} |~ "ERROR"'
});

// 2. Identify root cause
// 3. Check learning DB for similar bugs
// 4. If low-risk fix, implement
// 5. If complex, create issue
```

## Troubleshooting

### Issue: Can't access MCP tools

**Solution**: MCP tools are only available during workflow execution. If testing locally, use mock data or skip MCP calls.

### Issue: Tests fail after implementation

**Solution**: Revert changes and create an issue instead. Don't commit failing code.

### Issue: Unsure about risk level

**Solution**: Default to creating an issue. It's better to be conservative.

### Issue: Learning database shows failures for similar changes

**Solution**: Don't attempt the change. Create an issue explaining past failures and suggesting alternative approach.

## Summary

The autonomous development system enables continuous improvement through:

1. **Daily Analysis**: Strategic planning identifies opportunities
2. **Weekly Action**: Autonomous improvement implements low-risk changes
3. **Continuous Learning**: Outcomes feed back into decision-making

**Key Principle**: When in doubt, create an issue for human review. The system is designed to be conservative and safe.
