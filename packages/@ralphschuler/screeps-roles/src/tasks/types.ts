/** Persistent creep task assignment domain model. */

export type TaskType =
  | "refillSpawn"
  | "refillExtension"
  | "refillTower"
  | "storeEnergy"
  | "build"
  | "repair"
  | "upgrade"
  | "harvest"
  | "heal"
  | "defend"
  | "remote";

export enum TaskPriority {
  LOW = 10,
  NORMAL = 50,
  HIGH = 100,
  CRITICAL = 200
}

export type TaskStatus = "open" | "assigned" | "complete" | "invalid";

export interface TaskReservation {
  creepName: string;
  amount: number;
  assignedTick: number;
  expiresTick: number;
}

export interface CreepTask {
  id: string;
  roomName: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  targetId?: Id<_HasId>;
  targetPos?: { x: number; y: number; roomName: string };
  resourceType?: ResourceConstant;
  amount: number;
  reservedAmount: number;
  maxAssignments: number;
  assignedCreeps: string[];
  reservations: Record<string, TaskReservation>;
  allowedRoles: string[];
  createdTick: number;
  updatedTick: number;
  expiresTick: number;
}

export interface RoomTaskBoardMemory {
  roomName: string;
  tasks: Record<string, CreepTask>;
  lastGeneratedTick: number;
  lastCleanedTick: number;
  stats: {
    generated: number;
    assigned: number;
    completed: number;
    invalidated: number;
    staleReservations: number;
    preemptions: number;
  };
}

export interface TaskBoardMemory {
  enabled: boolean;
  rooms: Record<string, RoomTaskBoardMemory>;
}

export interface TaskBoardStats {
  roomName: string;
  enabled: boolean;
  open: number;
  assigned: number;
  complete: number;
  invalid: number;
  reservations: number;
  staleReservations: number;
  preemptions: number;
}

export interface TaskAssignmentOptions {
  /** Restrict assignment to these task types. */
  allowedTypes?: TaskType[];
  /** Existing low-priority assignment can be replaced by this priority or higher. */
  preemptPriority?: TaskPriority;
  /** Keep current assigned task if still valid unless priority delta exceeds this. */
  priorityStickinessDelta?: number;
}
