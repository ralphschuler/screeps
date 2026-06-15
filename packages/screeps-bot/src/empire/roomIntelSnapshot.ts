import type { RoomIntel } from "@ralphschuler/screeps-memory";
import { classifyRoomName as classifySignedRoomName } from "./roomGeometry";

export interface VisibleRoomIntelSnapshot {
  roomName: string;
  tick: number;
  sources: number;
  controllerLevel: number;
  owner?: string;
  reserver?: string;
  mineralType?: MineralConstant;
  hostileCreeps: number;
  hostileTowers: number;
  hostileSpawns: number;
  portals: number;
  terrain: { plains: number; swamps: number };
}

export function classifyRoomName(roomName: string): { isHighway: boolean; isSK: boolean } {
  return classifySignedRoomName(roomName);
}

export function buildStubRoomIntel(roomName: string): RoomIntel {
  const classification = classifyRoomName(roomName);
  return {
    name: roomName,
    lastSeen: 0,
    sources: 0,
    controllerLevel: 0,
    threatLevel: 0,
    scouted: false,
    terrain: "mixed",
    ...classification
  };
}

export function buildVisibleRoomIntel(snapshot: VisibleRoomIntelSnapshot): RoomIntel {
  const classification = classifyRoomName(snapshot.roomName);
  const terrainType =
    snapshot.terrain.swamps > snapshot.terrain.plains
      ? "swamp"
      : snapshot.terrain.plains > snapshot.terrain.swamps
        ? "plains"
        : "mixed";

  return {
    name: snapshot.roomName,
    lastSeen: snapshot.tick,
    sources: snapshot.sources,
    controllerLevel: snapshot.controllerLevel,
    owner: snapshot.owner,
    reserver: snapshot.reserver,
    mineralType: snapshot.mineralType,
    threatLevel: snapshot.hostileCreeps > 0 ? 1 : 0,
    scouted: true,
    terrain: terrainType,
    ...classification,
    towerCount: snapshot.hostileTowers,
    spawnCount: snapshot.hostileSpawns,
    hasPortal: snapshot.portals > 0
  };
}

export function mergeRoomIntel(existing: RoomIntel, next: RoomIntel): RoomIntel {
  return { ...existing, ...next };
}
