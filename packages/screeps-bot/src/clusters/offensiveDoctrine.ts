/**
 * Offensive Doctrine System
 *
 * Implements the three-tier offensive escalation model from ROADMAP Section 12:
 * 1. Harassment - Fast hit-and-run attacks on workers
 * 2. Raid - Coordinated attacks to disrupt operations
 * 3. Siege - Full-scale assault with dismantlers and support
 *
 * Each doctrine defines squad composition, tactics, and target priorities.
 */

import type { ClusterMemory } from "../memory/schemas";
import { logger } from "../core/logger";

/**
 * Offensive doctrine types (escalation levels)
 */
export type OffensiveDoctrine = "harassment" | "raid" | "siege";

/**
 * Squad role composition for a doctrine
 */
export interface DoctrineComposition {
  /** Number of harassers (fast raiders) */
  harassers: number;
  /** Number of soldiers (melee/mixed) */
  soldiers: number;
  /** Number of rangers (ranged attackers) */
  rangers: number;
  /** Number of healers */
  healers: number;
  /** Number of siege units (dismantlers) */
  siegeUnits: number;
}

/**
 * Target priority weights for a doctrine
 */
export interface TargetPriority {
  /** Priority for spawns */
  spawns: number;
  /** Priority for towers */
  towers: number;
  /** Priority for workers (harvesters/haulers) */
  workers: number;
  /** Priority for military creeps */
  military: number;
  /** Priority for extensions */
  extensions: number;
  /** Priority for storage/terminal */
  storage: number;
  /** Priority for walls/ramparts */
  defenses: number;
  /** Priority for labs */
  labs: number;
}

/**
 * Doctrine configuration
 */
export interface DoctrineConfig {
  /** Squad composition */
  composition: DoctrineComposition;
  /** Target priorities */
  targetPriority: TargetPriority;
  /** Minimum energy required to launch */
  minEnergy: number;
  /** Whether to use boosts */
  useBoosts: boolean;
  /** Retreat threshold (HP percentage) */
  retreatThreshold: number;
  /** Recommended creep body size (energy cost) */
  creepSize: "small" | "medium" | "large";
  /** Engagement rules */
  engagement: {
    /** Whether to engage towers */
    engageTowers: boolean;
    /** Maximum tower count to engage */
    maxTowers: number;
    /** Whether to target defenses first */
    prioritizeDefenses: boolean;
  };
}

/**
 * Doctrine configurations by type
 */
export const DOCTRINE_CONFIGS: Record<OffensiveDoctrine, DoctrineConfig> = {
  harassment: {
    composition: {
      harassers: 3,
      soldiers: 0,
      rangers: 1,
      healers: 0,
      siegeUnits: 0
    },
    targetPriority: {
      workers: 100,
      military: 50,
      spawns: 20,
      towers: 10,
      extensions: 15,
      storage: 10,
      defenses: 5,
      labs: 5
    },
    minEnergy: 50000,
    useBoosts: false,
    retreatThreshold: 0.5,
    creepSize: "small",
    engagement: {
      engageTowers: false,
      maxTowers: 0,
      prioritizeDefenses: false
    }
  },
  raid: {
    composition: {
      harassers: 1,
      soldiers: 2,
      rangers: 3,
      healers: 2,
      siegeUnits: 0
    },
    targetPriority: {
      military: 100,
      towers: 80,
      spawns: 90,
      workers: 60,
      extensions: 50,
      storage: 40,
      labs: 30,
      defenses: 20
    },
    minEnergy: 100000,
    useBoosts: false,
    retreatThreshold: 0.4,
    creepSize: "medium",
    engagement: {
      engageTowers: true,
      maxTowers: 2,
      prioritizeDefenses: false
    }
  },
  siege: {
    composition: {
      harassers: 0,
      soldiers: 2,
      rangers: 4,
      healers: 3,
      siegeUnits: 2
    },
    targetPriority: {
      towers: 100,
      spawns: 100,
      military: 90,
      defenses: 80,
      storage: 70,
      labs: 60,
      extensions: 50,
      workers: 40
    },
    minEnergy: 200000,
    useBoosts: true,
    retreatThreshold: 0.3,
    creepSize: "large",
    engagement: {
      engageTowers: true,
      maxTowers: 6,
      prioritizeDefenses: true
    }
  }
};

/**
 * Determine appropriate doctrine based on target room intelligence
 */
export function selectDoctrine(
  targetRoomName: string,
  intel?: {
    towerCount?: number;
    spawnCount?: number;
    rcl?: number;
    owner?: string;
    militaryPresence?: number;
  }
): OffensiveDoctrine {
  // Default to harassment if no intel
  if (!intel) {
    logger.debug(`No intel for ${targetRoomName}, defaulting to harassment`, {
      subsystem: "Doctrine"
    });
    return "harassment";
  }

  const towers = intel.towerCount ?? 0;
  const spawns = intel.spawnCount ?? 0;
  const rcl = intel.rcl ?? 0;
  const military = intel.militaryPresence ?? 0;

  // Calculate threat score
  const threatScore = towers * 3 + spawns * 2 + military * 1.5 + rcl * 0.5;

  // Select doctrine based on threat
  if (threatScore >= 20 || rcl >= 7) {
    logger.info(`Selected SIEGE doctrine for ${targetRoomName} (threat: ${threatScore})`, {
      subsystem: "Doctrine"
    });
    return "siege";
  } else if (threatScore >= 10 || rcl >= 5) {
    logger.info(`Selected RAID doctrine for ${targetRoomName} (threat: ${threatScore})`, {
      subsystem: "Doctrine"
    });
    return "raid";
  } else {
    logger.info(`Selected HARASSMENT doctrine for ${targetRoomName} (threat: ${threatScore})`, {
      subsystem: "Doctrine"
    });
    return "harassment";
  }
}

/**
 * Check if cluster has resources to launch a doctrine
 */
export function canLaunchDoctrine(
  cluster: ClusterMemory,
  doctrine: OffensiveDoctrine
): boolean {
  const config = DOCTRINE_CONFIGS[doctrine];
  
  // Calculate total energy available across cluster rooms
  let totalEnergy = 0;
  for (const roomName of cluster.memberRooms) {
    const room = Game.rooms[roomName];
    if (!room || !room.controller?.my) continue;
    
    const storage = room.storage;
    const terminal = room.terminal;
    
    if (storage) totalEnergy += storage.store.energy;
    if (terminal) totalEnergy += terminal.store.energy;
  }

  const canLaunch = totalEnergy >= config.minEnergy;
  
  if (!canLaunch) {
    logger.debug(
      `Cannot launch ${doctrine}: insufficient energy (${totalEnergy}/${config.minEnergy})`,
      { subsystem: "Doctrine" }
    );
  }
  
  return canLaunch;
}

/**
 * Get target priority for a specific structure/creep type
 */
export function getTargetPriority(
  doctrine: OffensiveDoctrine,
  targetType: keyof TargetPriority
): number {
  return DOCTRINE_CONFIGS[doctrine].targetPriority[targetType];
}

/**
 * Get composition for a doctrine
 */
export function getDoctrineComposition(doctrine: OffensiveDoctrine): DoctrineComposition {
  return { ...DOCTRINE_CONFIGS[doctrine].composition };
}

/**
 * Get engagement rules for a doctrine
 */
export function getEngagementRules(doctrine: OffensiveDoctrine): DoctrineConfig["engagement"] {
  return { ...DOCTRINE_CONFIGS[doctrine].engagement };
}
