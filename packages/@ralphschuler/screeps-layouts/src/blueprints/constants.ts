/**
 * Blueprint constants and shared utilities
 */

/**
 * Get structure limits per RCL
 */
export function getStructureLimits(rcl: number): Record<BuildableStructureConstant, number> {
  const limits: Record<number, Partial<Record<BuildableStructureConstant, number>>> = {
    1: { spawn: 1, extension: 0, road: 2500, constructedWall: 0 },
    2: { spawn: 1, extension: 5, road: 2500, constructedWall: 2500, rampart: 2500, container: 5 },
    3: { spawn: 1, extension: 10, road: 2500, constructedWall: 2500, rampart: 2500, container: 5, tower: 1 },
    4: {
      spawn: 1,
      extension: 20,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 1,
      storage: 1
    },
    5: {
      spawn: 1,
      extension: 30,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 2,
      storage: 1,
      link: 2
    },
    6: {
      spawn: 1,
      extension: 40,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 2,
      storage: 1,
      link: 3,
      terminal: 1,
      extractor: 1,
      lab: 3
    },
    7: {
      spawn: 2,
      extension: 50,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 3,
      storage: 1,
      link: 4,
      terminal: 1,
      extractor: 1,
      lab: 6,
      factory: 1
    },
    8: {
      spawn: 3,
      extension: 60,
      road: 2500,
      constructedWall: 2500,
      rampart: 2500,
      container: 5,
      tower: 6,
      storage: 1,
      link: 6,
      terminal: 1,
      extractor: 1,
      lab: 10,
      factory: 1,
      nuker: 1,
      observer: 1,
      powerSpawn: 1
    }
  };

  return (limits[rcl] ?? limits[1]) as Record<BuildableStructureConstant, number>;
}
