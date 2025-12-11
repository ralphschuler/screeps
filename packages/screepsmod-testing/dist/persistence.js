"use strict";
/**
 * Test result persistence for surviving server restarts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistenceManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PERSISTENCE_VERSION = '1.0.0';
const DEFAULT_HISTORY_SIZE = 10;
/**
 * Persistence manager for test results
 */
class PersistenceManager {
    constructor(filePath, maxHistorySize) {
        this.filePath = filePath || path.join(process.cwd(), '.screeps-test-results.json');
        this.maxHistorySize = maxHistorySize || DEFAULT_HISTORY_SIZE;
    }
    /**
     * Load persisted test data
     */
    load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const data = fs.readFileSync(this.filePath, 'utf8');
                const persistence = JSON.parse(data);
                // Validate version
                if (persistence.version !== PERSISTENCE_VERSION) {
                    console.log('[screepsmod-testing] Persistence version mismatch, starting fresh');
                    return null;
                }
                return persistence;
            }
        }
        catch (error) {
            console.log(`[screepsmod-testing] Error loading persistence: ${error}`);
        }
        return null;
    }
    /**
     * Save test results
     */
    save(summary) {
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
        }
        catch (error) {
            console.log(`[screepsmod-testing] Error saving persistence: ${error}`);
        }
    }
    /**
     * Get test history
     */
    getHistory() {
        const persistence = this.load();
        return persistence?.summaries || [];
    }
    /**
     * Clear persisted data
     */
    clear() {
        try {
            if (fs.existsSync(this.filePath)) {
                fs.unlinkSync(this.filePath);
                console.log('[screepsmod-testing] Persistence cleared');
            }
        }
        catch (error) {
            console.log(`[screepsmod-testing] Error clearing persistence: ${error}`);
        }
    }
    /**
     * Get statistics from history
     */
    getStatistics() {
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
        let mostRecentStatus = 'partial';
        if (recent.failed === 0) {
            mostRecentStatus = 'passed';
        }
        else if (recent.passed === 0) {
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
exports.PersistenceManager = PersistenceManager;
//# sourceMappingURL=persistence.js.map