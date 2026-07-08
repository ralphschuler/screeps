import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";

const DEFENSE_ASSIST_REQUEST_TTL = 500;

export interface DefenseAssistRequestMemory {
  roomName: string;
  guardsNeeded?: number;
  rangersNeeded?: number;
  healersNeeded?: number;
  urgency?: number;
  createdAt?: number;
}

interface DefenseAssistRequestMemoryOwner {
  defenseRequests?: DefenseAssistRequestMemory[] | Record<string, DefenseAssistRequestMemory>;
}

function isDefenseAssistRequest(value: unknown): value is DefenseAssistRequestMemory {
  return Boolean(value && typeof value === "object" && typeof (value as DefenseAssistRequestMemory).roomName === "string");
}

export function hasCurrentDefenseThreat(request: DefenseAssistRequestMemory): boolean {
  const targetRoom = Game.rooms[request.roomName];
  if (targetRoom) return getActualHostileCreeps(targetRoom).length > 0;
  return Game.time - (request.createdAt ?? 0) <= DEFENSE_ASSIST_REQUEST_TTL;
}

export function readDefenseAssistRequests(memory: DefenseAssistRequestMemoryOwner): DefenseAssistRequestMemory[] {
  const requests = memory.defenseRequests;
  const values = Array.isArray(requests) ? requests : Object.values(requests ?? {});
  return values.filter(isDefenseAssistRequest);
}

export function getActiveDefenseAssistRequests(
  memory: DefenseAssistRequestMemoryOwner,
  options: { prune?: boolean } = {}
): DefenseAssistRequestMemory[] {
  const requests = readDefenseAssistRequests(memory);
  const activeRequests = requests.filter(hasCurrentDefenseThreat);

  if (options.prune && Array.isArray(memory.defenseRequests) && activeRequests.length !== requests.length) {
    memory.defenseRequests = activeRequests;
  }

  return activeRequests;
}
