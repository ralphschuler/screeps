/**
 * Cost-matrix construction for road planning.
 *
 * Roads and road sites are preferred, containers remain passable, and all other
 * non-owned-rampart structures are treated as blockers.
 */
export function generateRoadCostMatrix(roomName: string): CostMatrix | false {
  const room = Game.rooms[roomName];
  const costs = new PathFinder.CostMatrix();

  if (!room) {
    return costs;
  }

  const structures = room.find(FIND_STRUCTURES);
  for (const structure of structures) {
    if (structure.structureType === STRUCTURE_ROAD) {
      costs.set(structure.pos.x, structure.pos.y, 1);
    } else if (
      structure.structureType !== STRUCTURE_CONTAINER &&
      !(structure.structureType === STRUCTURE_RAMPART && "my" in structure && structure.my)
    ) {
      costs.set(structure.pos.x, structure.pos.y, 255);
    }
  }

  const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
  for (const site of sites) {
    if (site.structureType === STRUCTURE_ROAD) {
      costs.set(site.pos.x, site.pos.y, 1);
    } else if (site.structureType !== STRUCTURE_CONTAINER) {
      costs.set(site.pos.x, site.pos.y, 255);
    }
  }

  return costs;
}
