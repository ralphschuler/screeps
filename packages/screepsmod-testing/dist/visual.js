"use strict";
/**
 * Visual testing helpers for Screeps RoomVisual snapshots
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisualAssert = exports.VisualTester = void 0;
exports.createVisualSnapshot = createVisualSnapshot;
/**
 * Visual testing utilities
 */
var VisualTester = /** @class */ (function () {
    function VisualTester() {
        this.snapshots = new Map();
    }
    /**
     * Capture a visual snapshot of a room
     */
    VisualTester.prototype.captureSnapshot = function (roomName, tick) {
        try {
            // Access RoomVisual if available
            if (typeof RoomVisual === 'undefined') {
                console.log('[screepsmod-testing] RoomVisual not available');
                return null;
            }
            // Create a snapshot key
            var key = "".concat(roomName, "-").concat(tick);
            // Serialize visual data (this is a simplified approach)
            // In a real implementation, you'd need to capture the actual RoomVisual data
            var visualData = this.serializeRoomVisual(roomName);
            var snapshot = {
                roomName: roomName,
                tick: tick,
                visualData: visualData,
                timestamp: Date.now()
            };
            this.snapshots.set(key, snapshot);
            return snapshot;
        }
        catch (error) {
            console.log("[screepsmod-testing] Error capturing snapshot: ".concat(error));
            return null;
        }
    };
    /**
     * Compare two visual snapshots
     */
    VisualTester.prototype.compareSnapshots = function (snapshot1, snapshot2, tolerance) {
        if (tolerance === void 0) { tolerance = 0; }
        // Simple comparison based on serialized data
        var match = snapshot1.visualData === snapshot2.visualData;
        if (match) {
            return { match: true, difference: 0 };
        }
        // Calculate difference (simplified)
        var diff = this.calculateDifference(snapshot1.visualData, snapshot2.visualData);
        return {
            match: diff <= tolerance,
            difference: diff,
            details: "Visual data differs by ".concat(diff.toFixed(2), "%")
        };
    };
    /**
     * Get a stored snapshot
     */
    VisualTester.prototype.getSnapshot = function (roomName, tick) {
        var key = "".concat(roomName, "-").concat(tick);
        return this.snapshots.get(key) || null;
    };
    /**
     * Clear all snapshots
     */
    VisualTester.prototype.clearSnapshots = function () {
        this.snapshots.clear();
    };
    /**
     * Serialize RoomVisual data
     * This is a placeholder implementation - in a real scenario,
     * you'd need to hook into the actual RoomVisual implementation
     */
    VisualTester.prototype.serializeRoomVisual = function (roomName) {
        // In a real implementation, this would capture the actual visual data
        // For now, return a placeholder
        return JSON.stringify({
            roomName: roomName,
            timestamp: Date.now(),
            elements: []
        });
    };
    /**
     * Calculate difference between two visual data strings
     */
    VisualTester.prototype.calculateDifference = function (data1, data2) {
        if (data1 === data2)
            return 0;
        // Simple Levenshtein-like distance as percentage
        var maxLen = Math.max(data1.length, data2.length);
        if (maxLen === 0)
            return 0;
        var differences = 0;
        var minLen = Math.min(data1.length, data2.length);
        for (var i = 0; i < minLen; i++) {
            if (data1[i] !== data2[i]) {
                differences++;
            }
        }
        differences += Math.abs(data1.length - data2.length);
        return (differences / maxLen) * 100;
    };
    return VisualTester;
}());
exports.VisualTester = VisualTester;
/**
 * Visual assertion helpers
 */
var VisualAssert = /** @class */ (function () {
    function VisualAssert() {
    }
    /**
     * Assert that a room's visual matches a snapshot
     */
    VisualAssert.matchesSnapshot = function (roomName, tick, expectedSnapshot, tolerance, message) {
        if (tolerance === void 0) { tolerance = 0; }
        var currentSnapshot = this.tester.captureSnapshot(roomName, tick);
        if (!currentSnapshot) {
            throw new Error(message || 'Failed to capture current snapshot');
        }
        var comparison = this.tester.compareSnapshots(currentSnapshot, expectedSnapshot, tolerance);
        if (!comparison.match) {
            throw new Error(message || "Visual snapshot does not match: ".concat(comparison.details));
        }
    };
    /**
     * Assert that two rooms have similar visuals
     */
    VisualAssert.roomsMatch = function (room1, room2, tick, tolerance, message) {
        if (tolerance === void 0) { tolerance = 0; }
        var snapshot1 = this.tester.captureSnapshot(room1, tick);
        var snapshot2 = this.tester.captureSnapshot(room2, tick);
        if (!snapshot1 || !snapshot2) {
            throw new Error(message || 'Failed to capture snapshots for comparison');
        }
        var comparison = this.tester.compareSnapshots(snapshot1, snapshot2, tolerance);
        if (!comparison.match) {
            throw new Error(message || "Room visuals do not match: ".concat(comparison.details));
        }
    };
    VisualAssert.tester = new VisualTester();
    return VisualAssert;
}());
exports.VisualAssert = VisualAssert;
/**
 * Helper to create visual snapshots for testing
 */
function createVisualSnapshot(roomName, tick, visualData) {
    return {
        roomName: roomName,
        tick: tick,
        visualData: visualData || '{}',
        timestamp: Date.now()
    };
}
//# sourceMappingURL=visual.js.map