import type { SharedEnemyIntel } from "@ralphschuler/screeps-intershard";

export interface LocalRoomIntelSnapshot {
  roomName: string;
  owner?: string;
  threatLevel: 0 | 1 | 2 | 3;
  lastSeen: number;
}

export interface CrossShardEnemyMergeInput {
  existingEnemies: SharedEnemyIntel[];
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

export function mergeCrossShardEnemyIntel(input: CrossShardEnemyMergeInput): CrossShardEnemyMergeIntent {
  const enemyMap = new Map<string, SharedEnemyIntel>();
  const skippedAllies = new Set<string>();
  const skippedSourceKeepers = new Set<string>();

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
    const existing = enemyMap.get(target);
    if (existing) {
      existing.lastSeen = Math.max(existing.lastSeen, input.now);
      existing.threatLevel = Math.max(existing.threatLevel, 1) as 0 | 1 | 2 | 3;
    } else {
      enemyMap.set(target, { username: target, rooms: [], threatLevel: 1, lastSeen: input.now, isAlly: false });
    }
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

    const existing = enemyMap.get(room.owner);
    if (existing) {
      if (!existing.rooms.includes(room.roomName)) existing.rooms.push(room.roomName);
      existing.rooms.sort();
      existing.lastSeen = Math.max(existing.lastSeen, room.lastSeen);
      existing.threatLevel = Math.max(existing.threatLevel, room.threatLevel) as 0 | 1 | 2 | 3;
    } else {
      enemyMap.set(room.owner, {
        username: room.owner,
        rooms: [room.roomName],
        threatLevel: room.threatLevel,
        lastSeen: room.lastSeen,
        isAlly: false
      });
    }
  }

  return {
    enemies: [...enemyMap.values()].sort((a, b) => a.username.localeCompare(b.username)),
    skippedAllies: [...skippedAllies].sort(),
    skippedSourceKeepers: [...skippedSourceKeepers].sort()
  };
}
