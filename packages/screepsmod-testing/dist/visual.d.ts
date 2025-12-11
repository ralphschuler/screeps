/**
 * Visual testing helpers for Screeps RoomVisual snapshots
 */
import { VisualSnapshot } from './types';
/**
 * Visual testing utilities
 */
export declare class VisualTester {
    private snapshots;
    /**
     * Capture a visual snapshot of a room
     */
    captureSnapshot(roomName: string, tick: number): VisualSnapshot | null;
    /**
     * Compare two visual snapshots
     */
    compareSnapshots(snapshot1: VisualSnapshot, snapshot2: VisualSnapshot, tolerance?: number): {
        match: boolean;
        difference: number;
        details?: string;
    };
    /**
     * Get a stored snapshot
     */
    getSnapshot(roomName: string, tick: number): VisualSnapshot | null;
    /**
     * Clear all snapshots
     */
    clearSnapshots(): void;
    /**
     * Serialize RoomVisual data
     * This is a placeholder implementation - in a real scenario,
     * you'd need to hook into the actual RoomVisual implementation
     */
    private serializeRoomVisual;
    /**
     * Calculate difference between two visual data strings
     */
    private calculateDifference;
}
/**
 * Visual assertion helpers
 */
export declare class VisualAssert {
    private static tester;
    /**
     * Assert that a room's visual matches a snapshot
     */
    static matchesSnapshot(roomName: string, tick: number, expectedSnapshot: VisualSnapshot, tolerance?: number, message?: string): void;
    /**
     * Assert that two rooms have similar visuals
     */
    static roomsMatch(room1: string, room2: string, tick: number, tolerance?: number, message?: string): void;
}
/**
 * Helper to create visual snapshots for testing
 */
export declare function createVisualSnapshot(roomName: string, tick: number, visualData?: string): VisualSnapshot;
//# sourceMappingURL=visual.d.ts.map