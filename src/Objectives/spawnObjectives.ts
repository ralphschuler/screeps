import { debugCPU, resetDebugCPU } from "utils/debugCPU";

import { PrioritizedObjectives } from "./initializeObjectives";
import { byId } from "Selectors/byId";
import { spawns } from "Selectors/roomPlans";

const DEBUG = false;

export const spawnObjectives = (room: string) => {
    let s = spawns(room);
    if (DEBUG) resetDebugCPU();
    for (let o of PrioritizedObjectives) {
        if (s.length === 0) break;
        o.assigned = o.assigned.filter(byId); // Clear out dead minions
        const spawnedCount = o.spawn(room, s);
        if (DEBUG) debugCPU(o.id);
        // console.log(o.id, ':', spawnedCount);
        // Remove any booked spawns and continue
        s = s.slice(spawnedCount);
    }
}
