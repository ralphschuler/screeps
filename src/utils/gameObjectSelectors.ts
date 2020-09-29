export function getBuildEnergyRemaining(target: ConstructionSite) {
    return target.progressTotal - target.progress;
}
export function getRepairEnergyRemaining(target: Structure) {
    return (target.hitsMax - target.hits)/100;
}
export function getTransferEnergyRemaining(target: AnyStoreStructure) {
    return (target.store as GenericStore).getFreeCapacity(RESOURCE_ENERGY);
}
export function getCreepHomeOffice(creep: Creep) {
    if (!creep.memory.office) return;
    return global.boardroom.offices.get(creep.memory.office);
}
