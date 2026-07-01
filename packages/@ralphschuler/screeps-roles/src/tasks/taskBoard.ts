import { getActualHostileCreeps, isKnownAllyOwned } from "@ralphschuler/screeps-defense";
import type { CreepAction, CreepContext } from "../behaviors/types";
import { getTerminalEnergyExportRequest } from "./energyExport";
import { TaskPriority, type CreepTask, type RoomTaskBoardMemory, type TaskBoardMemory, type TaskBoardStats, type TaskType, type TaskAssignmentOptions } from "./types";

const DEFAULT_TASK_TTL = 50;
const DEFAULT_RESERVATION_TTL = 15;
const GENERATION_INTERVAL = 3;
const LOW_BUCKET_GENERATION_INTERVAL = 5;
const TASKBOARD_LOW_BUCKET_THRESHOLD = 4000;
const DEFAULT_STICKINESS_DELTA = 75;
const STALE_ROOM_BOARD_TTL = 1500;
const ASSIGNED_TASK_PREEMPTION_CHECK_INTERVAL = 3;

const ENERGY_DELIVERY_ROLES = [
  "larvaWorker",
  "hauler",
  "queenCarrier",
  "builder",
  "upgrader",
  "engineer",
  "interRoomCarrier"
];

const WORKER_ROLES = ["larvaWorker", "builder", "upgrader", "engineer", "remoteWorker"];
const MILITARY_ROLES = ["guard", "remoteGuard", "healer", "soldier", "siegeUnit", "harasser", "ranger"];

function measureCpuDetail<T>(name: string, fn: () => T): T {
  const profiler = (globalThis as unknown as { cpuProfiler?: { measure?: <R>(label: string, work: () => R) => R } }).cpuProfiler;
  return profiler?.measure ? profiler.measure(name, fn) : fn();
}

interface MemoryWithTaskBoard extends Memory {
  creepTaskBoard?: TaskBoardMemory;
}

function getTaskMemory(): TaskBoardMemory {
  const memory = Memory as MemoryWithTaskBoard;
  if (!memory.creepTaskBoard) {
    memory.creepTaskBoard = { enabled: true, rooms: {} };
  }
  if (memory.creepTaskBoard.enabled === undefined) {
    memory.creepTaskBoard.enabled = true;
  }
  if (!memory.creepTaskBoard.rooms) {
    memory.creepTaskBoard.rooms = {};
  }
  return memory.creepTaskBoard;
}

function createRoomBoard(roomName: string): RoomTaskBoardMemory {
  return {
    roomName,
    tasks: {},
    lastGeneratedTick: 0,
    lastCleanedTick: 0,
    stats: {
      generated: 0,
      assigned: 0,
      completed: 0,
      invalidated: 0,
      staleReservations: 0,
      preemptions: 0
    }
  };
}

function getRoomBoard(roomName: string): RoomTaskBoardMemory {
  const memory = getTaskMemory();
  if (!memory.rooms[roomName]) {
    memory.rooms[roomName] = createRoomBoard(roomName);
  }
  return memory.rooms[roomName];
}

function taskId(roomName: string, type: TaskType, targetId?: string): string {
  return `${roomName}:${type}:${targetId ?? "room"}`;
}

function remainingAmount(task: CreepTask): number {
  return Math.max(0, task.amount - task.reservedAmount);
}

function getCreepEnergy(creep: Creep): number {
  return creep.store.getUsedCapacity(RESOURCE_ENERGY);
}

function getCreepEnergyCapacity(creep: Creep): number {
  return Math.max(0, creep.store.getCapacity(RESOURCE_ENERGY));
}

function getAssignmentAmount(creep: Creep, task: CreepTask): number {
  if (task.type === "harvest") return getCreepEnergyCapacity(creep);
  return Math.max(1, getCreepEnergy(creep));
}

function canPerformTask(ctx: CreepContext, task: CreepTask): boolean {
  if (!task.allowedRoles.includes(ctx.memory.role)) return false;

  switch (task.type) {
    case "refillSpawn":
    case "refillExtension":
    case "refillTower":
    case "fillTerminalEnergy":
    case "storeEnergy":
      return getCreepEnergy(ctx.creep) > 0;
    case "build":
    case "repair":
    case "upgrade":
      return getCreepEnergy(ctx.creep) > 0 && ctx.creep.getActiveBodyparts(WORK) > 0;
    case "harvest":
      return !ctx.isFull && ctx.creep.getActiveBodyparts(WORK) > 0;
    case "heal":
      return ctx.creep.getActiveBodyparts(HEAL) > 0;
    case "defend":
      return ctx.creep.getActiveBodyparts(ATTACK) > 0 || ctx.creep.getActiveBodyparts(RANGED_ATTACK) > 0;
    case "remote":
      return true;
    default:
      return false;
  }
}

function updateOrCreateTask(
  board: RoomTaskBoardMemory,
  config: Omit<CreepTask, "createdTick" | "updatedTick" | "reservations" | "assignedCreeps" | "reservedAmount" | "status">
): CreepTask {
  const existing = board.tasks[config.id];
  if (existing) {
    existing.priority = config.priority;
    existing.targetId = config.targetId;
    existing.targetPos = config.targetPos;
    existing.resourceType = config.resourceType;
    existing.amount = config.amount;
    existing.maxAssignments = config.maxAssignments;
    existing.allowedRoles = config.allowedRoles;
    existing.expiresTick = config.expiresTick;
    existing.updatedTick = Game.time;
    existing.status = existing.assignedCreeps.length > 0 ? "assigned" : "open";
    return existing;
  }

  const task: CreepTask = {
    ...config,
    status: "open",
    assignedCreeps: [],
    reservations: {},
    reservedAmount: 0,
    createdTick: Game.time,
    updatedTick: Game.time
  };
  board.tasks[task.id] = task;
  board.stats.generated++;
  return task;
}

function memoryPosition(pos: RoomPosition | undefined): CreepTask["targetPos"] {
  if (!pos) return undefined;
  return { x: pos.x, y: pos.y, roomName: pos.roomName };
}

function createRefillTask(roomName: string, type: TaskType, structure: AnyStoreStructure, freeCapacity: number, priority: TaskPriority): Omit<CreepTask, "createdTick" | "updatedTick" | "reservations" | "assignedCreeps" | "reservedAmount" | "status"> {
  return {
    id: taskId(roomName, type, structure.id),
    roomName,
    type,
    priority,
    targetId: structure.id,
    targetPos: memoryPosition(structure.pos),
    resourceType: RESOURCE_ENERGY,
    amount: freeCapacity,
    maxAssignments: Math.max(1, Math.ceil(freeCapacity / 50)),
    allowedRoles: ENERGY_DELIVERY_ROLES,
    expiresTick: Game.time + DEFAULT_TASK_TTL
  };
}

function generateTasks(room: Room, board: RoomTaskBoardMemory): void {
  const interval = Game.cpu.bucket < TASKBOARD_LOW_BUCKET_THRESHOLD ? LOW_BUCKET_GENERATION_INTERVAL : GENERATION_INTERVAL;
  if (Game.time - board.lastGeneratedTick < interval) return;
  board.lastGeneratedTick = Game.time;

  const myStructures = measureCpuDetail("taskBoard.findMyStructures", () => room.find(FIND_MY_STRUCTURES));

  for (const structure of myStructures) {
    if (structure.structureType === STRUCTURE_SPAWN) {
      const free = structure.store.getFreeCapacity(RESOURCE_ENERGY);
      if (free > 0) updateOrCreateTask(board, createRefillTask(room.name, "refillSpawn", structure, free, TaskPriority.CRITICAL));
      continue;
    }

    if (structure.structureType === STRUCTURE_EXTENSION) {
      const free = structure.store.getFreeCapacity(RESOURCE_ENERGY);
      if (free > 0) updateOrCreateTask(board, createRefillTask(room.name, "refillExtension", structure, free, TaskPriority.HIGH));
      continue;
    }

    if (structure.structureType === STRUCTURE_TOWER) {
      const free = structure.store.getFreeCapacity(RESOURCE_ENERGY);
      if (free >= 100) updateOrCreateTask(board, createRefillTask(room.name, "refillTower", structure, free, TaskPriority.HIGH));
    }
  }

  const terminalEnergyExport = getTerminalEnergyExportRequest(room);
  if (terminalEnergyExport) {
    updateOrCreateTask(
      board,
      createRefillTask(
        room.name,
        "fillTerminalEnergy",
        terminalEnergyExport.terminal,
        terminalEnergyExport.amount,
        TaskPriority.NORMAL
      )
    );
  }

  if (room.storage && room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
    updateOrCreateTask(board, createRefillTask(room.name, "storeEnergy", room.storage, room.storage.store.getFreeCapacity(RESOURCE_ENERGY), TaskPriority.LOW));
  }

  const sites = measureCpuDetail("taskBoard.findConstructionSites", () => room.find(FIND_MY_CONSTRUCTION_SITES));
  for (const site of sites.slice(0, 10)) {
    updateOrCreateTask(board, {
      id: taskId(room.name, "build", site.id),
      roomName: room.name,
      type: "build",
      priority: site.structureType === STRUCTURE_SPAWN ? TaskPriority.CRITICAL : TaskPriority.NORMAL,
      targetId: site.id,
      targetPos: memoryPosition(site.pos),
      resourceType: RESOURCE_ENERGY,
      amount: Math.max(1, site.progressTotal - site.progress),
      maxAssignments: 2,
      allowedRoles: WORKER_ROLES,
      expiresTick: Game.time + DEFAULT_TASK_TTL
    });
  }

  const repairTargets = measureCpuDetail("taskBoard.findRepairTargets", () => room.find(FIND_STRUCTURES, {
    filter: s => s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART
  })).slice(0, 10);
  for (const structure of repairTargets) {
    updateOrCreateTask(board, {
      id: taskId(room.name, "repair", structure.id),
      roomName: room.name,
      type: "repair",
      priority: TaskPriority.NORMAL,
      targetId: structure.id,
      targetPos: memoryPosition(structure.pos),
      resourceType: RESOURCE_ENERGY,
      amount: Math.max(1, structure.hitsMax - structure.hits),
      maxAssignments: 1,
      allowedRoles: WORKER_ROLES,
      expiresTick: Game.time + DEFAULT_TASK_TTL
    });
  }

  if (room.controller?.my) {
    updateOrCreateTask(board, {
      id: taskId(room.name, "upgrade", room.controller.id),
      roomName: room.name,
      type: "upgrade",
      priority: TaskPriority.LOW,
      targetId: room.controller.id,
      targetPos: memoryPosition(room.controller.pos),
      resourceType: RESOURCE_ENERGY,
      amount: 1000,
      maxAssignments: 3,
      allowedRoles: WORKER_ROLES,
      expiresTick: Game.time + DEFAULT_TASK_TTL
    });
  }

  const hostiles = measureCpuDetail("taskBoard.findHostiles", () => getActualHostileCreeps(room));
  for (const hostile of hostiles.slice(0, 5)) {
    updateOrCreateTask(board, {
      id: taskId(room.name, "defend", hostile.id),
      roomName: room.name,
      type: "defend",
      priority: TaskPriority.CRITICAL,
      targetId: hostile.id,
      targetPos: memoryPosition(hostile.pos),
      amount: hostile.hits,
      maxAssignments: 3,
      allowedRoles: MILITARY_ROLES,
      expiresTick: Game.time + DEFAULT_TASK_TTL
    });
  }

  const injuredAllies = measureCpuDetail("taskBoard.findInjuredAllies", () => room.find(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax }));
  for (const ally of injuredAllies.slice(0, 5)) {
    updateOrCreateTask(board, {
      id: taskId(room.name, "heal", ally.id),
      roomName: room.name,
      type: "heal",
      priority: TaskPriority.HIGH,
      targetId: ally.id,
      targetPos: memoryPosition(ally.pos),
      amount: ally.hitsMax - ally.hits,
      maxAssignments: 1,
      allowedRoles: ["healer"],
      expiresTick: Game.time + DEFAULT_TASK_TTL
    });
  }
}

function recomputeReservationTotals(task: CreepTask): void {
  task.assignedCreeps = Object.keys(task.reservations);
  task.reservedAmount = Object.values(task.reservations).reduce((sum, reservation) => sum + reservation.amount, 0);
  task.status = task.assignedCreeps.length > 0 ? "assigned" : "open";
}

function isKnownAllyDefendTarget(target: unknown): boolean {
  return Boolean(target && typeof target === "object" && "owner" in target && isKnownAllyOwned(target as Creep | Structure));
}

function isTargetStillValid(task: CreepTask): boolean {
  if (!task.targetId) return true;
  const target = Game.getObjectById(task.targetId);
  if (!target) return false;

  switch (task.type) {
    case "refillSpawn":
    case "refillExtension":
    case "refillTower":
    case "storeEnergy":
      return "store" in target && (target as AnyStoreStructure).store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    case "fillTerminalEnergy": {
      const room = "room" in target ? (target as StructureTerminal).room : Game.rooms[task.roomName];
      const request = room ? getTerminalEnergyExportRequest(room) : null;
      return Boolean(request && request.terminal.id === task.targetId);
    }
    case "build":
      return true;
    case "repair":
      return "hits" in target && (target as Structure).hits < (target as Structure).hitsMax;
    case "upgrade":
      return true;
    case "heal":
      return "hits" in target && (target as Creep).hits < (target as Creep).hitsMax;
    case "defend":
      return !isKnownAllyDefendTarget(target);
    default:
      return true;
  }
}

function cleanupBoard(board: RoomTaskBoardMemory, force = false): void {
  if (!force && board.lastCleanedTick === Game.time) return;
  board.lastCleanedTick = Game.time;
  let staleReservations = 0;

  for (const task of Object.values(board.tasks)) {
    for (const [creepName, reservation] of Object.entries(task.reservations)) {
      if (!Game.creeps[creepName] || Game.time > reservation.expiresTick) {
        delete task.reservations[creepName];
        staleReservations++;
      }
    }

    recomputeReservationTotals(task);

    if (Game.time > task.expiresTick || !isTargetStillValid(task)) {
      task.status = "invalid";
      board.stats.invalidated++;
      delete board.tasks[task.id];
      continue;
    }

    if (remainingAmount(task) <= 0 || task.assignedCreeps.length >= task.maxAssignments) {
      task.status = "assigned";
    }
  }

  board.stats.staleReservations = staleReservations;
}

function pruneStaleRoomBoards(activeRoomName?: string): void {
  const memory = getTaskMemory();

  for (const [roomName, board] of Object.entries(memory.rooms)) {
    if (roomName === activeRoomName || Game.rooms[roomName]) continue;

    const lastTouchedTick = Math.max(board.lastGeneratedTick ?? 0, board.lastCleanedTick ?? 0);
    if (lastTouchedTick > 0 && Game.time - lastTouchedTick > STALE_ROOM_BOARD_TTL) {
      delete memory.rooms[roomName];
    }
  }
}

function getCurrentAssignedTask(board: RoomTaskBoardMemory, creepName: string, assignedTaskId?: string): CreepTask | undefined {
  if (assignedTaskId) {
    const assigned = board.tasks[assignedTaskId];
    if (assigned?.reservations[creepName]) return assigned;
  }

  return Object.values(board.tasks).find(task => task.reservations[creepName]);
}

function shouldCheckForPreemption(ctx: CreepContext, current: CreepTask): boolean {
  const memory = ctx.memory as { assignedTaskPreemptCheckTick?: number };
  const lastCheck = memory.assignedTaskPreemptCheckTick ?? 0;
  const interval = current.priority >= TaskPriority.CRITICAL ? ASSIGNED_TASK_PREEMPTION_CHECK_INTERVAL * 2 : ASSIGNED_TASK_PREEMPTION_CHECK_INTERVAL;
  if (Game.time - lastCheck < interval) return false;
  memory.assignedTaskPreemptCheckTick = Game.time;
  return true;
}

function releaseReservation(board: RoomTaskBoardMemory, task: CreepTask, creepName: string): void {
  if (task.reservations[creepName]) {
    delete task.reservations[creepName];
    const creep = Game.creeps[creepName];
    if (creep) delete (creep.memory as { assignedTaskId?: string }).assignedTaskId;
    recomputeReservationTotals(task);
  }
}

function isAllowedTaskType(task: CreepTask, options: TaskAssignmentOptions): boolean {
  return !options.allowedTypes || options.allowedTypes.includes(task.type);
}

function assignTask(board: RoomTaskBoardMemory, ctx: CreepContext, options: TaskAssignmentOptions = {}): CreepTask | null {
  const current = getCurrentAssignedTask(board, ctx.creep.name, ctx.memory.assignedTaskId);
  if (current && isAllowedTaskType(current, options) && isTargetStillValid(current) && canPerformTask(ctx, current)) {
    if (!shouldCheckForPreemption(ctx, current)) {
      return current;
    }

    const highest = findBestTask(board, ctx, options);
    const delta = (highest?.priority ?? 0) - current.priority;
    const stickinessDelta = options.priorityStickinessDelta ?? DEFAULT_STICKINESS_DELTA;
    const criticalPreempt = (highest?.priority ?? 0) >= (options.preemptPriority ?? TaskPriority.CRITICAL);
    if (!highest || delta < stickinessDelta || !criticalPreempt) {
      return current;
    }
    releaseReservation(board, current, ctx.creep.name);
    board.stats.preemptions++;
  }

  const task = findBestTask(board, ctx, options);
  if (!task) return null;

  const amount = Math.min(Math.max(1, remainingAmount(task)), getAssignmentAmount(ctx.creep, task));
  ctx.memory.assignedTaskId = task.id;
  task.reservations[ctx.creep.name] = {
    creepName: ctx.creep.name,
    amount,
    assignedTick: Game.time,
    expiresTick: Game.time + DEFAULT_RESERVATION_TTL
  };
  task.updatedTick = Game.time;
  recomputeReservationTotals(task);
  board.stats.assigned++;
  return task;
}

function findBestTask(board: RoomTaskBoardMemory, ctx: CreepContext, options: TaskAssignmentOptions = {}): CreepTask | null {
  let best: CreepTask | null = null;
  let bestScore = -Infinity;

  for (const task of Object.values(board.tasks)) {
    if (!isAllowedTaskType(task, options)) continue;
    if (!canPerformTask(ctx, task)) continue;
    if (!isTargetStillValid(task)) continue;
    if (remainingAmount(task) <= 0) continue;
    if (task.assignedCreeps.length >= task.maxAssignments) continue;

    const distance = getTaskDistance(ctx.creep, task);
    const score = task.priority * 1000 - distance;
    if (score > bestScore) {
      best = task;
      bestScore = score;
    }
  }

  return best;
}

function getTaskDistance(creep: Creep, task: CreepTask): number {
  if (task.targetId) {
    const target = Game.getObjectById(task.targetId);
    if (target && "pos" in target) return creep.pos.getRangeTo((target as unknown as RoomObject).pos);
  }
  if (task.targetPos) {
    return creep.pos.getRangeTo(new RoomPosition(task.targetPos.x, task.targetPos.y, task.targetPos.roomName));
  }
  return 50;
}

function createDefendAction(ctx: CreepContext, target: Creep | Structure): CreepAction | null {
  if (isKnownAllyDefendTarget(target)) return null;

  const hasMelee = ctx.creep.getActiveBodyparts(ATTACK) > 0;
  const hasRanged = ctx.creep.getActiveBodyparts(RANGED_ATTACK) > 0;

  if (ctx.memory.role === "ranger" && hasRanged) return { type: "rangedAttack", target };
  if (hasMelee) return { type: "attack", target };
  if (hasRanged) return { type: "rangedAttack", target };
  return null;
}

function convertTaskToAction(task: CreepTask, ctx: CreepContext): CreepAction | null {
  if (!task.targetId) return null;
  const target = Game.getObjectById(task.targetId);
  if (!target) return null;

  switch (task.type) {
    case "refillSpawn":
    case "refillExtension":
    case "refillTower":
    case "fillTerminalEnergy":
    case "storeEnergy":
      return { type: "transfer", target: target as AnyStoreStructure, resourceType: RESOURCE_ENERGY };
    case "build":
      return { type: "build", target: target as ConstructionSite };
    case "repair":
      return { type: "repair", target: target as Structure };
    case "upgrade":
      return { type: "upgrade", target: target as StructureController };
    case "heal":
      return { type: "heal", target: target as Creep };
    case "defend":
      return createDefendAction(ctx, target as Creep | Structure);
    default:
      return null;
  }
}

export class TaskBoard {
  public isEnabled(): boolean {
    return getTaskMemory().enabled !== false;
  }

  public setEnabled(enabled: boolean): void {
    getTaskMemory().enabled = enabled;
  }

  public getAssignedAction(ctx: CreepContext, allowedTypes?: TaskType[]): CreepAction | null {
    if (!this.isEnabled()) return null;
    const board = getRoomBoard(ctx.room.name);
    measureCpuDetail("taskBoard.cleanup", () => cleanupBoard(board));
    measureCpuDetail("taskBoard.generate", () => generateTasks(ctx.room, board));

    const task = assignTask(board, ctx, { allowedTypes });
    if (!task) return null;
    return convertTaskToAction(task, ctx);
  }

  public getAssignedDeliveryAction(ctx: CreepContext): CreepAction | null {
    if (!this.isEnabled()) return null;
    const board = getRoomBoard(ctx.room.name);
    measureCpuDetail("taskBoard.cleanup", () => cleanupBoard(board));
    measureCpuDetail("taskBoard.generate", () => generateTasks(ctx.room, board));

    const task = assignTask(board, ctx, {
      allowedTypes: ["refillSpawn", "refillExtension", "refillTower", "fillTerminalEnergy", "storeEnergy"],
      preemptPriority: TaskPriority.NORMAL,
      priorityStickinessDelta: 25
    });
    if (!task) return null;

    const action = convertTaskToAction(task, ctx);
    if (action?.type === "transfer") return action;
    return null;
  }

  public refreshRoom(room: Room): void {
    if (!this.isEnabled()) return;
    pruneStaleRoomBoards(room.name);
    const board = getRoomBoard(room.name);
    measureCpuDetail("taskBoard.cleanup", () => cleanupBoard(board));
    measureCpuDetail("taskBoard.generate", () => generateTasks(room, board));
  }

  public releaseCreep(creepName: string, roomName?: string): void {
    const memory = getTaskMemory();
    const boards = roomName ? [memory.rooms[roomName]].filter(Boolean) : Object.values(memory.rooms);
    for (const board of boards) {
      for (const task of Object.values(board.tasks)) {
        releaseReservation(board, task, creepName);
      }
    }
  }

  public clear(roomName?: string): void {
    const memory = getTaskMemory();
    if (roomName) {
      delete memory.rooms[roomName];
    } else {
      memory.rooms = {};
    }
  }

  public getStats(roomName: string): TaskBoardStats | null {
    const room = Game.rooms[roomName];
    if (!room) return null;
    const board = getRoomBoard(roomName);
    measureCpuDetail("taskBoard.cleanup", () => cleanupBoard(board, true));
    measureCpuDetail("taskBoard.generate", () => generateTasks(room, board));
    const tasks = Object.values(board.tasks);
    return {
      roomName,
      enabled: this.isEnabled(),
      open: tasks.filter(t => t.status === "open").length,
      assigned: tasks.filter(t => t.status === "assigned").length,
      complete: tasks.filter(t => t.status === "complete").length,
      invalid: tasks.filter(t => t.status === "invalid").length,
      reservations: tasks.reduce((sum, t) => sum + t.assignedCreeps.length, 0),
      staleReservations: board.stats.staleReservations,
      preemptions: board.stats.preemptions
    };
  }

  public describe(roomName: string): string {
    const room = Game.rooms[roomName];
    if (!room) return `Room ${roomName} is not visible`;
    const board = getRoomBoard(roomName);
    cleanupBoard(board, true);
    generateTasks(room, board);
    const lines = [`Tasks for ${roomName} (enabled=${this.isEnabled()})`];
    for (const task of Object.values(board.tasks).sort((a, b) => b.priority - a.priority)) {
      lines.push(`${task.id} ${task.type} p=${task.priority} amount=${task.amount} reserved=${task.reservedAmount} creeps=${task.assignedCreeps.join(",") || "-"}`);
    }
    return lines.join("\n");
  }

  public describeAssignments(roomName: string): string {
    const board = getRoomBoard(roomName);
    cleanupBoard(board, true);
    const lines = [`Task assignments for ${roomName}`];
    for (const task of Object.values(board.tasks)) {
      for (const reservation of Object.values(task.reservations)) {
        lines.push(`${reservation.creepName} -> ${task.type} ${task.targetId ?? "room"} amount=${reservation.amount} expires=${reservation.expiresTick}`);
      }
    }
    return lines.join("\n");
  }
}

export const taskBoard = new TaskBoard();
