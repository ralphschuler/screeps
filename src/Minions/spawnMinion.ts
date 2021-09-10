import { defaultDirectionsForSpawn } from "Selectors/defaultDirectionsForSpawn";
import { isPositionWalkable } from "Selectors/MapCoordinates";
import { getSpawns } from "Selectors/roomPlans";
import { getEnergyStructures } from "Selectors/spawnsAndExtensionsDemand";
import { MinionTypes } from "./minionTypes";


let spawningCache = new Map<Id<StructureSpawn>, number>();

export const spawnMinion = (
    office: string,
    objective: string,
    minionType: MinionTypes,
    body: BodyPartConstant[]
) => (opts: {
    preferredSpawn?: StructureSpawn,
    allowOtherSpawns?: boolean, // Default: true
    preferredSpaces?: RoomPosition[],
    allowOtherSpaces?: boolean, // Default: true
} = {}) => {
    // console.log(office, objective, 'spawning', minionType);
    // check parameters
    if (body.length === 0) return ERR_NO_BODYPART;
    // select spawn
    let spawn: StructureSpawn|undefined;
    let directions: DirectionConstant[] = [];
    if (opts.preferredSpawn && spawningCache.get(opts.preferredSpawn.id) !== Game.time && !opts.preferredSpawn.spawning) {
        spawn = opts.preferredSpawn
        // select direction
        if (opts.preferredSpaces) {
            for (let pos of opts.preferredSpaces) {
                // Only select open directions
                if (isPositionWalkable(pos, false, false)) {
                    directions.push(spawn.pos.getDirectionTo(pos))
                }
            }
        }
        if (opts.allowOtherSpaces !== false) {
            directions = directions.concat(defaultDirectionsForSpawn(office, spawn))
        }
    } else if (opts.allowOtherSpawns !== false) {
        spawn = getSpawns(office).find(s => !s.spawning && spawningCache.get(s.id) !== Game.time && !s.spawning)
        directions = spawn ? defaultDirectionsForSpawn(office, spawn) : []
    }
    if (!spawn) return ERR_BUSY; // No valid spawn available

    // try to spawn minion
    const r = spawn.spawnCreep(
        body,
        `${minionType}-${office}-${Game.time % 10000}-${spawn.id.slice(23)}`,
        {
            memory: {
                type: minionType,
                office,
                objective
            },
            energyStructures: getEnergyStructures(office),
            directions
        }
    )
    if (r === OK || r === ERR_NOT_ENOUGH_ENERGY || r === ERR_BUSY) spawningCache.set(spawn.id, Game.time)
    // if (spawn.name === 'Spawn6') console.log(spawn, r, objective, body);
    return r;
}