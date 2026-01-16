#!/usr/bin/env node

/**
 * Analyzes code complexity across the repository
 * Uses simple metrics: lines of code per file and function count
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MAX_FILE_LINES = 300;
const MAX_FUNCTION_COMPLEXITY_WARNING = 15;

async function analyzeComplexity() {
  console.log('🔍 Analyzing code complexity...\n');

  // Find all TypeScript files using find command
  const findCmd = 'find packages -name "*.ts" -type f ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/test/*" ! -name "*.test.ts" ! -name "*.spec.ts" ! -name "*.d.ts"';
  const fileList = execSync(findCmd, { encoding: 'utf-8' });
  const files = fileList.trim().split('\n').filter(f => f.length > 0);

  const results = {
    totalFiles: 0,
    largeFiles: [],
    complexFunctions: [],
    totalLines: 0,
    averageLines: 0,
    filesOverLimit: 0
  };

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const lineCount = lines.length;
    const relativePath = path.relative(process.cwd(), file);

    results.totalFiles++;
    results.totalLines += lineCount;

    // Check file size
    if (lineCount > MAX_FILE_LINES) {
      results.filesOverLimit++;
      results.largeFiles.push({
        file: relativePath,
        lines: lineCount
      });
    }

    // Simple function detection (not perfect, but good enough for baseline)
    const functionRegex = /(?:function\s+\w+|(?:public|private|protected)?\s*(?:async)?\s*\w+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{)/g;
    const matches = content.match(functionRegex) || [];
    
    // Estimate complexity by counting control flow statements
    const controlFlowRegex = /\b(if|else|while|for|switch|case|catch|&&|\|\|)\b/g;
    const controlFlowMatches = content.match(controlFlowRegex) || [];
    
    if (matches.length > 0) {
      const avgComplexity = Math.ceil(controlFlowMatches.length / matches.length);
      
      if (avgComplexity > MAX_FUNCTION_COMPLEXITY_WARNING) {
        results.complexFunctions.push({
          file: relativePath,
          estimatedComplexity: avgComplexity,
          functionCount: matches.length,
          controlFlowCount: controlFlowMatches.length
        });
      }
    }
  }

  results.averageLines = Math.round(results.totalLines / results.totalFiles);

  // Sort by size/complexity
  results.largeFiles.sort((a, b) => b.lines - a.lines);
  results.complexFunctions.sort((a, b) => b.estimatedComplexity - a.estimatedComplexity);

  // Generate report
  console.log('📊 Complexity Analysis Results\n');
  console.log('='.repeat(80));
  console.log(`Total Files Analyzed: ${results.totalFiles}`);
  console.log(`Total Lines of Code: ${results.totalLines.toLocaleString()}`);
  console.log(`Average Lines per File: ${results.averageLines}`);
  console.log(`Files over ${MAX_FILE_LINES} lines: ${results.filesOverLimit} (${Math.round(results.filesOverLimit / results.totalFiles * 100)}%)`);
  console.log('='.repeat(80));
  console.log('');

  if (results.largeFiles.length > 0) {
    console.log('⚠️  Large Files (over ' + MAX_FILE_LINES + ' lines):\n');
    results.largeFiles.slice(0, 20).forEach(f => {
      console.log(`  ${f.lines.toString().padStart(5)} lines - ${f.file}`);
    });
    console.log('');
  }

  if (results.complexFunctions.length > 0) {
    console.log('⚠️  Files with High Complexity (estimated):\n');
    results.complexFunctions.slice(0, 20).forEach(f => {
      console.log(`  Avg complexity ~${f.estimatedComplexity} (${f.functionCount} functions, ${f.controlFlowCount} control flows)`);
      console.log(`    ${f.file}`);
    });
    console.log('');
  }

  // Save report
  const reportPath = path.join(process.cwd(), 'reports', 'complexity-baseline.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Full report saved to: ${path.relative(process.cwd(), reportPath)}`);

  return results;
}

// Run analysis
analyzeComplexity().catch(err => {
  console.error('Error analyzing complexity:', err);
  process.exit(1);
});
