import type { BlueprintPoint, StructurePlacement } from "./blueprints/types";

export type Position = BlueprintPoint;

/** Generate road ring around a position (8 adjacent tiles). */
export function createSpawnRoadRing(center: BlueprintPoint): BlueprintPoint[] {
  return [
    { x: center.x - 1, y: center.y - 1 },
    { x: center.x, y: center.y - 1 },
    { x: center.x + 1, y: center.y - 1 },
    { x: center.x - 1, y: center.y },
    { x: center.x + 1, y: center.y },
    { x: center.x - 1, y: center.y + 1 },
    { x: center.x, y: center.y + 1 },
    { x: center.x + 1, y: center.y + 1 }
  ];
}

/** Generate road spokes from a center point. */
export function createRadialRoads(
  center: BlueprintPoint,
  length: number,
  directions: Array<"north" | "south" | "east" | "west">
): BlueprintPoint[] {
  const roads: BlueprintPoint[] = [];

  for (const direction of directions) {
    for (let offset = 1; offset <= length; offset++) {
      switch (direction) {
        case "north":
          roads.push({ x: center.x, y: center.y - offset });
          break;
        case "south":
          roads.push({ x: center.x, y: center.y + offset });
          break;
        case "east":
          roads.push({ x: center.x + offset, y: center.y });
          break;
        case "west":
          roads.push({ x: center.x - offset, y: center.y });
          break;
      }
    }
  }

  return roads;
}

/** Return rampart overlay positions for critical structure types. */
export function createStructureProtection(
  structures: StructurePlacement[],
  typesToProtect: BuildableStructureConstant[]
): BlueprintPoint[] {
  return structures
    .filter(structure => typesToProtect.includes(structure.structureType))
    .map(structure => ({ x: structure.x, y: structure.y }));
}
