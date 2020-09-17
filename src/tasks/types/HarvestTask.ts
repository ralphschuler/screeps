import { MustBeAtMine } from "tasks/prereqs/MustBeAtMine";
import { SpeculativeMinion } from "../SpeculativeMinion";
import { TaskAction } from "tasks/TaskAction";
import { Transform, TransformationType, Type } from "class-transformer";
import { transformGameObject } from "utils/transformGameObject";

export class HarvestTask extends TaskAction {
    // Prereq: Minion must be adjacent
    //         Otherwise, move to an open space
    //         near the source
    getPrereqs() {
        if (!this.source) return [];
        return [new MustBeAtMine(this.source)]
    }
    message = "⚡";

    @Type(() => Source)
    @Transform(transformGameObject(Source))
    source: Source|null = null
    constructor(
        source: Source|null = null,
    ) {
        super();
        this.source = source;
    }

    action(creep: Creep) {
        // If unable to get the creep or source, task is completed
        if (!this.source) return true;

        if (creep.harvest(this.source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(this.source);
        }
        if (creep.store.getCapacity()) {
            // If can carry, is the creep full?
            return creep.store.getFreeCapacity() == 0;
        } else {
            // If cannot carry, is the local container full?
            let container = creep.pos.lookFor(LOOK_STRUCTURES)
                .find(s => s.structureType === STRUCTURE_CONTAINER)
            // If the container is full or missing, we cannot store,
            // so there is no point in harvesting
            if (!container || (container as StructureContainer).store.getFreeCapacity()) return true;
        }
        return false;
    }
    cost(minion: SpeculativeMinion) {
        // Approximate effectiveness of minion based on number of WORK parts
        // TODO: Adjust this to compare against the creep's capacity, or the
        //       local container, if applicable
        return 1/(minion.creep.getActiveBodyparts(WORK) * 2)
    }
}
