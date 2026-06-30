import type { SharedEnemyIntel } from "@ralphschuler/screeps-intershard";

export interface LocalRoomIntelSnapshot {
  roomName: string;
  owner?: string;
  threatLevel: 0 | 1 | 2 | 3;
  lastSeen: number;
}

export interface CrossShardEnemyMergeInput {
  existingEnemies: SharedEnemyIntel[];
  // warTargets can include usernames and room names; room entries are resolved via known room owner.
  warTargets: string[];
  knownRooms: LocalRoomIntelSnapshot[];
  now: number;
  isAlly: (username: string) => boolean;
}

export interface CrossShardEnemyMergeIntent {
  enemies: SharedEnemyIntel[];
  skippedAllies: string[];
  skippedSourceKeepers: string[];
}

const ROOM_NAME_RE = /^([WE])(\d+)([NS])(\d+)$/;

function isRoomName(value: string): boolean {
  return ROOM_NAME_RE.test(value);
}

export function mergeCrossShardEnemyIntel(input: CrossShardEnemyMergeInput): CrossShardEnemyMergeIntent {
  const enemyMap = new Map<string, SharedEnemyIntel>();
  const skippedAllies = new Set<string>();
  const skippedSourceKeepers = new Set<string>();

  const roomOwnerByName = new Map<string, string>();
  for (const room of input.knownRooms) {
    if (room.owner) {
      roomOwnerByName.set(room.roomName, room.owner);
    }
  }

  const ensureEnemy = (
    username: string,
    roomName?: string,
    threatLevel: 0 | 1 | 2 | 3 = 1
  ): SharedEnemyIntel => {
    const existing = enemyMap.get(username);
    if (existing) {
      if (roomName && !existing.rooms.includes(roomName)) {
        existing.rooms.push(roomName);
      }
      existing.rooms.sort();
      existing.lastSeen = Math.max(existing.lastSeen, input.now);
      existing.threatLevel = Math.max(existing.threatLevel, threatLevel) as 0 | 1 | 2 | 3;
      return existing;
    }

    const enemy: SharedEnemyIntel = {
      username,
      rooms: roomName ? [roomName] : [],
      threatLevel,
      lastSeen: input.now,
      isAlly: false
    };
    enemyMap.set(username, enemy);
    return enemy;
  };

  for (const enemy of input.existingEnemies) {
    if (input.isAlly(enemy.username) || enemy.isAlly) {
      skippedAllies.add(enemy.username);
      continue;
    }
    enemyMap.set(enemy.username, { ...enemy, rooms: [...enemy.rooms], isAlly: false });
  }

  for (const target of input.warTargets) {
    if (input.isAlly(target)) {
      skippedAllies.add(target);
      continue;
    }

    if (isRoomName(target)) {
      const owner = roomOwnerByName.get(target);
      if (!owner) {
        continue;
      }

      if (owner.includes("Source Keeper") || input.isAlly(owner)) {
        if (owner.includes("Source Keeper")) {
          skippedSourceKeepers.add(owner);
        }
        if (input.isAlly(owner)) {
          skippedAllies.add(owner);
        }
        continue;
      }

      ensureEnemy(owner, target, 1);
      continue;
    }

    ensureEnemy(target);
  }

  for (const room of input.knownRooms) {
    if (!room.owner) continue;
    if (room.owner.includes("Source Keeper")) {
      skippedSourceKeepers.add(room.owner);
      continue;
    }
    if (input.isAlly(room.owner)) {
      skippedAllies.add(room.owner);
      continue;
    }

    const enemy = ensureEnemy(room.owner);
    if (!enemy.rooms.includes(room.roomName)) {
      enemy.rooms.push(room.roomName);
      enemy.rooms.sort();
    }

    enemy.lastSeen = Math.max(enemy.lastSeen, room.lastSeen);
    enemy.threatLevel = Math.max(enemy.threatLevel, room.threatLevel) as 0 | 1 | 2 | 3;
  }

  return {
    enemies: [...enemyMap.values()].sort((a, b) => a.username.localeCompare(b.username)),
    skippedAllies: [...skippedAllies].sort(),
    skippedSourceKeepers: [...skippedSourceKeepers].sort()
  };
}
