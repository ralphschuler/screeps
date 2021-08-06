import { Objectives } from "Objectives/Objective";
import { byId } from "Selectors/byId";

export const purgeDeadCreeps = () => {
  // Automatically delete memory of missing creeps
  if(Game.time%1500 === 0) {
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }
  }
  Object.values(Objectives).forEach(o => {
    o.assigned = o.assigned.filter(byId);
  })
}
