import { taskBoard } from "@ralphschuler/screeps-roles";
import { Command } from "../commandRegistry";

export class TaskCommands {
  @Command({
    name: "tasks",
    description: "Show room creep task queue",
    usage: "tasks(roomName?)",
    examples: ["tasks('W1N1')"],
    category: "Tasks"
  })
  public tasks(roomName?: string): string {
    const targetRoom = roomName ?? Object.values(Game.rooms).find(room => room.controller?.my)?.name;
    if (!targetRoom) return "No visible owned room found. Pass a room name.";
    return taskBoard.describe(targetRoom);
  }

  @Command({
    name: "taskAssignments",
    description: "Show creep task reservations for a room",
    usage: "taskAssignments(roomName?)",
    examples: ["taskAssignments('W1N1')"],
    category: "Tasks"
  })
  public taskAssignments(roomName?: string): string {
    const targetRoom = roomName ?? Object.values(Game.rooms).find(room => room.controller?.my)?.name;
    if (!targetRoom) return "No visible owned room found. Pass a room name.";
    return taskBoard.describeAssignments(targetRoom);
  }

  @Command({
    name: "clearTasks",
    description: "Clear creep task queue/reservations",
    usage: "clearTasks(roomName?)",
    examples: ["clearTasks('W1N1')", "clearTasks()"],
    category: "Tasks"
  })
  public clearTasks(roomName?: string): string {
    taskBoard.clear(roomName);
    return roomName ? `Cleared task board for ${roomName}` : "Cleared all task boards";
  }
}
