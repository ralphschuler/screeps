import type { RoleSpawnDef } from "./template";
import { createBody, createRepeatedBodyParts } from "./template";

/**
 * Power-bank roles are operation-scoped templates coordinated by empire power harvesting code.
 */
export const POWER_ROLE_DEFINITIONS: Record<string, RoleSpawnDef> = {
  powerHarvester: {
    role: "powerHarvester",
    family: "power",
    bodies: [
      createBody(createRepeatedBodyParts([TOUGH, 5], [ATTACK, 20], [MOVE, 25]), 2300),
      createBody(createRepeatedBodyParts([TOUGH, 10], [ATTACK, 20], [MOVE, 20]), 3000)
    ],
    priority: 30,
    maxPerRoom: 2, // Per operation, coordinated by power bank manager
    remoteRole: true
  },
  powerCarrier: {
    role: "powerCarrier",
    family: "power",
    bodies: [
      createBody([...Array(20).fill(CARRY), ...Array(20).fill(MOVE)], 2000),
      createBody([...Array(25).fill(CARRY), ...Array(25).fill(MOVE)], 2500)
    ],
    priority: 25,
    maxPerRoom: 2, // Per operation
    remoteRole: true
  }
};
