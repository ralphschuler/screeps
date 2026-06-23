import type { PheromoneState, SwarmState } from "@ralphschuler/screeps-memory";
import type { PheromoneConfig } from "./config";
import { clampPheromoneValue } from "./limits";

const DIFFUSIBLE_PHEROMONES: (keyof PheromoneState)[] = ["defense", "war", "expand", "siege"];

interface DiffusionStep {
  target: string;
  type: keyof PheromoneState;
  amount: number;
  sourceIntensity: number;
}

/**
 * Diffuse general room-level pheromones to cardinal neighbors.
 *
 * Diffusion is queued first so source order cannot immediately amplify a target
 * and feed the same tick's propagation. Targets are capped at source intensity.
 */
export function applyDiffusion(rooms: Map<string, SwarmState>, config: PheromoneConfig): void {
  const diffusionQueue = buildDiffusionQueue(rooms, config);

  for (const diff of diffusionQueue) {
    const targetSwarm = rooms.get(diff.target);
    if (!targetSwarm) continue;

    const newValue = targetSwarm.pheromones[diff.type] + diff.amount;
    targetSwarm.pheromones[diff.type] = clampPheromoneValue(Math.min(newValue, diff.sourceIntensity), config);
  }
}

/** Diffuse threat-specific defense pressure through visible owned cluster rooms. */
export function diffuseDangerToCluster(
  sourceRoom: string,
  threatScore: number,
  clusterRooms: string[],
  config: PheromoneConfig
): void {
  for (const neighborRoom of clusterRooms) {
    if (neighborRoom === sourceRoom) continue;

    const room = Game.rooms[neighborRoom];
    if (!room?.controller?.my) continue;

    const neighborSwarm = (room.memory as unknown as { swarm?: SwarmState }).swarm;
    if (!neighborSwarm) continue;

    const sourceDefenseLevel = clampPheromoneValue(threatScore / 10, config);
    const neighborDefense = neighborSwarm.pheromones.defense;
    const positiveDifference = Math.max(0, sourceDefenseLevel - neighborDefense);
    const diffusedAmount = positiveDifference * 0.05;
    neighborSwarm.pheromones.defense = clampPheromoneValue(neighborDefense + diffusedAmount, config);
  }
}

function buildDiffusionQueue(rooms: Map<string, SwarmState>, config: PheromoneConfig): DiffusionStep[] {
  const diffusionQueue: DiffusionStep[] = [];

  for (const [roomName, swarm] of rooms) {
    for (const neighborName of getNeighborRoomNames(roomName)) {
      if (!rooms.has(neighborName)) continue;

      for (const type of DIFFUSIBLE_PHEROMONES) {
        const intensity = swarm.pheromones[type];
        if (intensity <= 1) continue;

        const rate = config.diffusionRates[type];
        diffusionQueue.push({
          target: neighborName,
          type,
          amount: intensity * rate * 0.5,
          sourceIntensity: intensity
        });
      }
    }
  }

  return diffusionQueue;
}

/** Return cardinal Screeps room names around a room, including world-origin edges. */
export function getNeighborRoomNames(roomName: string): string[] {
  const match = roomName.match(/^([WE])(\d+)([NS])(\d+)$/);
  if (!match) return [];

  const [, wx, xStr, wy, yStr] = match;
  if (!wx || !xStr || !wy || !yStr) return [];

  const x = parseInt(xStr, 10);
  const y = parseInt(yStr, 10);

  const neighbors: string[] = [];

  if (wy === "N") {
    neighbors.push(`${wx}${x}N${y + 1}`);
  } else if (y > 0) {
    neighbors.push(`${wx}${x}S${y - 1}`);
  } else {
    neighbors.push(`${wx}${x}N0`);
  }

  if (wy === "S") {
    neighbors.push(`${wx}${x}S${y + 1}`);
  } else if (y > 0) {
    neighbors.push(`${wx}${x}N${y - 1}`);
  } else {
    neighbors.push(`${wx}${x}S0`);
  }

  if (wx === "E") {
    neighbors.push(`E${x + 1}${wy}${y}`);
  } else if (x > 0) {
    neighbors.push(`W${x - 1}${wy}${y}`);
  } else {
    neighbors.push(`E0${wy}${y}`);
  }

  if (wx === "W") {
    neighbors.push(`W${x + 1}${wy}${y}`);
  } else if (x > 0) {
    neighbors.push(`E${x - 1}${wy}${y}`);
  } else {
    neighbors.push(`W0${wy}${y}`);
  }

  return neighbors;
}
