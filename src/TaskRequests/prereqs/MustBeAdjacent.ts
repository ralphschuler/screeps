import { Exclude, Transform, TransformationType } from "class-transformer";
import { SpeculativeMinion } from "../SpeculativeMinion";
import { TaskPrerequisite } from "../TaskPrerequisite";
import { TravelTask } from "TaskRequests/types/TravelTask";
import { Task } from "TaskRequests/Task";
import { transformRoomPosition } from "utils/transformGameObject";

/**
 * Checks if minion is adjacent to a given position
 * If not, creates TravelTask(s) to each possible adjacent position
 * @param pos Get reference when prerequisite is checked
 */
export class MustBeAdjacent extends TaskPrerequisite {
    @Transform(transformRoomPosition)
    pos: RoomPosition
    distance: number
    constructor(
        pos: RoomPosition,
        distance: number = 1
    ) {
        super();
        this.pos = pos;
        this.distance = distance;
    }

    met(minion: SpeculativeMinion) {
        return minion.pos.inRangeTo(this.pos, 1)
    };
    toMeet(minion: SpeculativeMinion) {
        return [new TravelTask(this.pos, this.distance)];
    }
}