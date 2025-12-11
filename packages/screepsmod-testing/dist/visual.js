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
class VisualTester {
    constructor() {
        this.snapshots = new Map();
    }
    /**
     * Capture a visual snapshot of a room
     */
    captureSnapshot(roomName, tick) {
        try {
            // Access RoomVisual if available
            if (typeof RoomVisual === 'undefined') {
                console.log('[screepsmod-testing] RoomVisual not available');
                return null;
            }
            // Create a snapshot key
            const key = `${roomName}-${tick}`;
            // Serialize visual data (this is a simplified approach)
            // In a real implementation, you'd need to capture the actual RoomVisual data
            const visualData = this.serializeRoomVisual(roomName);
            const snapshot = {
                roomName,
                tick,
                visualData,
                timestamp: Date.now()
            };
            this.snapshots.set(key, snapshot);
            return snapshot;
        }
        catch (error) {
            console.log(`[screepsmod-testing] Error capturing snapshot: ${error}`);
            return null;
        }
    }
    /**
     * Compare two visual snapshots
     */
    compareSnapshots(snapshot1, snapshot2, tolerance = 0) {
        // Simple comparison based on serialized data
        const match = snapshot1.visualData === snapshot2.visualData;
        if (match) {
            return { match: true, difference: 0 };
        }
        // Calculate difference (simplified)
        const diff = this.calculateDifference(snapshot1.visualData, snapshot2.visualData);
        return {
            match: diff <= tolerance,
            difference: diff,
            details: `Visual data differs by ${diff.toFixed(2)}%`
        };
    }
    /**
     * Get a stored snapshot
     */
    getSnapshot(roomName, tick) {
        const key = `${roomName}-${tick}`;
        return this.snapshots.get(key) || null;
    }
    /**
     * Clear all snapshots
     */
    clearSnapshots() {
        this.snapshots.clear();
    }
    /**
     * Serialize RoomVisual data
     * This is a placeholder implementation - in a real scenario,
     * you'd need to hook into the actual RoomVisual implementation
     */
    serializeRoomVisual(roomName) {
        // In a real implementation, this would capture the actual visual data
        // For now, return a placeholder
        return JSON.stringify({
            roomName,
            timestamp: Date.now(),
            elements: []
        });
    }
    /**
     * Calculate difference between two visual data strings
     */
    calculateDifference(data1, data2) {
        if (data1 === data2)
            return 0;
        // Simple Levenshtein-like distance as percentage
        const maxLen = Math.max(data1.length, data2.length);
        if (maxLen === 0)
            return 0;
        let differences = 0;
        const minLen = Math.min(data1.length, data2.length);
        for (let i = 0; i < minLen; i++) {
            if (data1[i] !== data2[i]) {
                differences++;
            }
        }
        differences += Math.abs(data1.length - data2.length);
        return (differences / maxLen) * 100;
    }
}
exports.VisualTester = VisualTester;
/**
 * Visual assertion helpers
 */
class VisualAssert {
    /**
     * Assert that a room's visual matches a snapshot
     */
    static matchesSnapshot(roomName, tick, expectedSnapshot, tolerance = 0, message) {
        const currentSnapshot = this.tester.captureSnapshot(roomName, tick);
        if (!currentSnapshot) {
            throw new Error(message || 'Failed to capture current snapshot');
        }
        const comparison = this.tester.compareSnapshots(currentSnapshot, expectedSnapshot, tolerance);
        if (!comparison.match) {
            throw new Error(message || `Visual snapshot does not match: ${comparison.details}`);
        }
    }
    /**
     * Assert that two rooms have similar visuals
     */
    static roomsMatch(room1, room2, tick, tolerance = 0, message) {
        const snapshot1 = this.tester.captureSnapshot(room1, tick);
        const snapshot2 = this.tester.captureSnapshot(room2, tick);
        if (!snapshot1 || !snapshot2) {
            throw new Error(message || 'Failed to capture snapshots for comparison');
        }
        const comparison = this.tester.compareSnapshots(snapshot1, snapshot2, tolerance);
        if (!comparison.match) {
            throw new Error(message || `Room visuals do not match: ${comparison.details}`);
        }
    }
}
exports.VisualAssert = VisualAssert;
VisualAssert.tester = new VisualTester();
/**
 * Helper to create visual snapshots for testing
 */
function createVisualSnapshot(roomName, tick, visualData) {
    return {
        roomName,
        tick,
        visualData: visualData || '{}',
        timestamp: Date.now()
    };
}
//# sourceMappingURL=visual.js.map