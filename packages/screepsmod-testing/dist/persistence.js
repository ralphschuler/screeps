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
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var PERSISTENCE_VERSION = '1.0.0';
var DEFAULT_HISTORY_SIZE = 10;
/**
 * Persistence manager for test results
 */
var PersistenceManager = /** @class */ (function () {
    function PersistenceManager(filePath, maxHistorySize) {
        this.filePath = filePath || path.join(process.cwd(), '.screeps-test-results.json');
        this.maxHistorySize = maxHistorySize || DEFAULT_HISTORY_SIZE;
    }
    /**
     * Load persisted test data
     */
    PersistenceManager.prototype.load = function () {
        try {
            if (fs.existsSync(this.filePath)) {
                var data = fs.readFileSync(this.filePath, 'utf8');
                var persistence = JSON.parse(data);
                // Validate version
                if (persistence.version !== PERSISTENCE_VERSION) {
                    console.log('[screepsmod-testing] Persistence version mismatch, starting fresh');
                    return null;
                }
                return persistence;
            }
        }
        catch (error) {
            console.log("[screepsmod-testing] Error loading persistence: ".concat(error));
        }
        return null;
    };
    /**
     * Save test results
     */
    PersistenceManager.prototype.save = function (summary) {
        try {
            var persistence = this.load();
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
            var data = JSON.stringify(persistence, null, 2);
            fs.writeFileSync(this.filePath, data, 'utf8');
            console.log("[screepsmod-testing] Test results persisted to ".concat(this.filePath));
        }
        catch (error) {
            console.log("[screepsmod-testing] Error saving persistence: ".concat(error));
        }
    };
    /**
     * Get test history
     */
    PersistenceManager.prototype.getHistory = function () {
        var persistence = this.load();
        return (persistence === null || persistence === void 0 ? void 0 : persistence.summaries) || [];
    };
    /**
     * Clear persisted data
     */
    PersistenceManager.prototype.clear = function () {
        try {
            if (fs.existsSync(this.filePath)) {
                fs.unlinkSync(this.filePath);
                console.log('[screepsmod-testing] Persistence cleared');
            }
        }
        catch (error) {
            console.log("[screepsmod-testing] Error clearing persistence: ".concat(error));
        }
    };
    /**
     * Get statistics from history
     */
    PersistenceManager.prototype.getStatistics = function () {
        var persistence = this.load();
        if (!persistence || persistence.summaries.length === 0) {
            return null;
        }
        var summaries = persistence.summaries;
        var totalRuns = persistence.totalRuns;
        // Calculate average pass rate
        var passRates = summaries.map(function (s) { return s.total > 0 ? s.passed / s.total : 0; });
        var averagePassRate = passRates.reduce(function (sum, rate) { return sum + rate; }, 0) / passRates.length;
        // Calculate average duration
        var averageDuration = summaries.reduce(function (sum, s) { return sum + s.duration; }, 0) / summaries.length;
        // Get most recent status
        var recent = summaries[0];
        var mostRecentStatus = 'partial';
        if (recent.failed === 0) {
            mostRecentStatus = 'passed';
        }
        else if (recent.passed === 0) {
            mostRecentStatus = 'failed';
        }
        return {
            totalRuns: totalRuns,
            averagePassRate: averagePassRate,
            averageDuration: averageDuration,
            mostRecentStatus: mostRecentStatus
        };
    };
    return PersistenceManager;
}());
exports.PersistenceManager = PersistenceManager;
//# sourceMappingURL=persistence.js.map