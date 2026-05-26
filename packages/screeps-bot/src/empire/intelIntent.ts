export type IntelThreatLevel = 0 | 1 | 2 | 3;

export interface KnownRoomIntelSnapshot {
  roomName: string;
  lastSeen: number;
  threatLevel: IntelThreatLevel;
}

export interface IntelScanIntentInput {
  time: number;
  rescanInterval: number;
  roomsPerTick: number;
  knownRooms: KnownRoomIntelSnapshot[];
}

export interface IntelScanIntent {
  scanQueue: string[];
  roomsToScanThisTick: string[];
}

export interface EnemySightingSnapshot {
  username: string;
  roomName: string;
  isAlly: boolean;
  hostileBodyParts: number;
}

export interface EnemyTrackingIntent {
  enemies: {
    username: string;
    lastSeen: number;
    rooms: string[];
    threatLevel: IntelThreatLevel;
    isAlly: boolean;
  }[];
}

export function planIntelScanIntent(input: IntelScanIntentInput): IntelScanIntent {
  const scanQueue = input.knownRooms
    .filter(room => input.time - room.lastSeen >= input.rescanInterval || room.threatLevel > 0)
    .sort((a, b) => {
      if (b.threatLevel !== a.threatLevel) return b.threatLevel - a.threatLevel;
      return a.lastSeen - b.lastSeen;
    })
    .map(room => room.roomName);

  return {
    scanQueue,
    roomsToScanThisTick: scanQueue.slice(0, input.roomsPerTick)
  };
}

export function planEnemyTrackingIntent(time: number, sightings: EnemySightingSnapshot[]): EnemyTrackingIntent {
  const enemies = new Map<string, EnemyTrackingIntent["enemies"][number]>();

  for (const sighting of sightings) {
    if (sighting.isAlly) continue;

    const existing = enemies.get(sighting.username) ?? {
      username: sighting.username,
      lastSeen: time,
      rooms: [],
      threatLevel: 0 as IntelThreatLevel,
      isAlly: false
    };

    if (!existing.rooms.includes(sighting.roomName)) existing.rooms.push(sighting.roomName);
    existing.threatLevel = Math.max(existing.threatLevel, threatLevelForBodyParts(sighting.hostileBodyParts)) as IntelThreatLevel;
    enemies.set(sighting.username, existing);
  }

  return { enemies: [...enemies.values()].sort((a, b) => a.username.localeCompare(b.username)) };
}

function threatLevelForBodyParts(bodyParts: number): IntelThreatLevel {
  if (bodyParts >= 25) return 3;
  if (bodyParts >= 10) return 2;
  if (bodyParts > 0) return 1;
  return 0;
}
