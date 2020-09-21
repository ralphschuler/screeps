
import { Memoize } from "typescript-memoize";
import { Analyst } from "./Analyst";
import { MapAnalyst } from "./MapAnalyst";

export type Mine = {
    pos: RoomPosition,
    id: string,
    source?: Source,
    container?: StructureContainer,
    constructionSite?: ConstructionSite,
    miner?: Creep
    minerOnSite?: boolean
}

export class SourceAnalyst extends Analyst {
    @Memoize((container: StructureContainer) => ('' + container.id + Game.time))
    isMineContainer(container: StructureContainer) {
        return this.getDesignatedMiningLocations(container.room).some(mine => mine.container === container)
    }
    @Memoize((room: Room) => ('' + room.name))
    calculateBestMiningLocations(room: Room) {
        let locations: {pos: RoomPosition, sourceId: string}[] = [];
        let sources = room.find(FIND_SOURCES);
        let spawn = Object.values(Game.spawns).find(spawn => spawn.room === room);
        let target = (spawn? spawn.pos : room.getPositionAt(25, 25)) as RoomPosition;

        sources.forEach(source => {
            let route = PathFinder.search(source.pos, target);
            if (route) locations.push({pos: route.path[0], sourceId: source.id});
        })
        return locations;
    }
    @Memoize((room: Room) => ('' + room.name + Game.time))
    getDesignatedMiningLocations(room: Room) {
        let miners = room.find(FIND_MY_CREEPS)
        .filter(creep => creep.memory.source)
        return Object.values(Game.flags)
        .filter(flag => flag.memory.source)
        .map(flag => {
            let mine: Mine = {
                pos: flag.pos,
                id: (flag.memory.source as string),
                source: Game.getObjectById(flag.memory.source as Id<Source>) || undefined,
                miner: miners.find(m => m.memory.source === flag.memory.source)
            }
            mine.minerOnSite = false;
            flag.pos.look().forEach(obj => {
                if (obj.type === LOOK_STRUCTURES && obj.structure?.structureType === STRUCTURE_CONTAINER) {
                    mine.container = obj.structure as StructureContainer
                } else if (obj.type === LOOK_CONSTRUCTION_SITES && obj.constructionSite?.structureType === STRUCTURE_CONTAINER) {
                    mine.constructionSite = obj.constructionSite as ConstructionSite
                } else if (mine.miner && obj.type === LOOK_CREEPS && obj.creep?.id === mine.miner.id) {
                    mine.minerOnSite = true;
                }
            });
            return mine;
        });
    }
    /**
    * Returns a list of locations adjacent to sources
    * where a) the source is not already maxed by
    * active miners and b) the location is not occupied
    * @param room
    */
    @Memoize((room: Room) => ('' + room.name + Game.time))
    getAuxiliaryMiningLocations(room: Room): RoomPosition[] {
        return this.getSources(room).map(source => (
            this.getAuxiliaryMiningLocationsForSource(room, source)
        )).reduce((a, b) => a.concat(b), [])
    }
    /**
    * Returns a list of locations adjacent to sources
    * where a) the source is not already maxed by
    * active miners and b) the location is not occupied
    * @param room
    */
    @Memoize((room: Room, source: Source) => ('' + room.name + source.id + Game.time))
    getAuxiliaryMiningLocationsForSource(room: Room, source: Source): RoomPosition[] {
        let output = 0;
        let spaces = global.analysts.map.calculateAdjacentPositions(source.pos).filter(pos => {
            if (!global.analysts.map.isPositionWalkable(pos)) return false;
            let creeps = pos.lookFor(LOOK_CREEPS)
            creeps.forEach(creep => {
                // Assumes all creeps adjacent to a source are actively working
                // TODO: Check
                output += creep.getActiveBodyparts(WORK) * 2;
            })
            if (creeps.length > 0) return false;
            return true;
        })
        //console.log(`[${source.id}] ${spaces.length} mining spots, current output ${output}/${source.energyCapacity / 300}`)
        if (spaces.length > 0 && output < (source.energyCapacity / 300)) {
            // There is an adjacent square, and source is not maxed out
            return spaces;
        }
        return [];
    }
    @Memoize((room: Room) => ('' + room.name + Game.time))
    getSources (room: Room) {
        return room.find(FIND_SOURCES);
    }
    @Memoize((room: Room) => ('' + room.name + Game.time))
    getUntappedSources(room: Room) {
        return this.getSources(room).filter(source =>
            this.getAuxiliaryMiningLocationsForSource(room, source).length > 0
        )
    }
}
