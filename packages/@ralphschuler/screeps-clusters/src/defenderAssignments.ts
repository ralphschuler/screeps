import type { ClusterMemory } from "./types";

type DefenseAssistRole = "guard" | "ranger" | "healer";

type DefenseRequest = ClusterMemory["defenseRequests"][number];

interface DefenseAssistMemory {
  role?: string;
  family?: string;
  assistTarget?: string;
  targetRoom?: string;
  task?: string;
  defenseSquadId?: string;
  defenseSquadSize?: number;
  defenseSquadCreatedAt?: number;
}

interface DefenseCandidate {
  creep: Creep;
  room: Room;
  role: DefenseAssistRole;
  distance: number;
}

export interface DefenseAssignmentEvent {
  creepName: string;
  role: DefenseAssistRole;
  fromRoom: string;
  targetRoom: string;
  distance: number;
}

export interface AssignDefendersOptions {
  rooms: { [roomName: string]: Room | undefined };
  now: number;
  getDistance: (fromRoom: string, toRoom: string) => number;
  isRoomSafe?: (room: Room, roomName: string) => boolean;
}

function getNeededCount(request: DefenseRequest, role: DefenseAssistRole): number {
  if (role === "guard") return Math.max(0, request.guardsNeeded);
  if (role === "ranger") return Math.max(0, request.rangersNeeded);
  return Math.max(0, request.healersNeeded);
}

function setNeededCount(request: DefenseRequest, role: DefenseAssistRole, count: number): void {
  const clamped = Math.max(0, count);
  if (role === "guard") {
    request.guardsNeeded = clamped;
    return;
  }
  if (role === "ranger") {
    request.rangersNeeded = clamped;
    return;
  }
  request.healersNeeded = clamped;
}

function getMilitaryAssistRole(memory: DefenseAssistMemory): DefenseAssistRole | null {
  if (memory.family !== "military") return null;
  if (memory.role === "guard" || memory.role === "ranger" || memory.role === "healer") return memory.role;
  return null;
}

function hasActiveRolePart(creep: Creep, role: DefenseAssistRole): boolean {
  if ((creep as { spawning?: boolean }).spawning) return false;

  const activeParts = (creep.body ?? []).filter(part => part.hits > 0).map(part => part.type);
  if (role === "guard") return activeParts.includes(ATTACK) || activeParts.includes(RANGED_ATTACK);
  if (role === "ranger") return activeParts.includes(RANGED_ATTACK);
  return activeParts.includes(HEAL);
}

function collectCandidatesForRequest(
  cluster: Pick<ClusterMemory, "memberRooms">,
  request: DefenseRequest,
  options: AssignDefendersOptions
): DefenseCandidate[] {
  const candidates: DefenseCandidate[] = [];

  for (const roomName of cluster.memberRooms) {
    if (roomName === request.roomName) continue;

    const room = options.rooms[roomName];
    if (!room) continue;
    if (options.isRoomSafe && !options.isRoomSafe(room, roomName)) continue;

    const creeps = room.find(FIND_MY_CREEPS);
    for (const creep of creeps) {
      const memory = creep.memory as DefenseAssistMemory;
      const role = getMilitaryAssistRole(memory);
      if (!role) continue;
      if (memory.assistTarget) continue;
      if (!hasActiveRolePart(creep, role)) continue;
      if (request.assignedCreeps.includes(creep.name)) continue;
      if (getNeededCount(request, role) <= 0) continue;

      candidates.push({
        creep,
        room,
        role,
        distance: options.getDistance(roomName, request.roomName)
      });
    }
  }

  return candidates.sort((a, b) => a.distance - b.distance);
}

function selectCandidatesForOpenRoles(request: DefenseRequest, candidates: DefenseCandidate[]): DefenseCandidate[] {
  const remaining: Record<DefenseAssistRole, number> = {
    guard: Math.max(0, request.guardsNeeded),
    ranger: Math.max(0, request.rangersNeeded),
    healer: Math.max(0, request.healersNeeded)
  };
  const selected: DefenseCandidate[] = [];

  for (const candidate of candidates) {
    if (remaining[candidate.role] <= 0) continue;
    selected.push(candidate);
    remaining[candidate.role]--;
  }

  return selected;
}

/**
 * Assign idle military creeps to cluster defense requests.
 *
 * Candidate selection is recomputed for each request so role checks, distances,
 * and assist-target state cannot leak from an earlier target into a later one.
 */
export function assignDefendersToDefenseRequests(
  cluster: Pick<ClusterMemory, "memberRooms" | "defenseRequests">,
  options: AssignDefendersOptions
): DefenseAssignmentEvent[] {
  if (cluster.defenseRequests.length === 0) return [];

  const assignments: DefenseAssignmentEvent[] = [];
  const sortedRequests = [...cluster.defenseRequests].sort((a, b) => b.urgency - a.urgency);

  for (const request of sortedRequests) {
    const targetRoom = options.rooms[request.roomName];
    if (!targetRoom) continue;

    const candidates = collectCandidatesForRequest(cluster, request, options);
    const selectedDefenders = selectCandidatesForOpenRoles(request, candidates);
    const selectedByRoom = selectedDefenders.reduce((counts, defender) => {
      counts.set(defender.room.name, (counts.get(defender.room.name) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());

    for (const defender of selectedDefenders) {
      const memory = defender.creep.memory as DefenseAssistMemory;
      const localSquadSize = Math.max(1, Math.min(3, selectedByRoom.get(defender.room.name) ?? 1));

      memory.assistTarget = request.roomName;
      memory.targetRoom = request.roomName;
      memory.task = "defenseAssist";
      memory.defenseSquadId = `defenseAssist:${defender.room.name}:${request.roomName}:${options.now}`;
      memory.defenseSquadSize = localSquadSize;
      memory.defenseSquadCreatedAt = options.now;
      request.assignedCreeps.push(defender.creep.name);
      setNeededCount(request, defender.role, getNeededCount(request, defender.role) - 1);

      assignments.push({
        creepName: defender.creep.name,
        role: defender.role,
        fromRoom: defender.room.name,
        targetRoom: request.roomName,
        distance: defender.distance
      });
    }
  }

  return assignments;
}
