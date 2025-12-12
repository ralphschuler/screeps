/**
 * Type definitions for test environment
 * Extends Screeps types with test-specific augmentations
 */

declare global {
  interface RoomMemory {
    /** Flag indicating room is hostile (has enemy towers or attackers) */
    hostile?: boolean;
  }

  interface Memory {
    uuid: number;
    log: any;
    /** Heap cache persistence storage */
    _heapCache?: {
      version: number;
      lastSync: number;
      data: Record<string, { value: any; lastModified: number; ttl?: number }>;
    };
    /** SS2 Terminal Communications multi-packet queue */
    ss2PacketQueue?: Record<string, {
      terminalId: Id<StructureTerminal>;
      targetRoom: string;
      resourceType: ResourceConstant;
      amount: number;
      packets: string[];
      nextPacketIndex: number;
      queuedAt: number;
    }>;
  }
}

export {};
