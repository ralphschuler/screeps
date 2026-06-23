import { DEFAULT_ROAD_SITES_PER_TICK, MAX_CONSTRUCTION_SITES_PER_ROOM } from "./config";
import { calculateRoadNetwork } from "./infrastructure";
import { parseRoadPositionKey, toRoadPositionKey } from "./positionKeys";

function getExistingRoadKeys(room: Room): Set<string> {
  const existingRoads = room.find(FIND_STRUCTURES, {
    filter: s => s.structureType === STRUCTURE_ROAD
  });

  return new Set(existingRoads.map(road => toRoadPositionKey(road.pos)));
}

function getExistingRoadSiteKeys(sites: ConstructionSite[]): Set<string> {
  return new Set(
    sites
      .filter(site => site.structureType === STRUCTURE_ROAD)
      .map(site => toRoadPositionKey(site.pos))
  );
}

/**
 * Place road construction sites along the cached infrastructure network.
 *
 * Placement is rate-limited and respects the Screeps per-room construction-site
 * limit so road planning does not starve higher-priority construction.
 */
export function placeRoadConstructionSites(
  room: Room,
  anchor: RoomPosition,
  maxSites = DEFAULT_ROAD_SITES_PER_TICK
): number {
  const existingSites = room.find(FIND_MY_CONSTRUCTION_SITES);
  if (existingSites.length >= MAX_CONSTRUCTION_SITES_PER_ROOM) return 0;

  const roadNetwork = calculateRoadNetwork(room, anchor);
  const terrain = room.getTerrain();
  const existingRoadSet = getExistingRoadKeys(room);
  const existingSiteSet = getExistingRoadSiteKeys(existingSites);

  let placed = 0;

  for (const posKey of roadNetwork.positions) {
    if (placed >= maxSites) break;
    if (existingSites.length + placed >= MAX_CONSTRUCTION_SITES_PER_ROOM) break;
    if (existingRoadSet.has(posKey)) continue;
    if (existingSiteSet.has(posKey)) continue;

    const { x, y } = parseRoadPositionKey(posKey);
    if (terrain.get(x, y) === TERRAIN_MASK_WALL) continue;

    const result = room.createConstructionSite(x, y, STRUCTURE_ROAD);
    if (result === OK) {
      placed++;
    }
  }

  return placed;
}
