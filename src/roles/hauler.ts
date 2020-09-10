import { withdraw } from "behaviors/withdraw";
import { deposit } from "behaviors/deposit";

const findContainerByFlag = (flag: Flag) => {
    let container = flag.pos.lookFor(LOOK_STRUCTURES)
        .find(structure => structure.structureType === STRUCTURE_CONTAINER)

    if (!container) return null;
    return container as StructureContainer;
}

const findEmptyDestinationContainer = () => {
    let target: StructureContainer|null = null;
    for (let flag in Game.flags) {
        if (!Game.flags[flag].name.startsWith('dest')) continue;

        let container = findContainerByFlag(Game.flags[flag]);

        if (!container) continue;

        if (!target || container.store.getUsedCapacity() < target.store.getUsedCapacity()) {
            target = container;
        }
    }
    return target?.id;
}

const findFullSourceContainer = () => {
    let target: StructureContainer|null = null;
    for (let flag in Game.flags) {
        if (!Game.flags[flag].name.startsWith('source')) continue;

        let container = findContainerByFlag(Game.flags[flag]);

        if (!container) continue;

        if (!target || container.store.getUsedCapacity() > target.store.getUsedCapacity()) {
            target = container;
        }
    }
    return target?.id;
}

export const run = (creep: Creep) => {
    if(!creep.memory.destination) {
        // We are not currently moving. Are we near a source flag?
        if (creep.pos.findInRange(FIND_FLAGS, 1).find(flag => flag.name.startsWith('source'))) {
            withdraw(creep);
            // Find the destination flag with the most empty container
            creep.memory.destination = findEmptyDestinationContainer();
        } else if (creep.pos.findInRange(FIND_FLAGS, 1).find(flag => flag.name.startsWith('dest'))) {
            // We are on a destination flag
            deposit(creep, [STRUCTURE_CONTAINER]);
            // Find the source flag with the most full container
            creep.memory.destination = findFullSourceContainer();
        } else {
            // Find the nearest full source flag and head there
            creep.memory.destination = findFullSourceContainer();
        }
    }

    let target = Game.getObjectById(creep.memory.destination);
    if (!target) creep.memory.destination = null;

    if (!creep.pos.inRangeTo(target as RoomPosition, 1)) {
        creep.moveTo(target as RoomPosition);
    } else {
        creep.memory.destination = null;
    }
}
