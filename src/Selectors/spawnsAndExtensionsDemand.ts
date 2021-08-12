import { roomPlans } from "./roomPlans";

export const getExtensions = (room: string) => {
    const plan = roomPlans(room)?.office;
    if (!plan) return [];
    return [
        ...plan.extensions.extensions,
        ...plan.franchise1.extensions,
        ...plan.franchise2.extensions,
    ]
}

export const getEnergyStructures = (room: string) => {
    const plan = roomPlans(room)?.office;
    if (!plan) return [];
    return [
        ...plan.extensions.extensions,
        ...plan.franchise1.extensions,
        plan.franchise1.spawn,
        ...plan.franchise2.extensions,
        plan.franchise2.spawn,
    ].map(s => s.structure).filter(s => s) as (StructureExtension|StructureSpawn)[]
}

export const extensionsDemand = (room: string) => {
    return getExtensions(room).reduce((sum, s) => {
        return sum + ((s.structure as StructureExtension)?.store.getFreeCapacity(RESOURCE_ENERGY) ?? 0)
    }, 0)
}
