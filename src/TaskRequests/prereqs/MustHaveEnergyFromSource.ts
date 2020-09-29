import { Exclude } from "class-transformer";
import { SpeculativeMinion } from "TaskRequests/SpeculativeMinion";
import { Task } from "TaskRequests/Task";
import { TaskPrerequisite } from "TaskRequests/TaskPrerequisite";
import { HarvestTask } from "TaskRequests/types/HarvestTask";
import { WithdrawTask } from "TaskRequests/types/WithdrawTask";
import { getCreepHomeOffice } from "utils/gameObjectSelectors";
import { MustHaveEnergy } from "./MustHaveEnergy";

/**
 * Checks if minion is full or has enough energy to meet quantity
 * If not, creates tasks to harvest or withdraw energy
 * @param quantity Get reference when prerequisite is checked
 */
export class MustHaveEnergyFromSource extends MustHaveEnergy {
    toMeet(minion: SpeculativeMinion) {
        if (minion.capacity === 0) return null; // Cannot carry energy

        // // Get mine containers only
        // let sources = global.analysts.source.getDesignatedMiningLocations(minion.creep.room)
        //     .map(mine => mine.container)
        //     .filter(c => c) as StructureContainer[]

        // Get most full mine container only
        let office = getCreepHomeOffice(minion.creep);
        if (!office) return [];
        let sourceContainers = (global.analysts.sales.getFranchiseLocations(office)
            .map(mine => mine.container)
            .filter(c => c) as StructureContainer[])

        if (sourceContainers.length === 0) return [];

        let source = sourceContainers.reduce((a, b) => (a && a.store.getUsedCapacity(RESOURCE_ENERGY) > b.store.getUsedCapacity(RESOURCE_ENERGY) ? a : b))

        return [new WithdrawTask(source)];
    }
}
