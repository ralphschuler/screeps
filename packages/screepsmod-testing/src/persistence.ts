/**
 * Test result persistence for surviving server restarts
 */

import { TestSummary, TestPersistence } from './types';
import * as fs from 'fs';
import * as path from 'path';

const PERSISTENCE_VERSION = '1.0.0';
const DEFAULT_HISTORY_SIZE = 10;

/**
 * Persistence manager for test results
 */
export class PersistenceManager {
  private filePath: string;
  private maxHistorySize: number;

  constructor(filePath?: string, maxHistorySize?: number) {
    this.filePath = filePath || path.join(process.cwd(), '.screeps-test-results.json');
    this.maxHistorySize = maxHistorySize || DEFAULT_HISTORY_SIZE;
  }

  /**
   * Load persisted test data
   */
  load(): TestPersistence | null {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        const persistence: TestPersistence = JSON.parse(data);
        
        // Validate version
        if (persistence.version !== PERSISTENCE_VERSION) {
          console.log('[screepsmod-testing] Persistence version mismatch, starting fresh');
          return null;
        }
        
        return persistence;
      }
    } catch (error) {
      console.log(`[screepsmod-testing] Error loading persistence: ${error}`);
    }
    return null;
  }

  /**
   * Save test results
   */
  save(summary: TestSummary): void {
    try {
      let persistence = this.load();
      
      if (!persistence) {
        persistence = {
          version: PERSISTENCE_VERSION,
          lastRun: Date.now(),
          totalRuns: 0,
          summaries: [],
          maxHistorySize: this.maxHistorySize
        };
      }

      // Update metadata
      persistence.lastRun = Date.now();
      persistence.totalRuns++;

      // Add new summary
      persistence.summaries.unshift(summary);

      // Trim history if needed
      if (persistence.summaries.length > this.maxHistorySize) {
        persistence.summaries = persistence.summaries.slice(0, this.maxHistorySize);
      }

      // Write to file
      const data = JSON.stringify(persistence, null, 2);
      fs.writeFileSync(this.filePath, data, 'utf8');
      
      console.log(`[screepsmod-testing] Test results persisted to ${this.filePath}`);
    } catch (error) {
      console.log(`[screepsmod-testing] Error saving persistence: ${error}`);
    }
  }

  /**
   * Get test history
   */
  getHistory(): TestSummary[] {
    const persistence = this.load();
    return persistence?.summaries || [];
  }

  /**
   * Clear persisted data
   */
  clear(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
        console.log('[screepsmod-testing] Persistence cleared');
      }
    } catch (error) {
      console.log(`[screepsmod-testing] Error clearing persistence: ${error}`);
    }
  }

  /**
   * Get statistics from history
   */
  getStatistics(): {
    totalRuns: number;
    averagePassRate: number;
    averageDuration: number;
    mostRecentStatus: 'passed' | 'failed' | 'partial';
  } | null {
    const persistence = this.load();
    if (!persistence || persistence.summaries.length === 0) {
      return null;
    }

    const summaries = persistence.summaries;
    const totalRuns = persistence.totalRuns;
    
    // Calculate average pass rate
    const passRates = summaries.map(s => s.total > 0 ? s.passed / s.total : 0);
    const averagePassRate = passRates.reduce((sum, rate) => sum + rate, 0) / passRates.length;

    // Calculate average duration
    const averageDuration = summaries.reduce((sum, s) => sum + s.duration, 0) / summaries.length;

    // Get most recent status
    const recent = summaries[0];
    let mostRecentStatus: 'passed' | 'failed' | 'partial' = 'partial';
    if (recent.failed === 0) {
      mostRecentStatus = 'passed';
    } else if (recent.passed === 0) {
      mostRecentStatus = 'failed';
    }

    return {
      totalRuns,
      averagePassRate,
      averageDuration,
      mostRecentStatus
    };
  }
}
